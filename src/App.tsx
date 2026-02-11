// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import {
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

type EmptyTokenAcc = {
  pubkey: PublicKey;
  programId: PublicKey; // TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID
  mint: PublicKey;
  lamports: number;
};

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

// ✅ Brand: default app name is now Solint (env can still override if you want)
const APP_NAME = String(import.meta.env.VITE_APP_NAME ?? "Solint");

const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300); // 300 = 3%
const FEE_RECIPIENT_STR = String(import.meta.env.VITE_FEE_RECIPIENT ?? "");
const PUBLIC_APP_URL = String(
  import.meta.env.VITE_PUBLIC_URL ?? "https://sol-rent-claimer.vercel.app"
);
const REPO_URL = String(import.meta.env.VITE_REPO_URL ?? "");

const MAX_ACCOUNTS_PER_TX = 8;

const TEXT: Record<Lang, any> = {
  fi: {
    title: APP_NAME,
    subtitle: "Skannaa tyhjät SPL/Token-2022 -tilit ja palauta niihin lukittu SOL.",
    trustTitle: "Safety & transparency",
    trustBullets: [
      "Ei custodyä: appi ei voi siirtää varoja ilman allekirjoitustasi.",
      "Älä koskaan syötä seed phrasea — tämä appi ei kysy sitä.",
    ],
    closesOnly: "Sulkee vain",
    closesOnlyBullets: [
      "Tyhjät SPL + Token-2022 token-tilit (saldo 0)",
      "Vain tilit joiden owner on sinun wallet",
    ],
    neverCloses: "Ei sulje koskaan",
    neverClosesBullets: ["WSOL-tilit (So111…)", "Tilit joissa on token-saldoa (≠ 0)"],
    feeLine: (pct: string) =>
      `Fee: ${pct} onnistuneesta palautuksesta (per batch). Fee veloitetaan vain onnistuneissa claim-transaktioissa.`,
    connectHint: "Yhdistä lompakko",
    scan: "Skannaa",
    claim: "Claim",
    selectAll: "Valitse kaikki",
    clear: "Poista valinnat",
    hideList: "Piilota lista",
    showList: "Näytä lista",
    walletBalance: "Wallet balance",
    emptyAccounts: "Tyhjiä tilejä",
    rentPerAcc: "Rent / tili",
    estReturn: "Arvioitu palautus",
    status: "Status",
    selected: "Valittu",
    gross: "gross",
    fee: "fee",
    net: "net",
    tip:
      "Vinkki: jos tulos on 0, wallet on todennäköisesti jo “puhdas”. Claim ajetaan batcheina ja Phantom pyytää allekirjoitukset.",
    share: "Share your result",
    shareHint: "Avaa X/Twitter ja jaa tulos (auttaa saamaan käyttäjiä).",
    lastTx: "Viimeisin tx",
  },
  en: {
    title: APP_NAME,
    subtitle: "Scan empty SPL/Token-2022 accounts and reclaim locked SOL.",
    trustTitle: "Safety & transparency",
    trustBullets: [
      "No custody: the app cannot move funds without your signature.",
      "Never enter your seed phrase — this app will never ask for it.",
    ],
    closesOnly: "Closes only",
    closesOnlyBullets: [
      "Empty SPL + Token-2022 token accounts (balance 0)",
      "Only accounts owned by your wallet",
    ],
    neverCloses: "Never closes",
    neverClosesBullets: ["WSOL accounts (So111…)", "Accounts with token balance (≠ 0)"],
    feeLine: (pct: string) =>
      `Fee: ${pct} of successfully reclaimed SOL (per batch). Fee is charged only on successful claim transactions.`,
    connectHint: "Connect wallet",
    scan: "Scan",
    claim: "Claim",
    selectAll: "Select all",
    clear: "Clear selection",
    hideList: "Hide list",
    showList: "Show list",
    walletBalance: "Wallet balance",
    emptyAccounts: "Empty accounts",
    rentPerAcc: "Rent / account",
    estReturn: "Estimated return",
    status: "Status",
    selected: "Selected",
    gross: "gross",
    fee: "fee",
    net: "net",
    tip:
      "Tip: if result is 0, your wallet is likely already clean. Claim runs in batches and Phantom will request signatures.",
    share: "Share your result",
    shareHint: "Opens X/Twitter to share your result (helps you grow users).",
    lastTx: "Last tx",
  },
};

function shortPk(pk: PublicKey | null | undefined, a = 4, b = 4) {
  if (!pk) return "—";
  const s = pk.toBase58();
  return `${s.slice(0, a)}…${s.slice(-b)}`;
}

