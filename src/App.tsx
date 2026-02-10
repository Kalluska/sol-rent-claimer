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

const APP_NAME = String(import.meta.env.VITE_APP_NAME ?? "Solana Rent Claimer");
const RPC_URL = String(import.meta.env.VITE_RPC_URL ?? "");
const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300); // 300 = 3.00%
const FEE_RECIPIENT_STR = String(import.meta.env.VITE_FEE_RECIPIENT ?? "");
const REPO_URL = String(
  import.meta.env.VITE_REPO_URL ?? "https://github.com/Kalluska/sol-rent-claimer"
);

const MAX_ACCOUNTS_PER_TX = 8; // turvallinen oletus
const EXPLORER_BASE = "https://solscan.io/tx/";

const TEXT: Record<Lang, any> = {
  fi: {
    tagline: "Skannaa tyhjät token-tilit ja palauta niihin lukittu SOL.",
    connect: "Yhdistä lompakko",
    scan: "Skannaa",
    claim: "Claim",
    selectAll: "Valitse kaikki",
    clear: "Poista valinnat",
    hideList: "Piilota lista",
    showList: "Näytä lista",
    emptyAccounts: "Tyhjiä tilejä",
    walletBalance: "Wallet balance",
    rentPerAcc: "Rent / tili",
    estimatedReturn: "Arvioitu palautus",
    status: "Status",
    selected: "Valittu",
    gross: "gross",
    fee: "fee",
    net: "net",
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
    tip:
      "Vinkki: jos tulos on 0, wallet on todennäköisesti jo “puhdas”. Claim ajetaan batcheina ja Phantom pyytää allekirjoitukset.",
    share: "Share your result",
    shareHint: "Avaa X/Twitter ja jaa tulos (auttaa saamaan käyttäjiä).",
    openRepo: "Avaa repo",
    lastTx: "Viimeisin tx",
  },
  en: {
    tagline: "Scan empty token accounts and reclaim locked SOL.",
    connect: "Connect wallet",
    scan: "Scan",
    claim: "Claim",
    selectAll: "Select all",
    clear: "Clear selection",
    hideList: "Hide list",
    showList: "Show list",
    emptyAccounts: "Empty accounts",
    walletBalance: "Wallet balance",
    rentPerAcc: "Rent / account",
    estimatedReturn: "Estimated return",
    status: "Status",
    selected: "Selected",
    gross: "gross",
    fee: "fee",
    net: "net",
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
    tip:
      "Tip: if result is 0, your wallet is likely already clean. Claim runs in batches and Phantom will request signatures.",
    share: "Share your result",
    shareHint: "Opens X/Twitter to share your result (helps you grow users).",
    openRepo: "Open repo",
    lastTx: "Last tx",
  },
};

function shortPk(pk: PublicKey | null | undefined, a = 4, b = 4) {
  if (!pk) return "—";
  const s = pk.toBase58();
  return `${s.slice(0, a)}…${s.slice(-b)}`;
}

