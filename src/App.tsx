// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createCloseAccountInstruction,
} from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "./ui.css";

type Lang = "fi" | "en";

type EmptyTokenAccount = {
  pubkey: PublicKey;
  programId: PublicKey; // TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
  mint: string;
  lamports: number; // rent locked in the token account (reclaimed when closing)
};

const WSOL_MINT = "So11111111111111111111111111111111111111112";

// Env (Vite)
const RPC_URL = String(import.meta.env.VITE_RPC_URL ?? "");
const FEE_RECIPIENT_STR = String(import.meta.env.VITE_FEE_RECIPIENT ?? "");
const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300); // 300 = 3.00%
const APP_NAME = String(import.meta.env.VITE_APP_NAME ?? "Solana Rent Claimer");
const APP_URL = String(import.meta.env.VITE_APP_URL ?? "https://sol-rent-claimer.vercel.app"); // set this in Vercel for perfect share links

function shortPk(s: string, a = 4, b = 4) {
  if (!s) return "";
  return `${s.slice(0, a)}…${s.slice(-b)}`;
}

function lamportsToSol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL;
}

function fmtSol(sol: number | null | undefined, decimals = 4) {
  if (sol === null || sol === undefined || Number.isNaN(sol)) return "—";
  return `${sol.toFixed(decimals)} SOL`;
}

function bpsToPct(bps: number) {
  return (bps / 100).toFixed(2);
}

