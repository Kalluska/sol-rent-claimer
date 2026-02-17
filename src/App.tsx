// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react";
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

// Brand
const APP_NAME = String(import.meta.env.VITE_APP_NAME ?? "Solint");

const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300); // 300 = 3%
const FEE_RECIPIENT_STR = String(import.meta.env.VITE_FEE_RECIPIENT ?? "");
const PUBLIC_APP_URL = String(
  import.meta.env.VITE_PUBLIC_URL ?? "https://solint.vercel.app"
);
const REPO_URL = String(import.meta.env.VITE_REPO_URL ?? "");

// 🔥 batch size upgrade
const MAX_ACCOUNTS_PER_TX = 13;

const TEXT: Record<Lang, any> = {
  fi: {
    title: APP_NAME,
    welcomeTitle: `Tervetuloa ${APP_NAME}:iin`,
    welcomeSub:
      "Yhdistä lompakko ja reclaimaa tyhjien token-tilien lukitsema SOL.",
    connectCta: "Yhdistä lompakko",
    subtitle:
      "Skannaa tyhjät SPL/Token-2022 -tilit ja palauta niihin lukittu SOL.",
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
    neverClosesBullets: [
      "WSOL-tilit (So111…)",
      "Tilit joissa on token-saldoa (≠ 0)",
    ],
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

    // success modal
    claimedTitle: (x: string) => `Claimed ${x} successfully ✅`,
    claimedShare: "Share on X",
    claimedClose: "Close",
    claimedCopyAmount: "Copy amount",
    claimedCopyText: "Copy post text",
    copiedOk: "Copied ✅",
    claimedMeta: "Haluatko jakaa tuloksen tai kopioida määrän?",
  },
  en: {
    title: APP_NAME,
    welcomeTitle: `Welcome to ${APP_NAME}`,
    welcomeSub:
      "Connect your wallet to scan and reclaim SOL locked in empty token accounts.",
    connectCta: "Connect wallet",
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
    neverClosesBullets: [
      "WSOL accounts (So111…)",
      "Accounts with token balance (≠ 0)",
    ],
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

    // success modal
    claimedTitle: (x: string) => `Claimed ${x} successfully ✅`,
    claimedShare: "Share on X",
    claimedClose: "Close",
    claimedCopyAmount: "Copy amount",
    claimedCopyText: "Copy post text",
    copiedOk: "Copied ✅",
    claimedMeta: "Want to share your result or copy the amount?",
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

  // ✅ Default language is EN
  const [lang, setLang] = useState<Lang>("en");
  const t = TEXT[lang];

  const [walletSol, setWalletSol] = useState<number | null>(null);
  const [empties, setEmpties] = useState<EmptyTokenAcc[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<string>("—");

  const [scanning, setScanning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [showList, setShowList] = useState(true);
  const [lastSig, setLastSig] = useState<string | null>(null);

  // View transitions
  const [view, setView] = useState<"welcome" | "app">("welcome");
  const [anim, setAnim] = useState<"none" | "toApp" | "toWelcome">(
    "none"
  );

  // Used to open the wallet adapter modal from our custom button
  const hiddenWalletBtnRef = useRef<HTMLDivElement | null>(null);

  // 🔥 Success overlay + next-level extras
  const [successOpen, setSuccessOpen] = useState(false);
  const [claimedSol, setClaimedSol] = useState<number>(0); // final amount
  const [claimedAnim, setClaimedAnim] = useState<number>(0); // animated amount
  const rafRef = useRef<number | null>(null);

  const [copied, setCopied] = useState<"none" | "amount" | "text">("none");
  const [burstKey, setBurstKey] = useState(0);
  const copyTimerRef = useRef<number | null>(null);

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
    return ids
      .map((id) => map.get(id))
      .filter(Boolean) as EmptyTokenAcc[];
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

  const estReturnSol = useMemo(
    () => lamportsToSol(netLamports),
    [netLamports]
  );

  // ✅ Lock scroll while welcome is shown (removes "seam" when scrolling)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow =
      view === "welcome" ? "hidden" : prev || "auto";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [view]);

  // Keep view in sync with wallet connection, with smooth transitions
  useEffect(() => {
    if (connected && publicKey) {
      if (view === "welcome") {
        setAnim("toApp");
        window.setTimeout(() => {
          setView("app");
          setAnim("none");
        }, 280);
      }
    } else {
      if (view === "app") {
        setAnim("toWelcome");
        window.setTimeout(() => {
          setView("welcome");
          setAnim("none");
        }, 280);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, publicKey]);

  // wallet balance + listener
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
        } catch {}
      }
    };
  }, [connection, publicKey]);

  // 🔥 Count-up animation when success modal opens
  useEffect(() => {
    if (!successOpen) return;

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const from = 0;
    const to = claimedSol;
    const start = performance.now();
    const durMs = 900;

    function easeOutCubic(x: number) {
      return 1 - Math.pow(1 - x, 3);
    }

    function tick(now: number) {
      const p = Math.min((now - start) / durMs, 1);
      const v = from + (to - from) * easeOutCubic(p);
      setClaimedAnim(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }

    setClaimedAnim(0);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [successOpen, claimedSol]);

  // cleanup timers
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

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

    const res = await connection.getParsedTokenAccountsByOwner(publicKey, {
      programId,
    });

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
      setStatus(
        (lang === "fi" ? "Virhe skannauksessa: " : "Scan error: ") +
          String(e?.message ?? e)
      );
    } finally {
      setScanning(false);
    }
  }

  function claimShareText(amountSol: number) {
    return `I just reclaimed ${amountSol.toFixed(
      4
    )} SOL from empty token accounts on Solana. (${APP_NAME})`;
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        return ok;
      } catch {
        return false;
      }
    }
  }

  function flashCopied(kind: "amount" | "text") {
    setCopied(kind);
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current);
    copyTimerRef.current = window.setTimeout(() => setCopied("none"), 1200);
  }

  function shareClaimAmount(amountSol: number) {
    const text = claimShareText(amountSol);
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(PUBLIC_APP_URL)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  function ConfettiBurst({ k }: { k: number }) {
    return (
      <div key={k} className="confetti">
        {Array.from({ length: 26 }).map((_, i) => (
          <span key={i} className="confettiBit" />
        ))}
      </div>
    );
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

    // accumulate total net across batches
    let totalNetLamports = 0;

    try {
      const batches = chunk(selectedAccounts, MAX_ACCOUNTS_PER_TX);

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const batchGross = batch.reduce((sum, a) => sum + a.lamports, 0);
        const batchFee =
          feeRecipient && FEE_BPS > 0
            ? Math.max(0, Math.floor((batchGross * FEE_BPS) / 10_000))
            : 0;

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

        setStatus(
          `${lang === "fi" ? "Claim batch" : "Claim batch"} ${i + 1}/${
            batches.length
          }…`
        );

        const sig = await sendTransaction(tx, connection, { skipPreflight: false });
        setLastSig(sig);

        const conf = await connection.confirmTransaction(sig, "confirmed");
        if (conf.value.err) {
          throw new Error(
            (lang === "fi" ? "Transaktio epäonnistui: " : "Transaction failed: ") +
              JSON.stringify(conf.value.err)
          );
        }

        // add this batch net to total
        totalNetLamports += Math.max(0, batchGross - batchFee);

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

      // open success overlay with claimed amount + confetti
      const claimed = lamportsToSol(totalNetLamports);
      setClaimedSol(claimed);
      setCopied("none");
      setBurstKey((x) => x + 1);
      setSuccessOpen(true);
    } catch (e: any) {
      setStatus(
        (lang === "fi" ? "Claim-virhe: " : "Claim error: ") +
          String(e?.message ?? e)
      );
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

    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(PUBLIC_APP_URL)}`;

    window.open(intent, "_blank", "noopener,noreferrer");
  }

  const feeText = useMemo(() => pctFromBps(FEE_BPS), []);

  function openWalletModal() {
    const btn = hiddenWalletBtnRef.current?.querySelector(
      "button"
    ) as HTMLButtonElement | null;
    btn?.click();
  }

  const showWelcome = view === "welcome";
  const showApp = view === "app";

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

        /* Success overlay */
        .successOverlay{
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,.68);
          backdrop-filter: blur(10px);
          z-index: 9999999;
          padding: 18px;
        }
        .successCard{
          width: min(580px, 100%);
          background: linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.05));
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 22px;
          box-shadow: 0 30px 90px rgba(0,0,0,.65);
          padding: 26px 22px 20px;
          text-align: center;
          animation: successIn .22s ease-out;
          position: relative;
          overflow: hidden;
        }
        @keyframes successIn{
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .successTitle{
          font-weight: 800;
          letter-spacing: -.02em;
          margin: 0 0 10px;
        }
        .successAmount{
          font-size: 42px;
          font-weight: 900;
          letter-spacing: -.02em;
          margin: 6px 0 10px;
          text-shadow: 0 0 24px rgba(124,77,255,.22);
        }
        .amountGlow{
          display:inline-block;
          background: linear-gradient(90deg, rgba(124,77,255,1), rgba(57,192,255,1));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          text-shadow:
            0 0 28px rgba(124,77,255,.18),
            0 0 38px rgba(57,192,255,.14);
          filter: drop-shadow(0 10px 18px rgba(0,0,0,.35));
          animation: glowPulse 1.6s ease-in-out infinite;
        }
        .amountUnit{
          color: rgba(240,245,255,.92);
          font-weight: 850;
          letter-spacing: -.01em;
        }
        @keyframes glowPulse{
          0%,100%{ transform: translateY(0); opacity: 1; }
          50%{ transform: translateY(-1px); opacity: .96; }
        }
        .successMeta{
          color: rgba(255,255,255,.68);
          font-size: 13px;
          margin-bottom: 16px;
        }
        .successActions{
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Confetti burst (no libs) */
        .confetti{
          position:absolute;
          inset:0;
          pointer-events:none;
          overflow:hidden;
          border-radius:22px;
        }
        .confettiBit{
          position:absolute;
          left: 50%;
          top: 50%;
          width: 10px;
          height: 6px;
          border-radius: 3px;
          opacity: 0;
          transform: translate(-50%,-50%) rotate(0deg);
          animation: pop 900ms ease-out forwards;
          background: rgba(124,77,255,.95);
        }
        .confettiBit:nth-child(2n){ background: rgba(57,192,255,.95); }
        .confettiBit:nth-child(3n){ background: rgba(255,255,255,.92); }
        .confettiBit:nth-child(5n){ background: rgba(255,87,34,.85); }

        .confettiBit:nth-child(3n){ width: 8px; height: 8px; border-radius: 999px; }
        .confettiBit:nth-child(4n){ width: 12px; height: 5px; border-radius: 2px; }

        @keyframes pop{
          0%{ opacity: 0; transform: translate(-50%,-50%) scale(.9) rotate(0deg); }
          10%{ opacity: 1; }
          100%{
            opacity: 0;
            transform:
              translate(calc(-50% + (var(--dx, 0px))), calc(-50% + (var(--dy, -180px))))
              rotate(260deg)
              scale(1);
          }
        }

        /* vectors */
        .confettiBit:nth-child(1){  --dx:-220px; --dy:-140px; }
        .confettiBit:nth-child(2){  --dx:-180px; --dy:-210px; }
        .confettiBit:nth-child(3){  --dx:-120px; --dy:-170px; }
        .confettiBit:nth-child(4){  --dx:-60px;  --dy:-240px; }
        .confettiBit:nth-child(5){  --dx:-10px;  --dy:-190px; }
        .confettiBit:nth-child(6){  --dx:60px;   --dy:-240px; }
        .confettiBit:nth-child(7){  --dx:120px;  --dy:-180px; }
        .confettiBit:nth-child(8){  --dx:180px;  --dy:-210px; }
        .confettiBit:nth-child(9){  --dx:220px;  --dy:-140px; }
        .confettiBit:nth-child(10){ --dx:-240px; --dy:-40px;  }
        .confettiBit:nth-child(11){ --dx:-200px; --dy:-80px;  }
        .confettiBit:nth-child(12){ --dx:-140px; --dy:-60px;  }
        .confettiBit:nth-child(13){ --dx:-80px;  --dy:-90px;  }
        .confettiBit:nth-child(14){ --dx:80px;   --dy:-90px;  }
        .confettiBit:nth-child(15){ --dx:140px;  --dy:-60px;  }
        .confettiBit:nth-child(16){ --dx:200px;  --dy:-80px;  }
        .confettiBit:nth-child(17){ --dx:240px;  --dy:-40px;  }
        .confettiBit:nth-child(18){ --dx:-220px; --dy:120px;  }
        .confettiBit:nth-child(19){ --dx:-160px; --dy:160px;  }
        .confettiBit:nth-child(20){ --dx:-80px;  --dy:140px;  }
        .confettiBit:nth-child(21){ --dx:80px;   --dy:140px;  }
        .confettiBit:nth-child(22){ --dx:160px;  --dy:160px;  }
        .confettiBit:nth-child(23){ --dx:220px;  --dy:120px;  }
        .confettiBit:nth-child(24){ --dx:-40px;  --dy:210px;  }
        .confettiBit:nth-child(25){ --dx:40px;   --dy:210px;  }
        .confettiBit:nth-child(26){ --dx:0px;    --dy:240px;  }

        /* delays */
        .confettiBit:nth-child(1){  animation-delay: 0ms;  }
        .confettiBit:nth-child(2){  animation-delay: 20ms; }
        .confettiBit:nth-child(3){  animation-delay: 40ms; }
        .confettiBit:nth-child(4){  animation-delay: 60ms; }
        .confettiBit:nth-child(5){  animation-delay: 80ms; }
        .confettiBit:nth-child(6){  animation-delay: 100ms;}
        .confettiBit:nth-child(7){  animation-delay: 120ms;}
        .confettiBit:nth-child(8){  animation-delay: 140ms;}
        .confettiBit:nth-child(9){  animation-delay: 160ms;}
        .confettiBit:nth-child(10){ animation-delay: 180ms;}
        .confettiBit:nth-child(11){ animation-delay: 200ms;}
        .confettiBit:nth-child(12){ animation-delay: 220ms;}
        .confettiBit:nth-child(13){ animation-delay: 240ms;}
        .confettiBit:nth-child(14){ animation-delay: 260ms;}
        .confettiBit:nth-child(15){ animation-delay: 280ms;}
        .confettiBit:nth-child(16){ animation-delay: 300ms;}
        .confettiBit:nth-child(17){ animation-delay: 320ms;}
        .confettiBit:nth-child(18){ animation-delay: 340ms;}
        .confettiBit:nth-child(19){ animation-delay: 360ms;}
        .confettiBit:nth-child(20){ animation-delay: 380ms;}
        .confettiBit:nth-child(21){ animation-delay: 400ms;}
        .confettiBit:nth-child(22){ animation-delay: 420ms;}
        .confettiBit:nth-child(23){ animation-delay: 440ms;}
        .confettiBit:nth-child(24){ animation-delay: 460ms;}
        .confettiBit:nth-child(25){ animation-delay: 480ms;}
        .confettiBit:nth-child(26){ animation-delay: 500ms;}
      `}</style>

      <div className="bgGlow" />

      {/* Hidden wallet button used to open modal from custom CTA */}
      <div
        ref={hiddenWalletBtnRef}
        style={{ position: "absolute", left: -99999, top: -99999 }}
      >
        <WalletMultiButton className="walletBtn" />
      </div>

      {/* WELCOME SCREEN */}
      {showWelcome && (
        <div className={`welcomeWrap ${anim === "toApp" ? "fadeOut" : "fadeIn"}`}>
          <div className="welcomeInner">
            <img src="/logo.png" alt="Solint" className="appLogo" />
            <div className="welcomeTitle">{t.welcomeTitle}</div>
            <div className="welcomeSub">{t.welcomeSub}</div>

            <button className="btn btnPrimary btn3d welcomeCta" onClick={openWalletModal}>
              {t.connectCta}
            </button>

            <button
              className="langBtn welcomeLang"
              onClick={() => setLang((p) => (p === "fi" ? "en" : "fi"))}
            >
              {lang.toUpperCase()}
            </button>
          </div>
        </div>
      )}

      {/* MAIN APP */}
      {showApp && (
        <div className={`${anim === "toWelcome" ? "fadeOut" : "fadeIn"}`}>
          {/* Success overlay */}
          {successOpen && (
            <div
              className="successOverlay"
              onClick={() => setSuccessOpen(false)}
              role="dialog"
              aria-modal="true"
            >
              <div className="successCard" onClick={(e) => e.stopPropagation()}>
                <ConfettiBurst k={burstKey} />

                <div className="successTitle">
                  {t.claimedTitle(`${claimedAnim.toFixed(4)} SOL`)}
                </div>

                <div className="successAmount">
                  <span className="amountGlow">{claimedAnim.toFixed(4)}</span>{" "}
                  <span className="amountUnit">SOL</span>
                </div>

                <div className="successMeta">{t.claimedMeta}</div>

                <div className="successActions">
                  <button className="btn btnPrimary btn3d" onClick={() => shareClaimAmount(claimedSol)}>
                    {t.claimedShare}
                  </button>

                  <button
                    className="btn btn3d"
                    onClick={async () => {
                      const ok = await copyToClipboard(`${claimedSol.toFixed(6)} SOL`);
                      if (ok) flashCopied("amount");
                    }}
                  >
                    {copied === "amount" ? t.copiedOk : t.claimedCopyAmount}
                  </button>

                  <button
                    className="btn btn3d"
                    onClick={async () => {
                      const ok = await copyToClipboard(claimShareText(claimedSol));
                      if (ok) flashCopied("text");
                    }}
                  >
                    {copied === "text" ? t.copiedOk : t.claimedCopyText}
                  </button>

                  <button className="btn btn3d" onClick={() => setSuccessOpen(false)}>
                    {t.claimedClose}
                  </button>
                </div>
              </div>
            </div>
          )}

          <header className="hero">
            <div className="heroLeft">
              <img src="/logo.png" alt="Solint" className="appLogo" />
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
                  <div className="dim">
                    {publicKey ? `Wallet: ${shortPk(publicKey, 6, 4)}` : t.connectHint}
                  </div>
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
                {lamportsToSol(feeLamports).toFixed(6)} SOL · {t.net}{" "}
                {lamportsToSol(netLamports).toFixed(6)} SOL)
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
      )}
    </div>
  );
}