function lamportsToSol(l: number) {
  return l / LAMPORTS_PER_SOL;
}

function fmtSol(sol: number | null | undefined, digits = 4) {
  if (sol == null || Number.isNaN(sol)) return "—";
  return `${sol.toFixed(digits)} SOL`;
}

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pctFromBps(bps: number) {
  return `${(bps / 100).toFixed(2)}%`;
}

export default function App() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [lang, setLang] = useState<Lang>("fi");
  const t = TEXT[lang];

  const [walletSol, setWalletSol] = useState<number | null>(null);
  const [empties, setEmpties] = useState<EmptyTokenAcc[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>("—");

  const [scanning, setScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showList, setShowList] = useState(true);
  const [lastSig, setLastSig] = useState<string | null>(null);

  const feeRecipient = useMemo(() => {
    try {
      const s = (FEE_RECIPIENT_STR || "").trim();
      if (!s) return null;
      return new PublicKey(s);
    } catch {
      return null;
    }
  }, []);

  const selectedAccounts = useMemo(() => {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
    const map = new Map(empties.map((e) => [e.pubkey.toBase58(), e]));
    return ids.map((id) => map.get(id)).filter(Boolean) as EmptyTokenAcc[];
  }, [selected, empties]);

  const grossLamports = useMemo(
    () => selectedAccounts.reduce((sum, a) => sum + a.lamports, 0),
    [selectedAccounts]
  );

  const feeLamports = useMemo(() => {
    if (!feeRecipient) return 0;
    return Math.max(0, Math.floor((grossLamports * FEE_BPS) / 10_000));
  }, [grossLamports, feeRecipient]);

  const netLamports = useMemo(
    () => Math.max(0, grossLamports - feeLamports),
    [grossLamports, feeLamports]
  );

  const rentPerAccSol = useMemo(() => {
    if (empties.length === 0) return null;
    const avg = empties.reduce((s, e) => s + e.lamports, 0) / empties.length;
    return lamportsToSol(avg);
  }, [empties]);

  const estReturnSol = useMemo(() => lamportsToSol(netLamports), [netLamports]);

  // wallet balance + listener (NO .then() bug)
  useEffect(() => {
    let stop = false;
    let subId: number | null = null;

    async function refreshBalance() {
      if (!publicKey) {
        setWalletSol(null);
        return;
      }
      try {
        const lamports = await connection.getBalance(publicKey, "confirmed");
        if (!stop) setWalletSol(lamportsToSol(lamports));
      } catch {
        if (!stop) setWalletSol(null);
      }
    }

    refreshBalance();

    if (publicKey) {
      subId = connection.onAccountChange(publicKey, () => refreshBalance(), "confirmed");
    }

    return () => {
      stop = true;
      if (subId != null) {
        try {
          connection.removeAccountChangeListener(subId);
        } catch {}
      }
    };
  }, [connection, publicKey]);

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectAll() {
    const next: Record<string, boolean> = {};
    for (const e of empties) next[e.pubkey.toBase58()] = true;
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  async function fetchEmptyTokenAccountsForProgram(programId: PublicKey) {
    if (!publicKey) return [] as EmptyTokenAcc[];

    const res = await connection.getParsedTokenAccountsByOwner(publicKey, { programId });

    const out: EmptyTokenAcc[] = [];
    for (const it of res.value) {
      const info: any = it.account.data?.parsed?.info;
      if (!info) continue;

      const mintStr: string | undefined = info.mint;
      const ownerStr: string | undefined = info.owner;
      const tokenAmount = info.tokenAmount;

      if (!mintStr || !ownerStr || !tokenAmount) continue;
      if (ownerStr !== publicKey.toBase58()) continue;

      const uiAmount = Number(tokenAmount.uiAmount ?? 0);
      if (uiAmount !== 0) continue;

      if (mintStr === WSOL_MINT.toBase58()) continue;

      const lamports = it.account.lamports ?? 0;
      if (lamports <= 0) continue;

      out.push({
        pubkey: it.pubkey,
        programId,
        mint: new PublicKey(mintStr),
        lamports,
      });
    }

    return out;
  }

  async function scan() {
    if (!publicKey) {
      setStatus(lang === "fi" ? "Yhdistä lompakko ensin." : "Connect wallet first.");
      return;
    }

    setScanning(true);
    setLastSig(null);

    try {
      setStatus(lang === "fi" ? "Skannataan…" : "Scanning…");

      const [spl, t22] = await Promise.all([
        fetchEmptyTokenAccountsForProgram(TOKEN_PROGRAM_ID),
        fetchEmptyTokenAccountsForProgram(TOKEN_2022_PROGRAM_ID),
      ]);

      const merged = [...spl, ...t22].sort((a, b) => b.lamports - a.lamports);
      setEmpties(merged);
      setSelected({});

      setStatus(
        lang === "fi"
          ? `Löytyi ${merged.length} tyhjää token-tiliä.`
          : `Found ${merged.length} empty token accounts.`
      );
    } catch (e: any) {
      setEmpties([]);
      setSelected({});
      setStatus((lang === "fi" ? "Virhe skannauksessa: " : "Scan error: ") + String(e?.message ?? e));
    } finally {
      setScanning(false);
    }
  }

  async function claimSelected() {
    if (!publicKey) {
      setStatus(lang === "fi" ? "Yhdistä lompakko ensin." : "Connect wallet first.");
      return;
    }
    if (selectedAccounts.length === 0) {
      setStatus(lang === "fi" ? "Ei valintoja." : "Nothing selected.");
      return;
    }

    setClaiming(true);
    setLastSig(null);

    try {
      const batches = chunk(selectedAccounts, MAX_ACCOUNTS_PER_TX);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchGross = batch.reduce((sum, a) => sum + a.lamports, 0);
        const batchFee =
          feeRecipient && FEE_BPS > 0 ? Math.max(0, Math.floor((batchGross * FEE_BPS) / 10_000)) : 0;

        const tx = new Transaction();

        if (feeRecipient && batchFee > 0) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: feeRecipient,
              lamports: batchFee,
            })
          );
        }

        for (const a of batch) {
          tx.add(
            createCloseAccountInstruction(
              a.pubkey,
              publicKey,
              publicKey,
              [],
              a.programId
            )
          );
        }

        setStatus(`${lang === "fi" ? "Claim batch" : "Claim batch"} ${i + 1}/${batches.length}…`);

        const sig = await sendTransaction(tx, connection, { skipPreflight: false });
        setLastSig(sig);

        const conf = await connection.confirmTransaction(sig, "confirmed");
        if (conf.value.err) {
          throw new Error(
            (lang === "fi" ? "Transaktio epäonnistui: " : "Transaction failed: ") +
              JSON.stringify(conf.value.err)
          );
        }

        // remove locally
        setSelected((prev) => {
          const next = { ...prev };
          for (const a of batch) delete next[a.pubkey.toBase58()];
          return next;
        });
        setEmpties((prev) => {
          const remove = new Set(batch.map((b) => b.pubkey.toBase58()));
          return prev.filter((x) => !remove.has(x.pubkey.toBase58()));
        });
      }

      setStatus(lang === "fi" ? "Valmis ✅" : "Done ✅");
    } catch (e: any) {
      setStatus((lang === "fi" ? "Claim-virhe: " : "Claim error: ") + String(e?.message ?? e));
    } finally {
      setClaiming(false);
    }
  }

  function shareResult() {
    const emptyCount = empties.length;
    const text =
      emptyCount > 0
        ? `I found ${emptyCount} empty Solana token accounts with locked rent. Claimed with ${APP_NAME} 🔥`
        : `Checked my Solana wallet — already clean ✅ (${APP_NAME})`;

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(
      PUBLIC_APP_URL
    )}`;

    window.open(intent, "_blank", "noopener,noreferrer");
  }

  const feeText = useMemo(() => pctFromBps(FEE_BPS), []);

  return (
    <div className="page">
      {/* Wallet adapter dropdown fix (menu clickable) */}
      <style>{`
        .wallet-adapter-dropdown, .wallet-adapter-dropdown-list, .wallet-adapter-modal-wrapper {
          z-index: 999999 !important;
        }
        .wallet-adapter-dropdown-list {
          pointer-events: auto !important;
        }
      `}</style>

      <div className="bgGlow" />

      <header className="hero">
        <div className="heroLeft">
          {/* ✅ Only change: add brand3d class for the title */}
          <h1 className="heroTitle brand3d">{t.title}</h1>
          <p className="heroSubtitle">{t.subtitle}</p>
        </div>

        <div className="heroRight">
          <button className="langBtn" onClick={() => setLang((p) => (p === "fi" ? "en" : "fi"))}>
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      <section className="trustCard">
        <div className="trustHeader">
          <div className="trustTitle">{t.trustTitle}</div>
          <div className="trustMeta">{t.feeLine(feeText)}</div>
        </div>

        <ul className="trustBullets">
          {t.trustBullets.map((x: string) => (
            <li key={x}>{x}</li>
          ))}
        </ul>

        <div className="trustGrid">
          <div className="trustBox">
            <div className="trustBoxTitle">{t.closesOnly}</div>
            <ul>
              {t.closesOnlyBullets.map((x: string) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="trustBox">
            <div className="trustBoxTitle">{t.neverCloses}</div>
            <ul>
              {t.neverClosesBullets.map((x: string) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="trustLinks">
          {REPO_URL ? (
            <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
              Repo
            </a>
          ) : (
            <span className="dim">Repo (optional)</span>
          )}
        </div>
      </section>

      {publicKey && (
        <section className="shareCard">
          <div className="shareLeft">
            <div className="shareTitle">{t.share}</div>
            <div className="shareHint">{t.shareHint}</div>
          </div>
          <button className="btn btnPrimary btn3d" onClick={shareResult}>
            {t.share}
          </button>
        </section>
      )}

      <section className="mainCard">
        <div className="mainTop">
          <div className="walletWrap">
            <WalletMultiButton className="walletBtn" />
            <div className="walletMeta">
              <div className="dim">{publicKey ? `Wallet: ${shortPk(publicKey, 6, 4)}` : t.connectHint}</div>
            </div>
          </div>

          <div className="actions">
            <button className="btn btn3d" onClick={scan} disabled={!connected || scanning || claiming}>
              {scanning ? "…" : t.scan}
            </button>
            <button
              className="btn btnPrimary btn3d"
              onClick={claimSelected}
              disabled={!connected || claiming || scanning || selectedAccounts.length === 0}
            >
              {claiming ? "…" : `${t.claim} (${selectedAccounts.length})`}
            </button>
            <button className="btn btn3d" onClick={selectAll} disabled={!connected || empties.length === 0}>
              {t.selectAll}
            </button>
            <button className="btn btn3d" onClick={clearSelection} disabled={!connected}>
              {t.clear}
            </button>
          </div>
        </div>

        <div className="statsGrid">
          <div className="stat">
            <div className="statLabel">{t.walletBalance}</div>
            <div className="statValue">{fmtSol(walletSol, 4)}</div>
          </div>

          <div className="stat">
            <div className="statLabel">{t.emptyAccounts}</div>
            <div className="statValue">{empties.length}</div>
          </div>

          <div className="stat">
            <div className="statLabel">{t.rentPerAcc}</div>
            <div className="statValue">{fmtSol(rentPerAccSol, 6)}</div>
          </div>

          <div className="stat">
            <div className="statLabel">{t.estReturn}</div>
            <div className="statValue">{fmtSol(estReturnSol, 4)}</div>
          </div>
        </div>

        <div className="statusRow">
          <div className="statusText">
            <strong>{t.status}:</strong> {status}
          </div>

          {lastSig ? (
            <a className="link" href={`https://solscan.io/tx/${lastSig}`} target="_blank" rel="noreferrer">
              {t.lastTx}: {lastSig.slice(0, 6)}…{lastSig.slice(-4)}
            </a>
          ) : null}
        </div>

        <div className="selectedRow">
          <div className="dim">
            {t.selected}: {selectedAccounts.length} (
            {t.gross} {lamportsToSol(grossLamports).toFixed(6)} SOL · {t.fee}{" "}
            {lamportsToSol(feeLamports).toFixed(6)} SOL · {t.net} {lamportsToSol(netLamports).toFixed(6)} SOL)
          </div>

          <button className="btn btnSmall btn3d" onClick={() => setShowList((v) => !v)} disabled={!connected}>
            {showList ? t.hideList : t.showList}
          </button>
        </div>

        {showList && (
          <div className="listWrap">
            {empties.length === 0 ? (
              <div className="listEmpty">{t.tip}</div>
            ) : (
              empties.map((e) => {
                const id = e.pubkey.toBase58();
                const checked = !!selected[id];
                const is2022 = e.programId.equals(TOKEN_2022_PROGRAM_ID);
                return (
                  <label key={id} className={`row ${checked ? "rowOn" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOne(id)} />
                    <div className="rowMain">
                      <div className="rowPk">{shortPk(e.pubkey, 10, 10)}</div>
                      <div className="rowMeta">
                        {is2022 ? "Token2022" : "SPL"} · mint {shortPk(e.mint, 6, 4)}
                      </div>
                    </div>
                    <div className="rowRight">{lamportsToSol(e.lamports).toFixed(6)} SOL</div>
                  </label>
                );
              })
            )}
          </div>
        )}

        <div className="footNote">{t.tip}</div>
      </section>
    </div>
  );
}
