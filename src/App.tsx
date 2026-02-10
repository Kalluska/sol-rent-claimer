// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
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
  programId: PublicKey;
  mint: PublicKey;
  lamports: number; // what you get back on close
};

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// ENV (optional)
const APP_NAME = import.meta.env.VITE_APP_NAME ?? "Solana Rent Claimer";
const FEE_RECIPIENT_STR = (import.meta.env.VITE_FEE_RECIPIENT ?? "").trim();
const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300); // 300 = 3.00%

const FEE_RECIPIENT = (() => {
  try {
    return FEE_RECIPIENT_STR ? new PublicKey(FEE_RECIPIENT_STR) : null;
  } catch {
    return null;
  }
})();

const TEXT: Record<Lang, any> = {
  fi: {
    subtitle: "Skannaa tyhjät SPL / Token-2022 -token-tilit ja palauta niihin lukittu SOL.",
    safetyTitle: "Turvallisuus & läpinäkyvyys",
    safetyBullets: [
      "Ei custodyä: appi ei voi siirtää varoja ilman allekirjoitustasi.",
      "Älä koskaan syötä seed phrasea — tämä sovellus ei pyydä sitä.",
      "Sulkee vain tyhjät token-tilit (saldo 0) omistamastasi lompakosta.",
    ],
    closesOnly: "Sulkee vain",
    neverCloses: "Ei sulje",
    closesOnlyBullets: ["Tyhjät SPL & Token-2022 token-tilit (saldo 0)", "Vain tilit, joiden owner on sinun wallet"],
    neverClosesBullets: ["WSOL-tilit (So111…)", "Tilit joissa token-saldoa (≠ 0)"],
    feeLine: (feePct: string) =>
      `Fee: ${feePct} palautetusta SOL:sta (per batch). Fee veloitetaan vain onnistuneissa claim-transaktioissa.`,
    connect: "Yhdistä lompakko",
    scan: "Skannaa",
    claim: (n: number) => `Claim (${n})`,
    selectAll: "Valitse kaikki",
    clear: "Poista valinnat",
    hideList: "Piilota lista",
    showList: "Näytä lista",
    wallet: "Lompakko",
    walletBalance: "Wallet balance",
    emptyAccounts: "Tyhjiä tilejä",
    rentPerAcc: "Rent / tili",
    estReturn: "Arvioitu palautus",
    status: "Status",
    idleStatus: "—",
    found: (n: number) => `Löytyi ${n} tyhjää token-tiliä.`,
    noWallet: "Yhdistä lompakko ensin.",
    scanning: "Skannataan…",
    scanErr: (msg: string) => `Virhe skannauksessa: ${msg}`,
    claiming: "Claim käynnissä… Phantom pyytää allekirjoituksia.",
    claimDone: (sig: string) => `Valmis. Tx: ${sig}`,
    claimErr: (msg: string) => `Claim epäonnistui: ${msg}`,
    selected: (n: number, gross: string, fee: string, net: string) =>
      `Valittu: ${n} (gross ${gross} SOL · fee ${fee} SOL · net ${net} SOL)`,
    tip: "Vinkki: claim tehdään batcheina ja näyttää edistymisen. Jos tulos on 0, wallet on todennäköisesti jo puhdas.",
    program: "Ohjelma",
    mint: "mint",
    previewNote: "Näytetään vain ensimmäiset 50 riviä listassa (UI-syistä).",
  },
  en: {
    subtitle: "Scan empty SPL / Token-2022 token accounts and reclaim the SOL locked as rent.",
    safetyTitle: "Safety & transparency",
    safetyBullets: [
      "Non-custodial: the app cannot move funds without your signature.",
      "Never enter your seed phrase — this app will never ask for it.",
      "Only closes empty token accounts (balance 0) owned by your wallet.",
    ],
    closesOnly: "Closes only",
    neverCloses: "Never closes",
    closesOnlyBullets: ["Empty SPL & Token-2022 token accounts (balance 0)", "Only accounts owned by your wallet"],
    neverClosesBullets: ["WSOL accounts (So111…)", "Accounts with token balance (≠ 0)"],
    feeLine: (feePct: string) =>
      `Fee: ${feePct} of successfully reclaimed SOL (per batch). Fee is charged only on successful claim transactions.`,
    connect: "Connect wallet",
    scan: "Scan",
    claim: (n: number) => `Claim (${n})`,
    selectAll: "Select all",
    clear: "Clear selection",
    hideList: "Hide list",
    showList: "Show list",
    wallet: "Wallet",
    walletBalance: "Wallet balance",
    emptyAccounts: "Empty accounts",
    rentPerAcc: "Rent / account",
    estReturn: "Estimated return",
    status: "Status",
    idleStatus: "—",
    found: (n: number) => `Found ${n} empty token accounts.`,
    noWallet: "Please connect a wallet first.",
    scanning: "Scanning…",
    scanErr: (msg: string) => `Scan error: ${msg}`,
    claiming: "Claim in progress… Phantom will request signatures.",
    claimDone: (sig: string) => `Done. Tx: ${sig}`,
    claimErr: (msg: string) => `Claim failed: ${msg}`,
    selected: (n: number, gross: string, fee: string, net: string) =>
      `Selected: ${n} (gross ${gross} SOL · fee ${fee} SOL · net ${net} SOL)`,
    tip: "Tip: claim runs in batches and shows progress. If result is 0, your wallet is likely already clean.",
    program: "Program",
    mint: "mint",
    previewNote: "Showing only first 50 rows in the list (UI).",
  },
};