function clampInt(n: number, fallback: number) {
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

const TEXT: Record<Lang, Record<string, string>> = {
  fi: {
    subtitle: "Skannaa tyhjät token-tilit ja vapauta niihin lukittu SOL.",
    // Landing / SEO copy
    h1: "Reclaimaa SOL, joka on lukittuna vanhoihin token-tileihin",
    lead:
      "Skannaa tyhjät SPL- ja Token-2022 -tilit ja palauta rent-lukittu SOL. Non-custodial — allekirjoitat itse. Fee vain onnistumisesta.",
    bullets1: "Löytää tyhjät token-tilit, joihin rent on jäänyt",
    bullets2: "Toimii Phantomilla",
    bullets3: "Ei seed phrasea. Ei custodyä.",
    bullets4: "Näyttää 0 jos mitään ei löydy",
    cta: "Skannaa Wallet",

    safetyTitle: "Turvallisuus & läpinäkyvyys",
    safety1: "Ei custodyä: sovellus ei voi siirtää varojasi ilman allekirjoitustasi.",
    safety2: "Älä koskaan syötä seed phrasea — sovellus ei kysy sitä.",
    closesOnly: "Sulkee vain",
    closesOnly1: "Tyhjät SPL- & Token-2022 token-tilit (saldo 0)",
    closesOnly2: "Vain tilit, joiden omistaja on sinun wallet",
    neverCloses: "Ei sulje",
    neverCloses1: "WSOL-tilit (So111…)",
    neverCloses2: "Tilit joissa token-saldo (≠ 0)",
    feeLine:
      "Fee: {pct}% onnistuneesti palautetusta SOL:sta (per batch). Fee veloitetaan vain onnistuneista claim-tx:istä.",

    scan: "Skannaa",
    claim: "Claim",
    selectAll: "Valitse kaikki",
    clearSelection: "Poista valinnat",

    wallet: "Lompakko",
    walletBalance: "Wallet balance",
    emptyAccounts: "Tyhjiä tilejä",
    rentPerAcc: "Rent / tili",
    estReturn: "Arvioitu palautus",
    status: "Status",
    selected: "Valittu",
    showList: "Näytä lista",
    hideList: "Piilota lista",

    notConnected: "Ei yhdistetty.",
    scanning: "Skannataan…",
    building: "Rakennetaan claim…",
    claiming: "Claim käynnissä…",
    done: "Valmis.",
    noAccounts: "Löytyi 0 tyhjää token-tiliä.",
    found: "Löytyi {n} tyhjää token-tiliä.",
    tip:
      "Vinkki: Jos tulos on 0, wallet on todennäköisesti jo puhdas. Claim tekee batchina ja pyytää allekirjoitusta Phantomissa.",

    envWarn: "VITE_FEE_RECIPIENT puuttuu — fee’tä ei veloiteta ennen kuin se on asetettu.",
    rpcWarn: "VITE_RPC_URL puuttuu — käytetään wallet-adapterin Connectionia (voi olla rajoituksia).",

    // Share
    shareTitle: "Jaettavaa (onnistunut reclaim)",
    shareLine: "Palautit {x} SOL rentistä.",
    copyText: "Kopioi teksti",
    shareX: "Jaa X:ään",
    copied: "Kopioitu!",
  },
  en: {
    subtitle: "Scan empty token accounts and reclaim the locked SOL.",
    // Landing / SEO copy
    h1: "Reclaim SOL locked in old token accounts",
    lead:
      "Scan empty SPL & Token-2022 accounts and reclaim locked rent. Non-custodial — you sign everything. Fee only on success.",
    bullets1: "Finds empty token accounts holding rent",
    bullets2: "Works with Phantom",
    bullets3: "No seed phrase. No custody.",
    bullets4: "Shows 0 if nothing is found",
    cta: "Scan Wallet",

    safetyTitle: "Safety & transparency",
    safety1: "No custody: the app cannot move funds without your signature.",
    safety2: "Never enter your seed phrase — this app will never ask for it.",
    closesOnly: "Closes only",
    closesOnly1: "Empty SPL & Token-2022 token accounts (balance 0)",
    closesOnly2: "Only accounts owned by your wallet",
    neverCloses: "Never closes",
    neverCloses1: "WSOL accounts (So111…)",
    neverCloses2: "Accounts with token balance (≠ 0)",
    feeLine:
      "Fee: {pct}% of successfully reclaimed SOL (per batch). Fee is charged only on successful claim transactions.",

    scan: "Scan",
    claim: "Claim",
    selectAll: "Select all",
    clearSelection: "Clear selection",

    wallet: "Wallet",
    walletBalance: "Wallet balance",
    emptyAccounts: "Empty accounts",
    rentPerAcc: "Rent / account",
    estReturn: "Estimated return",
    status: "Status",
    selected: "Selected",
    showList: "Show list",
    hideList: "Hide list",

    notConnected: "Not connected.",
    scanning: "Scanning…",
    building: "Building claim…",
    claiming: "Claiming…",
    done: "Done.",
    noAccounts: "Found 0 empty token accounts.",
    found: "Found {n} empty token accounts.",
    tip:
      "Tip: If result is 0, your wallet is likely already clean. Claim runs in batches and asks for Phantom signatures.",

    envWarn: "VITE_FEE_RECIPIENT missing — no fee will be charged until it is set.",
    rpcWarn: "VITE_RPC_URL missing — using wallet-adapter Connection (may be rate-limited).",

    // Share
    shareTitle: "Share (successful reclaim)",
    shareLine: "You reclaimed {x} SOL from rent.",
    copyText: "Copy text",
    shareX: "Share on X",
    copied: "Copied!",
  },
};

function formatTemplate(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

export default function App() {
  const { connection: walletConnection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  // Optional: use custom RPC (Helius etc.) if provided
  const rpcConnection = useMemo(() => {
    if (!RPC_URL) return walletConnection;
    try {
      return new Connection(RPC_URL, "confirmed");
    } catch {
      return walletConnection;
    }
  }, [walletConnection]);

  const [lang, setLang] = useState<Lang>("fi");
  const t = TEXT[lang];

  const [status, setStatus] = useState<string>(t.notConnected);
  const [loadingScan, setLoadingScan] = useState(false);
  const [loadingClaim, setLoadingClaim] = useState(false);

  const [walletSol, setWalletSol] = useState<number | null>(null);

  const [empties, setEmpties] = useState<EmptyTokenAccount[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [listOpen, setListOpen] = useState(false);
  const [trustOpen, setTrustOpen] = useState(true);

  // Share loop state
  const [lastReclaimedSol, setLastReclaimedSol] = useState<number | null>(null);
  const [lastShareText, setLastShareText] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Keep status text in sync when language changes
  useEffect(() => {
    setStatus((prev) => {
      if (!connected) return t.notConnected;
      return prev || t.done;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Refresh balance + subscribe (NO .then — onAccountChange returns number)
  useEffect(() => {
    let stop = false;
    let subId: number | null = null;

    async function refreshBalance() {
      if (!publicKey) {
        setWalletSol(null);
        return;
      }
      try {
        const bal = await rpcConnection.getBalance(publicKey, "confirmed");
        if (!stop) setWalletSol(lamportsToSol(bal));
      } catch {
        if (!stop) setWalletSol(null);
      }
    }

    refreshBalance();

    if (publicKey) {
      try {
        subId = rpcConnection.onAccountChange(
          publicKey,
          () => {
            if (!stop) refreshBalance();
          },
          "confirmed"
        );
      } catch {
        subId = null;
      }
    }

    return () => {
      stop = true;
      if (subId !== null) {
        try {
          rpcConnection.removeAccountChangeListener(subId);
        } catch {}
      }
    };
  }, [rpcConnection, publicKey]);

  // Derived numbers
  const selectedList = useMemo(() => {
    return empties.filter((e) => selected[e.pubkey.toBase58()]);
  }, [empties, selected]);

  const grossLamportsSelected = useMemo(() => {
    return selectedList.reduce((sum, e) => sum + e.lamports, 0);
  }, [selectedList]);

  const grossSolSelected = useMemo(
    () => lamportsToSol(grossLamportsSelected),
    [grossLamportsSelected]
  );

  const avgRentLamportsAll = useMemo(() => {
    if (empties.length === 0) return null;
    const total = empties.reduce((s, e) => s + e.lamports, 0);
    return Math.floor(total / empties.length);
  }, [empties]);

  const rentPerAccSol = useMemo(() => {
    if (avgRentLamportsAll === null) return null;
    return lamportsToSol(avgRentLamportsAll);
  }, [avgRentLamportsAll]);

  const feeRecipient = useMemo(() => {
    try {
      return FEE_RECIPIENT_STR ? new PublicKey(FEE_RECIPIENT_STR) : null;
    } catch {
      return null;
    }
  }, []);

  const feeLamportsSelected = useMemo(() => {
    const bps = clampInt(FEE_BPS, 0);
    if (bps <= 0) return 0;
    return Math.floor((grossLamportsSelected * bps) / 10_000);
  }, [grossLamportsSelected]);

  const feeSolSelected = useMemo(
    () => lamportsToSol(feeLamportsSelected),
    [feeLamportsSelected]
  );

  // Conservative “net = gross - fee” (ignores network fee)
  const estNetSolSelected = useMemo(() => {
    const net = grossSolSelected - feeSolSelected;
    return net < 0 ? 0 : net;
  }, [grossSolSelected, feeSolSelected]);

  function toggleLanguage() {
    setLang((p) => (p === "fi" ? "en" : "fi"));
  }

  function clearSelection() {
    setSelected({});
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const e of empties) next[e.pubkey.toBase58()] = true;
    setSelected(next);
  }

  async function scan() {
    if (!publicKey) {
      setStatus(t.notConnected);
      return;
    }

    setLoadingScan(true);
    setStatus(t.scanning);

    try {
      const owner = publicKey;

      const [spl, t22] = await Promise.all([
        rpcConnection.getParsedTokenAccountsByOwner(
          owner,
          { programId: TOKEN_PROGRAM_ID },
          "confirmed"
        ),
        rpcConnection.getParsedTokenAccountsByOwner(
          owner,
          { programId: TOKEN_2022_PROGRAM_ID },
          "confirmed"
        ),
      ]);

      const parse = (
        resp: typeof spl,
        programId: PublicKey
      ): EmptyTokenAccount[] => {
        const out: EmptyTokenAccount[] = [];
        for (const it of resp.value) {
          const pubkey = it.pubkey;
          const accAny: any = it.account;
          const lamports: number =
            typeof accAny.lamports === "number" ? accAny.lamports : 0;

          const parsed: any = accAny.data?.parsed;
          const info: any = parsed?.info;
          const mint: string = String(info?.mint ?? "");
          const tokenAmount: any = info?.tokenAmount;

          const isEmpty =
            tokenAmount &&
            (tokenAmount.amount === "0" ||
              tokenAmount.uiAmount === 0 ||
              tokenAmount.uiAmountString === "0");

          if (!mint) continue;
          if (mint === WSOL_MINT) continue;
          if (!isEmpty) continue;

          out.push({
            pubkey,
            programId,
            mint,
            lamports,
          });
        }
        return out;
      };

      const list = [...parse(spl, TOKEN_PROGRAM_ID), ...parse(t22, TOKEN_2022_PROGRAM_ID)];

      list.sort((a, b) => b.lamports - a.lamports);

      setEmpties(list);
      setSelected({});

      if (list.length === 0) setStatus(t.noAccounts);
      else setStatus(formatTemplate(t.found, { n: list.length }));
    } catch (e: any) {
      setStatus(`Error: ${String(e?.message ?? e)}`);
    } finally {
      setLoadingScan(false);
    }
  }

  function toggleSelected(pk58: string) {
    setSelected((prev) => ({ ...prev, [pk58]: !prev[pk58] }));
  }

  function buildShareText(reclaimedSol: number) {
    // Keep it short and trust-heavy
    const x = reclaimedSol.toFixed(4);
    if (lang === "fi") {
      return `Reclaimasin juuri ${x} SOL rentistä tyhjistä token-tileistä Solanassa.\n\nNon-custodial skanneri (fee vain onnistumisesta):\n${APP_URL}`;
    }
    return `I just reclaimed ${x} SOL from rent in empty token accounts on Solana.\n\nNon-custodial scanner (fee only on success):\n${APP_URL}`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback: do nothing
    }
  }

  function shareOnX(text: string) {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function claimSelected() {
    if (!publicKey) {
      setStatus(t.notConnected);
      return;
    }
    if (selectedList.length === 0) return;

    setLoadingClaim(true);
    setStatus(t.building);

    // reset last share
    setLastReclaimedSol(null);
    setLastShareText("");
    setCopied(false);

    try {
      const payer = publicKey;

      const BATCH_SIZE = 8;

      const bps = clampInt(FEE_BPS, 0);
      const takeFee = bps > 0 && feeRecipient !== null;

      let totalReclaimedLamports = 0;

      for (let i = 0; i < selectedList.length; i += BATCH_SIZE) {
        const batch = selectedList.slice(i, i + BATCH_SIZE);

        // "Reclaimed" is rent lamports in the closed token accounts (what goes back to payer)
        const reclaimedLamports = batch.reduce((s, a) => s + a.lamports, 0);
        const feeLamports = takeFee ? Math.floor((reclaimedLamports * bps) / 10_000) : 0;

        const tx = new Transaction();
        tx.feePayer = payer;

        // Close accounts (reclaim rent)
        for (const acc of batch) {
          tx.add(
            createCloseAccountInstruction(
              acc.pubkey,
              payer,
              payer,
              [],
              acc.programId
            )
          );
        }

        // Fee transfer (only if configured)
        if (feeLamports > 0 && feeRecipient) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: payer,
              toPubkey: feeRecipient,
              lamports: feeLamports,
            })
          );
        }

        setStatus(
          `${t.claiming} (${i + 1}-${Math.min(i + batch.length, selectedList.length)}/${selectedList.length})`
        );

        const sig = await sendTransaction(tx, rpcConnection, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await rpcConnection.confirmTransaction(sig, "confirmed");

        totalReclaimedLamports += reclaimedLamports;
      }

      const reclaimedSol = lamportsToSol(totalReclaimedLamports);
      if (reclaimedSol > 0) {
        const shareText = buildShareText(reclaimedSol);
        setLastReclaimedSol(reclaimedSol);
        setLastShareText(shareText);
      }

      setStatus(t.done);

      // Refresh scan after claim
      await scan();
    } catch (e: any) {
      setStatus(`Error: ${String(e?.message ?? e)}`);
    } finally {
      setLoadingClaim(false);
    }
  }

  const walletLabel = useMemo(() => {
    if (!publicKey) return t.notConnected;
    return shortPk(publicKey.toBase58(), 4, 4);
  }, [publicKey, t.notConnected]);

  const feePct = useMemo(() => bpsToPct(clampInt(FEE_BPS, 0)), []);

  // Trust warnings for env
  const envWarnings = useMemo(() => {
    const warns: string[] = [];
    if (!RPC_URL) warns.push(t.rpcWarn);
    if (!FEE_RECIPIENT_STR) warns.push(t.envWarn);
    return warns;
  }, [t.rpcWarn, t.envWarn]);

  const canScan = connected && !loadingScan && !loadingClaim;
  const canClaim = connected && !loadingScan && !loadingClaim && selectedList.length > 0;

  return (
    <div className="page">
      <div className="bgGlow" />

      <div className="shell">
        {/* Top / language */}
        <div className="hero">
          <div>
            <div className="title">{APP_NAME}</div>
            <div className="sub">{t.subtitle}</div>
          </div>

          <button className="pill" onClick={toggleLanguage} title="Language">
            {lang.toUpperCase()}
          </button>
        </div>

        {/* Landing/SEO section (above the app actions) */}
        <div className="panel topPanel">
          <div className="panelBody">
            <div className="landing">
              <h1 className="landingH1">{t.h1}</h1>
              <p className="landingLead">{t.lead}</p>

              <div className="landingGrid">
                <ul className="landingBullets">
                  <li>{t.bullets1}</li>
                  <li>{t.bullets2}</li>
                  <li>{t.bullets3}</li>
                  <li>{t.bullets4}</li>
                </ul>

                <div className="landingCtaBox">
                  <div className="landingCtaTitle">{t.wallet}</div>
                  <div className="landingCtaRow">
                    <WalletMultiButton className="walletBtn" />
                    <button className="btn" onClick={scan} disabled={!canScan}>
                      {loadingScan ? "…" : t.cta}
                    </button>
                  </div>
                  <div className="fine">
                    {formatTemplate(t.feeLine, { pct: feePct })}
                  </div>
                </div>
              </div>

              {envWarnings.length > 0 && (
                <div className="fine" style={{ marginTop: 10 }}>
                  {envWarnings.map((w) => (
                    <div key={w} className="warn">
                      {w}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trust layer */}
        <div className="panel topPanel">
          <div className="panelHead">
            <button className="collapseBtn" onClick={() => setTrustOpen((p) => !p)}>
              {t.safetyTitle}
              <span className="collapseIcon">{trustOpen ? "—" : "+"}</span>
            </button>
          </div>

          {trustOpen && (
            <div className="panelBody">
              <ul className="bullets">
                <li>{t.safety1}</li>
                <li>{t.safety2}</li>
              </ul>

              <div className="twoCols">
                <div className="miniCard">
                  <div className="miniTitle">{t.closesOnly}</div>
                  <ul className="miniList">
                    <li>{t.closesOnly1}</li>
                    <li>{t.closesOnly2}</li>
                  </ul>
                </div>

                <div className="miniCard">
                  <div className="miniTitle">{t.neverCloses}</div>
                  <ul className="miniList">
                    <li>{t.neverCloses1}</li>
                    <li>{t.neverCloses2}</li>
                  </ul>
                </div>
              </div>

              <div className="fine">
                {formatTemplate(t.feeLine, { pct: feePct })}
              </div>
            </div>
          )}
        </div>

        {/* Main app */}
        <div className="panel">
          <div className="toolbar">
            <div className="leftTools">
              <button className="btn" onClick={scan} disabled={!canScan}>
                {loadingScan ? "…" : t.scan}
              </button>

              <button className="btn" onClick={claimSelected} disabled={!canClaim}>
                {t.claim} ({selectedList.length})
              </button>

              <button className="btn" onClick={selectAll} disabled={!connected || empties.length === 0 || loadingScan || loadingClaim}>
                {t.selectAll}
              </button>

              <button className="btn" onClick={clearSelection} disabled={loadingScan || loadingClaim}>
                {t.clearSelection}
              </button>
            </div>

            <div className="rightTools">
              <div className="walletTag">
                {t.wallet}: <span className="mono">{connected ? walletLabel : t.notConnected}</span>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="card">
              <div className="cardLabel">{t.walletBalance}</div>
              <div className="cardValue">{walletSol === null ? "—" : fmtSol(walletSol, 4)}</div>
            </div>

            <div className="card">
              <div className="cardLabel">{t.emptyAccounts}</div>
              <div className="cardValue">{empties.length}</div>
            </div>

            <div className="card">
              <div className="cardLabel">{t.rentPerAcc}</div>
              <div className="cardValue">{rentPerAccSol === null ? "—" : fmtSol(rentPerAccSol, 6)}</div>
            </div>

            <div className="card">
              <div className="cardLabel">{t.estReturn}</div>
              <div className="cardValue">
                {selectedList.length === 0 ? "—" : fmtSol(estNetSolSelected, 4)}
              </div>
              {selectedList.length > 0 && (
                <div className="cardSub">
                  {t.selected}: {selectedList.length} (gross {fmtSol(grossSolSelected, 6)} • fee {fmtSol(feeSolSelected, 6)})
                </div>
              )}
            </div>
          </div>

          <div className="status">
            <b>{t.status}:</b> {connected ? status : t.notConnected}
          </div>

          {/* Share loop box (shows after successful claim) */}
          {lastReclaimedSol !== null && lastReclaimedSol > 0 && (
            <div className="panelBody" style={{ marginTop: 10 }}>
              <div className="miniCard">
                <div className="miniTitle">{t.shareTitle}</div>
                <div className="fine" style={{ marginTop: 6 }}>
                  {formatTemplate(t.shareLine, { x: lastReclaimedSol.toFixed(4) })}
                </div>

                <div className="shareBox">
                  <textarea
                    className="shareText"
                    value={lastShareText}
                    readOnly
                    rows={4}
                  />
                  <div className="shareActions">
                    <button className="btn small" onClick={() => copyToClipboard(lastShareText)}>
                      {copied ? t.copied : t.copyText}
                    </button>
                    <button className="btn small" onClick={() => shareOnX(lastShareText)}>
                      {t.shareX}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="listRow">
            <div className="hint">{t.tip}</div>
            <button className="btn small" onClick={() => setListOpen((p) => !p)} disabled={empties.length === 0}>
              {listOpen ? t.hideList : t.showList}
            </button>
          </div>

          {listOpen && empties.length > 0 && (
            <div className="list">
              {empties.map((e) => {
                const id = e.pubkey.toBase58();
                const isSel = !!selected[id];
                const programName = e.programId.equals(TOKEN_2022_PROGRAM_ID) ? "Token2022" : "SPL";
                return (
                  <label key={id} className="row">
                    <input type="checkbox" checked={isSel} onChange={() => toggleSelected(id)} />
                    <div className="rowMain">
                      <div className="rowPk mono">{shortPk(id, 10, 10)}</div>
                      <div className="rowMeta">
                        Program: <b>{programName}</b> • mint{" "}
                        <span className="mono">{shortPk(e.mint, 6, 4)}</span>
                      </div>
                    </div>
                    <div className="rowRight mono">{fmtSol(lamportsToSol(e.lamports), 6)}</div>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