function lamportsToSol(lamports: number) {
  return lamports / LAMPORTS_PER_SOL;
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

  // Derived numbers
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
    const raw = Math.floor((grossLamports * FEE_BPS) / 10_000);
    return Math.max(0, raw);
  }, [grossLamports, feeRecipient]);

  const netLamports = useMemo(
    () => Math.max(0, grossLamports - feeLamports),
    [grossLamports, feeLamports]
  );

  const rentPerAccSol = useMemo(() => {
    if (empties.length === 0) return null;
    const avgLamports =
      empties.reduce((sum, e) => sum + e.lamports, 0) / empties.length;
    return lamportsToSol(avgLamports);
  }, [empties]);

  const estimatedReturnSol = useMemo(() => {
    return lamportsToSol(netLamports);
  }, [netLamports]);

  // Refresh wallet balance (and subscribe to changes)
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
      // IMPORTANT: onAccountChange returns number, NOT Promise → no .then()
      subId = connection.onAccountChange(
        publicKey,
        () => refreshBalance(),
        "confirmed"
      );
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

  // Helpers
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

    // Parsed accounts gives tokenAmount nicely
    const res = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId,
    });

    const out: EmptyTokenAcc[] = [];
    for (const it of res.value) {
      const pubkey = it.pubkey;
      const info: any = it.account.data?.parsed?.info;
      if (!info) continue;

      const mintStr: string | undefined = info.mint;
      const tokenAmount = info.tokenAmount;
      const ownerStr: string | undefined = info.owner;

      if (!mintStr || !tokenAmount || !ownerStr) continue;
      if (ownerStr !== publicKey.toBase58()) continue;

      // only empty
      const uiAmount = Number(tokenAmount.uiAmount ?? 0);
      if (uiAmount !== 0) continue;

      // skip WSOL
      if (mintStr === WSOL_MINT.toBase58()) continue;

      // lamports in account = what you reclaim by closing it
      const lamports = it.account.lamports ?? 0;
      if (lamports <= 0) continue;

      out.push({
        pubkey,
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
      setStatus(
        (lang === "fi" ? "Virhe skannauksessa: " : "Scan error: ") +
          String(e?.message ?? e)
      );
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
      let claimedTotalLamports = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        const batchGross = batch.reduce((sum, a) => sum + a.lamports, 0);
        const batchFee =
          feeRecipient && FEE_BPS > 0
            ? Math.max(0, Math.floor((batchGross * FEE_BPS) / 10_000))
            : 0;

        const tx = new Transaction();

        // Fee transfer first (same tx). If close fails → whole tx fails → no fee charged.
        if (feeRecipient && batchFee > 0) {
          tx.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: feeRecipient,
              lamports: batchFee,
            })
          );
        }

        // Close accounts → reclaim lamports to wallet
        for (const a of batch) {
          tx.add(
            createCloseAccountInstruction(
              a.pubkey, // account to close
              publicKey, // destination (wallet)
              publicKey, // owner (wallet)
              [], // multisig signers
              a.programId // token program id (SPL or Token-2022)
            )
          );
        }

        setStatus(
          (lang === "fi" ? "Claim batch " : "Claim batch ") +
            `${i + 1}/${batches.length}…`
        );

        const sig = await sendTransaction(tx, connection, {
          skipPreflight: false,
        });

        setLastSig(sig);

        // wait confirmation
        const conf = await connection.confirmTransaction(sig, "confirmed");
        if (conf.value.err) {
          throw new Error(
            (lang === "fi" ? "Transaktio epäonnistui: " : "Transaction failed: ") +
              JSON.stringify(conf.value.err)
          );
        }

        claimedTotalLamports += Math.max(0, batchGross - batchFee);

        // remove claimed from local lists
        setSelected((prev) => {
          const next = { ...prev };
          for (const a of batch) delete next[a.pubkey.toBase58()];
          return next;
        });
        setEmpties((prev) => {
          const set = new Set(batch.map((b) => b.pubkey.toBase58()));
          return prev.filter((x) => !set.has(x.pubkey.toBase58()));
        });
      }

      setStatus(
        lang === "fi"
          ? `Valmis. Arvioitu palautus ~${fmtSol(lamportsToSol(claimedTotalLamports), 4)}`
          : `Done. Estimated reclaimed ~${fmtSol(lamportsToSol(claimedTotalLamports), 4)}`
      );
    } catch (e: any) {
      setStatus(
        (lang === "fi" ? "Claim-virhe: " : "Claim error: ") + String(e?.message ?? e)
      );
    } finally {
      setClaiming(false);
    }
  }

  function shareResult() {
    const emptyCount = empties.length;
    const reclaimed = estimatedReturnSol;

    const url = "https://sol-rent-claimer.vercel.app";
    const text =
      emptyCount > 0
        ? `I just reclaimed ~${reclaimed.toFixed(4)} SOL locked as rent in old Solana token accounts 🔥`
        : `Checked my Solana wallet — already clean ✅`;

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;

    window.open(intent, "_blank", "noopener,noreferrer");
  }

  const feeText = useMemo(() => pctFromBps(FEE_BPS), []);

  return (
    <div className="page">
      {/* Fix wallet adapter dropdown being unclickable/transparent in some CSS stacks */}
      <style>{`
        .wallet-adapter-modal-wrapper,
        .wallet-adapter-dropdown-list {
          z-index: 999999 !important;
          pointer-events: auto !important;
        }
        .wallet-adapter-dropdown {
          position: relative;
          z-index: 999998 !important;
        }
      `}</style>

      <header className="topBar">
        <div className="brand">
          <div className="title">{APP_NAME}</div>
          <div className="subtitle">{t.tagline}</div>
        </div>

        <div className="topRight">
          <button
            className="chip"
            onClick={() => setLang((p) => (p === "fi" ? "en" : "fi"))}
            title="Language"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Trust layer */}
      <section className="trustCard">
        <div className="trustHead">{t.trustTitle}</div>

        <ul className="trustList">
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

        <div className="trustFoot">
          {t.feeLine(feeText)}{" "}
          {REPO_URL ? (
            <>
              ·{" "}
              <a className="link" href={REPO_URL} target="_blank" rel="noreferrer">
                {t.openRepo}
              </a>
            </>
          ) : null}
        </div>
      </section>

      {/* Share box (only shows if connected) */}
      {publicKey && (
        <section className="shareBox">
          <button className="shareBtn" onClick={shareResult}>
            {t.share}
          </button>
          <div className="shareHint">{t.shareHint}</div>
        </section>
      )}

      {/* Main card */}
      <section className="card">
        <div className="cardTop">
          <div className="walletLeft">
            <WalletMultiButton className="walletBtn" />
            <div className="btnRow">
              <button className="btn" onClick={scan} disabled={!connected || scanning || claiming}>
                {scanning ? "…" : t.scan}
              </button>

              <button
                className="btn primary"
                onClick={claimSelected}
                disabled={!connected || claiming || scanning || selectedAccounts.length === 0}
              >
                {claiming ? "…" : `${t.claim} (${selectedAccounts.length})`}
              </button>

              <button className="btn" onClick={selectAll} disabled={!connected || empties.length === 0}>
                {t.selectAll}
              </button>

              <button className="btn" onClick={clearSelection} disabled={!connected}>
                {t.clear}
              </button>
            </div>
          </div>

          <div className="walletRight">
            <div className="mini">
              {publicKey ? `Wallet: ${shortPk(publicKey, 6, 4)}` : t.connect}
            </div>
            {RPC_URL ? <div className="mini dim">RPC: {RPC_URL}</div> : null}
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
            <div className="statLabel">{t.estimatedReturn}</div>
            <div className="statValue">{fmtSol(estimatedReturnSol, 4)}</div>
          </div>
        </div>

        <div className="statusRow">
          <div className="status">
            <strong>{t.status}:</strong> {status}
          </div>

          {lastSig ? (
            <a
              className="link"
              href={`${EXPLORER_BASE}${lastSig}`}
              target="_blank"
              rel="noreferrer"
              title={lastSig}
            >
              {t.lastTx}: {shortPk(new PublicKey(lastSig), 6, 4)}
            </a>
          ) : null}
        </div>

        <div className="selectedRow">
          <div className="selectedText">
            {t.selected}: {selectedAccounts.length} (
            {t.gross} {lamportsToSol(grossLamports).toFixed(6)} SOL · {t.fee}{" "}
            {lamportsToSol(feeLamports).toFixed(6)} SOL · {t.net}{" "}
            {lamportsToSol(netLamports).toFixed(6)} SOL)
          </div>

          <button className="btn miniBtn" onClick={() => setShowList((v) => !v)} disabled={!connected}>
            {showList ? t.hideList : t.showList}
          </button>
        </div>

        {showList && (
          <div className="list">
            {empties.length === 0 ? (
              <div className="listEmpty">{t.tip}</div>
            ) : (
              empties.map((e) => {
                const id = e.pubkey.toBase58();
                const checked = !!selected[id];
                const is2022 = e.programId.equals(TOKEN_2022_PROGRAM_ID);
                return (
                  <label key={id} className={`row ${checked ? "rowOn" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(id)}
                    />
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