function shortPk(pk: string, a = 4, b = 4) {
  if (pk.length <= a + b + 3) return pk;
  return `${pk.slice(0, a)}…${pk.slice(-b)}`;
}

function lamportsToSol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL;
}

function fmtSol(x: number) {
  // stable, no scientific notation for small values
  if (!Number.isFinite(x)) return "0.0000";
  return x.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function clampErr(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.length > 240 ? msg.slice(0, 240) + "…" : msg;
}

export default function App() {
  const { connection } = useConnection();
  const { publicKey, connected, signTransaction } = useWallet();

  const [lang, setLang] = useState<Lang>("fi");
  const t = TEXT[lang];

  const [showTrust, setShowTrust] = useState(true);
  const [showList, setShowList] = useState(true);

  const [walletSol, setWalletSol] = useState<number | null>(null);

  const [empties, setEmpties] = useState<EmptyTokenAccount[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [status, setStatus] = useState<string>(t.idleStatus);
  const [loading, setLoading] = useState(false);

  const maxList = 50;

  const feePct = useMemo(() => {
    const pct = Math.max(0, Math.min(10000, Number.isFinite(FEE_BPS) ? FEE_BPS : 0)) / 100;
    return `${pct.toFixed(2)}%`;
  }, []);

  const selectedAccounts = useMemo(() => {
    const sel = empties.filter((e) => selected[e.pubkey.toBase58()]);
    return sel;
  }, [empties, selected]);

  const grossLamportsSelected = useMemo(() => {
    return selectedAccounts.reduce((sum, a) => sum + a.lamports, 0);
  }, [selectedAccounts]);

  const feeLamportsSelected = useMemo(() => {
    if (!FEE_RECIPIENT || !Number.isFinite(FEE_BPS) || FEE_BPS <= 0) return 0;
    return Math.floor((grossLamportsSelected * FEE_BPS) / 10_000);
  }, [grossLamportsSelected]);

  const netLamportsSelected = useMemo(() => {
    return Math.max(0, grossLamportsSelected - feeLamportsSelected);
  }, [grossLamportsSelected, feeLamportsSelected]);

  const perAccLamports = useMemo(() => {
    if (empties.length === 0) return null;
    const avg = Math.round(empties.reduce((s, a) => s + a.lamports, 0) / empties.length);
    return avg;
  }, [empties]);

  // Refresh wallet balance when connected changes
  useEffect(() => {
    let stop = false;

    async function refreshBalance() {
      if (!publicKey) {
        setWalletSol(null);
        return;
      }
      try {
        const bal = await connection.getBalance(publicKey, "confirmed");
        if (!stop) setWalletSol(lamportsToSol(bal));
      } catch {
        if (!stop) setWalletSol(null);
      }
    }

    refreshBalance();

    // onAccountChange returns number (subscription id), not a Promise
    let subId: number | null = null;
    if (publicKey) {
      try {
        subId = connection.onAccountChange(publicKey, () => refreshBalance(), "confirmed");
      } catch {
        subId = null;
      }
    }

    return () => {
      stop = true;
      if (subId != null) {
        try {
          connection.removeAccountChangeListener(subId);
        } catch {
          // ignore
        }
      }
    };
  }, [connection, publicKey]);

  async function scan() {
    if (!publicKey) {
      setStatus(t.noWallet);
      return;
    }
    setLoading(true);
    setStatus(t.scanning);

    try {
      // Token Program (SPL)
      const spl = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_PROGRAM_ID });
      // Token-2022 Program
      const t22 = await connection.getParsedTokenAccountsByOwner(publicKey, { programId: TOKEN_2022_PROGRAM_ID });

      const all = [
        ...spl.value.map((v) => ({ ...v, programId: TOKEN_PROGRAM_ID })),
        ...t22.value.map((v) => ({ ...v, programId: TOKEN_2022_PROGRAM_ID })),
      ];

      const emptiesFound: EmptyTokenAccount[] = [];

      for (const item of all) {
        const pubkey = item.pubkey;
        const lamports = item.account.lamports ?? 0;

        // parsed token
        const parsed: any = item.account.data?.parsed;
        const info = parsed?.info;
        const tokenAmount = info?.tokenAmount;
        const mintStr = info?.mint;

        if (!mintStr || !tokenAmount) continue;

        const mint = new PublicKey(mintStr);

        // Skip WSOL always
        if (mint.equals(WSOL_MINT)) continue;

        // Balance must be 0
        const amountStr: string = tokenAmount.amount ?? "0";
        if (amountStr !== "0") continue;

        // If account has no lamports for some reason, still allow but estimate 0
        emptiesFound.push({
          pubkey,
          programId: item.programId,
          mint,
          lamports: lamports,
        });
      }

      setEmpties(emptiesFound);
      setSelected({});
      setStatus(t.found(emptiesFound.length));
    } catch (e) {
      setStatus(t.scanErr(clampErr(e)));
    } finally {
      setLoading(false);
    }
  }

  function toggleOne(pk58: string) {
    setSelected((prev) => ({ ...prev, [pk58]: !prev[pk58] }));
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const e of empties) next[e.pubkey.toBase58()] = true;
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  async function claimSelected() {
    if (!publicKey) {
      setStatus(t.noWallet);
      return;
    }
    if (!connected || !signTransaction) {
      setStatus(t.noWallet);
      return;
    }
    if (selectedAccounts.length === 0) return;

    setLoading(true);
    setStatus(t.claiming);

    // batching: keep tx size safe
    const BATCH_SIZE = 8;

    try {
      for (let i = 0; i < selectedAccounts.length; i += BATCH_SIZE) {
        const batch = selectedAccounts.slice(i, i + BATCH_SIZE);

        const tx = new Transaction();
        tx.feePayer = publicKey;

        // Close instructions -> send rent to user
        let grossLamports = 0;
        for (const acc of batch) {
          grossLamports += acc.lamports;
          tx.add(
            createCloseAccountInstruction(
              acc.pubkey, // account to close
              publicKey, // destination (user)
              publicKey, // owner
              [], // multisig signers
              acc.programId // token program id
            )
          );
        }

        // Fee transfer (only if configured and > 0)
        if (FEE_RECIPIENT && Number.isFinite(FEE_BPS) && FEE_BPS > 0) {
          const feeLamports = Math.floor((grossLamports * FEE_BPS) / 10_000);
          if (feeLamports > 0) {
            tx.add(
              SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: FEE_RECIPIENT,
                lamports: feeLamports,
              })
            );
          }
        }

        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
        tx.recentBlockhash = blockhash;

        // Sign + send
        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

        setStatus(t.claimDone(sig));
      }

      // re-scan to update list
      await scan();
    } catch (e) {
      setStatus(t.claimErr(clampErr(e)));
    } finally {
      setLoading(false);
    }
  }

  const selectedLine = useMemo(() => {
    const n = selectedAccounts.length;
    const gross = fmtSol(lamportsToSol(grossLamportsSelected));
    const fee = fmtSol(lamportsToSol(feeLamportsSelected));
    const net = fmtSol(lamportsToSol(netLamportsSelected));
    return t.selected(n, gross, fee, net);
  }, [selectedAccounts.length, grossLamportsSelected, feeLamportsSelected, netLamportsSelected, lang]);

  return (
    <div className="page">
      <div className="bgOrbs" aria-hidden="true" />

      <main className="wrap">
        <header className="top">
          <div>
            <h1 className="title">{APP_NAME}</h1>
            <div className="sub">{t.subtitle}</div>
          </div>

          <div className="topRight">
            <button
              className="pill pill3d"
              onClick={() => setLang((p) => (p === "fi" ? "en" : "fi"))}
              title="Language"
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </header>

        {/* Trust layer */}
        <section className={`card glass floaty ${showTrust ? "" : "collapsed"}`}>
          <div className="cardHead">
            <div className="cardTitle">{t.safetyTitle}</div>
            <button className="ghostBtn" onClick={() => setShowTrust((s) => !s)}>
              {showTrust ? "—" : "+"}
            </button>
          </div>

          {showTrust && (
            <>
              <ul className="bullets">
                {t.safetyBullets.map((x: string, idx: number) => (
                  <li key={idx}>{x}</li>
                ))}
              </ul>

              <div className="split">
                <div className="miniCard">
                  <div className="miniTitle">{t.closesOnly}</div>
                  <ul className="miniList">
                    {t.closesOnlyBullets.map((x: string, idx: number) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="miniCard">
                  <div className="miniTitle">{t.neverCloses}</div>
                  <ul className="miniList">
                    {t.neverClosesBullets.map((x: string, idx: number) => (
                      <li key={idx}>{x}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="fine">
                {t.feeLine(feePct)}
                {!FEE_RECIPIENT && (
                  <span className="fineDim">
                    {" "}
                    (Tip: set VITE_FEE_RECIPIENT to enable fee on Vercel)
                  </span>
                )}
              </div>
            </>
          )}
        </section>

        {/* Main card */}
        <section className="card glass pop">
          <div className="toolbar">
            <div className="left">
              <div className="walletBtnWrap">
                <WalletMultiButton className="walletBtn walletBtn3d" />
              </div>

              <button className="btn btn3d" onClick={scan} disabled={!publicKey || loading}>
                {t.scan}
              </button>

              <button className="btn btn3d" onClick={claimSelected} disabled={!publicKey || loading || selectedAccounts.length === 0}>
                {t.claim(selectedAccounts.length)}
              </button>

              <button className="btn btn3d btnGhost" onClick={selectAll} disabled={loading || empties.length === 0}>
                {t.selectAll}
              </button>

              <button className="btn btn3d btnGhost" onClick={clearSelection} disabled={loading}>
                {t.clear}
              </button>
            </div>

            <div className="right">
              <div className="muted">
                {t.wallet}: <span className="mono">{publicKey ? shortPk(publicKey.toBase58(), 6, 6) : "—"}</span>
              </div>
            </div>
          </div>

          <div className="grid">
            <div className="stat">
              <div className="label">{t.walletBalance}</div>
              <div className="value">{walletSol == null ? "—" : `${fmtSol(walletSol)} SOL`}</div>
            </div>

            <div className="stat">
              <div className="label">{t.emptyAccounts}</div>
              <div className="value">{empties.length}</div>
            </div>

            <div className="stat">
              <div className="label">{t.rentPerAcc}</div>
              <div className="value">
                {perAccLamports == null ? "—" : `${fmtSol(lamportsToSol(perAccLamports))} SOL`}
              </div>
            </div>

            <div className="stat">
              <div className="label">{t.estReturn}</div>
              <div className="value">
                {selectedAccounts.length === 0
                  ? "—"
                  : `${fmtSol(lamportsToSol(netLamportsSelected))} SOL`}
              </div>
            </div>
          </div>

          <div className="statusRow">
            <div className="status">
              <span className="statusKey">{t.status}:</span> {status ?? t.idleStatus}
            </div>

            <button className="pill pill3d" onClick={() => setShowList((s) => !s)} disabled={empties.length === 0}>
              {showList ? t.hideList : t.showList}
            </button>
          </div>

          <div className="selectedLine">{selectedLine}</div>

          {showList && (
            <div className="list">
              {empties.length > maxList && <div className="listNote">{t.previewNote}</div>}

              {empties.slice(0, maxList).map((e) => {
                const pk = e.pubkey.toBase58();
                const checked = !!selected[pk];

                return (
                  <label className={`row ${checked ? "rowOn" : ""}`} key={pk}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(pk)}
                    />
                    <div className="rowMain">
                      <div className="rowPk mono">{shortPk(pk, 10, 10)}</div>
                      <div className="rowMeta">
                        {t.program}:{" "}
                        <span className="mono">
                          {e.programId.equals(TOKEN_2022_PROGRAM_ID) ? "Token2022" : "SPL"}
                        </span>{" "}
                        • {t.mint} <span className="mono">{shortPk(e.mint.toBase58(), 6, 4)}</span>
                      </div>
                    </div>
                    <div className="rowRight mono">{fmtSol(lamportsToSol(e.lamports))} SOL</div>
                  </label>
                );
              })}
            </div>
          )}

          <div className="footNote">{t.tip}</div>
        </section>
      </main>
    </div>
  );
}
