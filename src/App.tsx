import "./ui.css";
import { useEffect, useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
  SystemProgram,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  createCloseAccountInstruction,
} from "@solana/spl-token";

/* ========= I18N ========= */

type Lang = "fi" | "en";

const TEXT = {
  fi: {
    title: "Solana Rent Claimer",
    subtitle: "Skannaa tyhjät token-tilit ja palauta niihin lukittu SOL.",
    scan: "Skannaa",
    scanning: "Skannataan…",
    claim: "Claim",
    claiming: "Claimataan…",
    selectAll: "Valitse kaikki",
    deselectAll: "Poista valinnat",
    selected: "Valittu",
    wallet: "Lompakko",
    walletBalance: "Wallet balance",
    emptyAccounts: "Tyhjiä tilejä",
    rentPerAcc: "Rent / tili",
    estimatedReturn: "Arvioitu palautus",
    status: "Status",
    found: (n: number) => `Löytyi ${n} tyhjää token-tiliä.`,
    scanningStatus: "Skannataan tyhjät SPL- ja Token-2022 -tilit…",
    connectWallet: "Yhdistä lompakko",
    noneToClaim: "Ei tyhjiä tilejä claimattavaksi.",
    showList: "Näytä lista",
    hideList: "Piilota lista",
    program: "Ohjelma",
    feeMissing:
      "Fee-osoite puuttuu. Lisää .env tiedostoon VITE_FEE_RECIPIENT=... ja käynnistä dev uudestaan.",
    confirmBody: (n: number, gross: string, fee: string, net: string) =>
      `Olet sulkemassa ${n} tyhjää token-tiliä.\n\nBrutto: ${gross} SOL\nFee: ${fee} SOL\nNetto: ${net} SOL\n\nJatketaanko?`,
    simulating: "Simuloidaan…",
    simFailed:
      "Simulaatio epäonnistui. Tarkista että sinulla on riittävästi SOL:ia tx-feehen ja että tilit ovat edelleen olemassa.",
    progress: (done: number, total: number) => `Edistyminen: ${done}/${total}`,
    lastTx: "Viimeisin tx",
    viewOnSolscan: "Avaa Solscanissa",
    trustTitle: "Turvallisuus & läpinäkyvyys",
    trustNoCustody: "Ei koskaan custodyä: appi ei voi siirtää varojasi ilman allekirjoitustasi.",
    trustNoSeed: "Älä koskaan syötä seed phrasea — tätä appia ei tarvitse siihen.",
    trustWhatCloses: "Sulkee vain",
    trustWhatNever: "Ei koskaan sulje",
    closes1: "Tyhjät SPL Token & Token-2022 -token-tilit (saldo 0)",
    closes2: "Vain tilit, joiden owner on sinun wallet",
    never1: "WSOL-tilit (So111…)",
    never2: "Tilisi joissa on token-saldoa (≠ 0)",
    feePolicy: (pct: string) =>
      `Fee: ${pct} onnistuneesti palautetusta SOL:ista (per batch). Fee veloitetaan vain onnistuneista claim-transaktioista.`,
  },
  en: {
    title: "Solana Rent Claimer",
    subtitle: "Scan empty token accounts and reclaim locked SOL.",
    scan: "Scan",
    scanning: "Scanning…",
    claim: "Claim",
    claiming: "Claiming…",
    selectAll: "Select all",
    deselectAll: "Clear selection",
    selected: "Selected",
    wallet: "Wallet",
    walletBalance: "Wallet balance",
    emptyAccounts: "Empty accounts",
    rentPerAcc: "Rent / account",
    estimatedReturn: "Estimated return",
    status: "Status",
    found: (n: number) => `Found ${n} empty token accounts.`,
    scanningStatus: "Scanning empty SPL and Token-2022 accounts…",
    connectWallet: "Connect wallet",
    noneToClaim: "No empty accounts to claim.",
    showList: "Show list",
    hideList: "Hide list",
    program: "Program",
    feeMissing:
      "Fee recipient missing. Add VITE_FEE_RECIPIENT=... to .env and restart dev server.",
    confirmBody: (n: number, gross: string, fee: string, net: string) =>
      `You are about to close ${n} empty token accounts.\n\nGross: ${gross} SOL\nFee: ${fee} SOL\nNet: ${net} SOL\n\nContinue?`,
    simulating: "Simulating…",
    simFailed:
      "Simulation failed. Ensure you have enough SOL for tx fees and that accounts still exist.",
    progress: (done: number, total: number) => `Progress: ${done}/${total}`,
    lastTx: "Last tx",
    viewOnSolscan: "Open on Solscan",
    trustTitle: "Safety & transparency",
    trustNoCustody: "No custody: the app cannot move your funds without your signature.",
    trustNoSeed: "Never enter your seed phrase — this app will never ask for it.",
    trustWhatCloses: "Closes only",
    trustWhatNever: "Never closes",
    closes1: "Empty SPL Token & Token-2022 token accounts (balance 0)",
    closes2: "Only accounts owned by your wallet",
    never1: "WSOL accounts (So111…)",
    never2: "Accounts with a token balance (≠ 0)",
    feePolicy: (pct: string) =>
      `Fee: ${pct} of successfully reclaimed SOL (per batch). Fee is charged only on successful claim transactions.`,
  },
};

const WSOL_MINT = new PublicKey("So11111111111111111111111111111111111111112");

/* ========= FEE SETTINGS (.env) =========
   VITE_FEE_RECIPIENT=YourFeeWalletAddress
   VITE_FEE_BPS=300  (3%)
*/
const FEE_BPS = Number(import.meta.env.VITE_FEE_BPS ?? 300);
const FEE_RECIPIENT_STR = String(import.meta.env.VITE_FEE_RECIPIENT ?? "");

/* ========= TYPES / CONSTANTS ========= */

type EmptyAcc = {
  pubkey: PublicKey;
  mint: PublicKey;
  program: "SPL" | "Token2022";
  programId: PublicKey;
};

const TOKEN_ACCOUNT_SIZE = 165;
const MAX_PREVIEW = 30;
const MAX_CLOSES_PER_TX = 8;

function shortPk(pk: string, a = 4, b = 4) {
  return `${pk.slice(0, a)}…${pk.slice(-b)}`;
}
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
function safeToFixed(n: number, digits: number) {
  if (!Number.isFinite(n)) return "0";
  return n.toFixed(digits);
}
function bpsToPct(bps: number) {
  return `${(bps / 100).toFixed(2)}%`;
}

export default function App() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();

  const [lang, setLang] = useState<Lang>("fi");
  const t = TEXT[lang];

  const [empties, setEmpties] = useState<EmptyAcc[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const [claiming, setClaiming] = useState(false);
  const [progressDone, setProgressDone] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [lastTxSig, setLastTxSig] = useState<string>("");

  const [rentPerAccLamports, setRentPerAccLamports] = useState<number | null>(null);
  const [walletSol, setWalletSol] = useState<number | null>(null);

  const [showList, setShowList] = useState(true);

  const feeRecipient: PublicKey | null = useMemo(() => {
    try {
      if (!FEE_RECIPIENT_STR) return null;
      return new PublicKey(FEE_RECIPIENT_STR);
    } catch {
      return null;
    }
  }, []);

  const selectedList = useMemo(() => {
    const arr: EmptyAcc[] = [];
    for (const a of empties) {
      if (selected.has(a.pubkey.toBase58())) arr.push(a);
    }
    return arr;
  }, [empties, selected]);

  const rentPerAccSol =
    rentPerAccLamports == null ? null : rentPerAccLamports / 1_000_000_000;

  const estimatedGrossSol = useMemo(() => {
    if (rentPerAccLamports == null) return 0;
    return (rentPerAccLamports * selectedList.length) / 1_000_000_000;
  }, [rentPerAccLamports, selectedList.length]);

  const estimatedFeeSol = useMemo(() => {
    return Math.max(0, (estimatedGrossSol * FEE_BPS) / 10_000);
  }, [estimatedGrossSol]);

  const estimatedNetSol = useMemo(() => {
    return Math.max(0, estimatedGrossSol - estimatedFeeSol);
  }, [estimatedGrossSol, estimatedFeeSol]);

  const lastTxUrl = useMemo(() => {
    if (!lastTxSig) return "";
    return `https://solscan.io/tx/${lastTxSig}`;
  }, [lastTxSig]);

  async function refreshBalance() {
    if (!publicKey) return;
    const lamports = await connection.getBalance(publicKey, "confirmed");
    setWalletSol(lamports / 1_000_000_000);
  }

  useEffect(() => {
    if (!publicKey) {
      setWalletSol(null);
      setEmpties([]);
      setSelected(new Set());
      setStatus("");
      return;
    }
    refreshBalance().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicKey]);

  function isEmptyTokenAmount(info: any): boolean {
    const ta = info?.tokenAmount;
    if (!ta) return false;
    if (ta.amount === "0") return true;
    if (ta.uiAmount === 0) return true;
    if (ta.uiAmountString === "0") return true;
    return false;
  }

  async function scanProgram(programId: PublicKey, label: "SPL" | "Token2022") {
    if (!publicKey) return [] as EmptyAcc[];

    const res = await connection.getParsedTokenAccountsByOwner(publicKey, { programId });
    const found: EmptyAcc[] = [];

    for (const item of res.value) {
      const info: any = item.account.data.parsed?.info;
      if (!info) continue;

      const ownerStr: string | undefined = info.owner;
      if (!ownerStr || ownerStr !== publicKey.toBase58()) continue;

      if (!isEmptyTokenAmount(info)) continue;

      const mintStr: string | undefined = info.mint;
      if (!mintStr) continue;

      const mintPk = new PublicKey(mintStr);
      if (mintPk.equals(WSOL_MINT)) continue;

      found.push({
        pubkey: item.pubkey,
        mint: mintPk,
        program: label,
        programId,
      });
    }

    return found;
  }

  async function scan() {
    if (!publicKey) return;
    setLoading(true);
    setStatus(t.scanningStatus);
    setLastTxSig("");

    try {
      const rent = await connection.getMinimumBalanceForRentExemption(TOKEN_ACCOUNT_SIZE);
      setRentPerAccLamports(rent);

      const [spl, t22] = await Promise.all([
        scanProgram(TOKEN_PROGRAM_ID, "SPL"),
        scanProgram(TOKEN_2022_PROGRAM_ID, "Token2022"),
      ]);

      const uniq = new Map<string, EmptyAcc>();
      [...spl, ...t22].forEach((a) => uniq.set(a.pubkey.toBase58(), a));
      const arr = Array.from(uniq.values());

      setEmpties(arr);
      setSelected(new Set(arr.map((x) => x.pubkey.toBase58())));
      setStatus(t.found(arr.length));
      await refreshBalance();
    } catch (e: any) {
      setStatus(`Error: ${e?.message ?? e}`);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(pk58: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(pk58)) next.delete(pk58);
      else next.add(pk58);
      return next;
    });
  }
  function selectAll() {
    setSelected(new Set(empties.map((x) => x.pubkey.toBase58())));
  }
  function clearSelection() {
    setSelected(new Set());
  }

  async function buildBatchTx(batch: EmptyAcc[]) {
    if (!publicKey) throw new Error("Wallet not connected");
    if (!feeRecipient) throw new Error("Fee recipient missing");

    const infos = await connection.getMultipleAccountsInfo(
      batch.map((x) => x.pubkey),
      "confirmed"
    );

    let batchLamports = 0;
    for (const info of infos) {
      if (info) batchLamports += info.lamports;
    }

    const feeLamports = Math.max(0, Math.floor((batchLamports * FEE_BPS) / 10_000));

    const ixs = batch.map((acc) =>
      createCloseAccountInstruction(acc.pubkey, publicKey, publicKey, [], acc.programId)
    );

    if (feeLamports > 0) {
      ixs.push(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: feeRecipient,
          lamports: feeLamports,
        })
      );
    }

    const latest = await connection.getLatestBlockhash("finalized");
    const msg = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: latest.blockhash,
      instructions: ixs,
    }).compileToV0Message();

    const tx = new VersionedTransaction(msg);

    return {
      tx,
      latest,
      grossLamports: batchLamports,
      feeLamports,
      netLamports: Math.max(0, batchLamports - feeLamports),
    };
  }

  async function claimSelected() {
    if (!publicKey) return;

    if (!feeRecipient) {
      setStatus(t.feeMissing);
      return;
    }

    const targets = selectedList;
    if (targets.length === 0) {
      setStatus(t.noneToClaim);
      return;
    }

    setStatus(t.simulating);

    try {
      const batches = chunk(targets, MAX_CLOSES_PER_TX);

      let totalGrossLamports = 0;
      let totalFeeLamports = 0;
      let totalNetLamports = 0;

      // Lasketaan tarkat summat + simuloidaan ensimmäinen batch
      for (let i = 0; i < batches.length; i++) {
        const built = await buildBatchTx(batches[i]);
        totalGrossLamports += built.grossLamports;
        totalFeeLamports += built.feeLamports;
        totalNetLamports += built.netLamports;

        if (i === 0) {
          const sim = await connection.simulateTransaction(built.tx, {
            sigVerify: false,
            commitment: "processed",
          });
          if (sim.value.err) {
            setStatus(`${t.simFailed}\n${JSON.stringify(sim.value.err)}`);
            return;
          }
        }
      }

      const grossSol = totalGrossLamports / 1_000_000_000;
      const feeSol = totalFeeLamports / 1_000_000_000;
      const netSol = totalNetLamports / 1_000_000_000;

      const ok = window.confirm(
        t.confirmBody(
          targets.length,
          safeToFixed(grossSol, 6),
          safeToFixed(feeSol, 6),
          safeToFixed(netSol, 6)
        )
      );
      if (!ok) {
        setStatus("—");
        return;
      }

      setClaiming(true);
      setProgressDone(0);
      setProgressTotal(targets.length);
      setLastTxSig("");
      setStatus(t.claiming);

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];

        const built = await buildBatchTx(batch);

        // Pro: simuloidaan joka batch ennen lähettämistä
        const sim = await connection.simulateTransaction(built.tx, {
          sigVerify: false,
          commitment: "processed",
        });
        if (sim.value.err) {
          setStatus(`❌ Simulation failed on batch ${b + 1}/${batches.length}: ${JSON.stringify(sim.value.err)}`);
          return;
        }

        const sig = await sendTransaction(built.tx, connection, {
          skipPreflight: false,
          preflightCommitment: "confirmed",
          maxRetries: 3,
        });

        setLastTxSig(sig);

        await connection.confirmTransaction(
          {
            signature: sig,
            blockhash: built.latest.blockhash,
            lastValidBlockHeight: built.latest.lastValidBlockHeight,
          },
          "confirmed"
        );

        setProgressDone((prev) => prev + batch.length);

        setEmpties((prev) => {
          const closed = new Set(batch.map((x) => x.pubkey.toBase58()));
          return prev.filter((x) => !closed.has(x.pubkey.toBase58()));
        });
        setSelected((prev) => {
          const next = new Set(prev);
          batch.forEach((x) => next.delete(x.pubkey.toBase58()));
          return next;
        });
      }

      setStatus("✅ Done.");
      await refreshBalance();
    } catch (e: any) {
      setStatus(`❌ Claim error: ${e?.message ?? e}`);
    } finally {
      setClaiming(false);
    }
  }

  return (
    <div className="wrap">
      <div className="shell">
        <div className="header">
          <div>
            <h1 className="title">{t.title}</h1>
            <p className="subtitle">{t.subtitle}</p>
          </div>

          <div className="pill">
            <button className="btn" onClick={() => setLang(lang === "fi" ? "en" : "fi")}>
              {lang === "fi" ? "EN" : "FI"}
            </button>
          </div>
        </div>

        {/* TRUST LAYER */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="glowLine" />
          <div className="cardInner">
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{t.trustTitle}</div>
            <div style={{ color: "rgba(255,255,255,.70)", fontSize: 13, lineHeight: 1.55 }}>
              • {t.trustNoCustody}
              <br />• {t.trustNoSeed}
            </div>

            <div className="divider" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="kpi" style={{ padding: 12 }}>
                <div className="kLabel">{t.trustWhatCloses}</div>
                <div style={{ color: "rgba(255,255,255,.78)", fontSize: 13, lineHeight: 1.5 }}>
                  • {t.closes1}
                  <br />• {t.closes2}
                </div>
              </div>

              <div className="kpi" style={{ padding: 12 }}>
                <div className="kLabel">{t.trustWhatNever}</div>
                <div style={{ color: "rgba(255,255,255,.78)", fontSize: 13, lineHeight: 1.5 }}>
                  • {t.never1}
                  <br />• {t.never2}
                </div>
              </div>
            </div>

            <div className="divider" />
            <div style={{ color: "rgba(255,255,255,.45)", fontSize: 12, lineHeight: 1.5 }}>
              {t.feePolicy(bpsToPct(FEE_BPS))}
            </div>

            {lastTxUrl && (
              <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,.60)" }}>
                <b>{t.lastTx}:</b>{" "}
                <a href={lastTxUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "underline" }}>
                  {t.viewOnSolscan}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="card">
          <div className="glowLine" />
          <div className="cardInner">
            <div className="row">
              <div className="rowLeft">
                <WalletMultiButton />

                <button className="btn" onClick={scan} disabled={!publicKey || loading || claiming}>
                  {loading ? t.scanning : t.scan}
                </button>

                <button
                  className="btn"
                  onClick={claimSelected}
                  disabled={!publicKey || claiming || selectedList.length === 0}
                >
                  {claiming ? t.claiming : `${t.claim} (${selectedList.length})`}
                </button>

                <button className="btn" onClick={selectAll} disabled={!publicKey || empties.length === 0 || claiming}>
                  {t.selectAll}
                </button>

                <button className="btn" onClick={clearSelection} disabled={!publicKey || selected.size === 0 || claiming}>
                  {t.deselectAll}
                </button>
              </div>

              <div style={{ color: "rgba(255,255,255,.55)", fontSize: 12 }}>
                {connected && publicKey ? (
                  <>
                    {t.wallet}:{" "}
                    <span style={{ color: "rgba(255,255,255,.9)" }}>
                      {shortPk(publicKey.toBase58())}
                    </span>
                  </>
                ) : (
                  t.connectWallet
                )}
              </div>
            </div>

            <div className="divider" />

            <div className="kpiGrid">
              <div className="kpi">
                <div className="kLabel">{t.walletBalance}</div>
                <div className="kValue">{walletSol == null ? "—" : `${walletSol.toFixed(4)} SOL`}</div>
              </div>

              <div className="kpi">
                <div className="kLabel">{t.emptyAccounts}</div>
                <div className="kValue">{empties.length}</div>
              </div>

              <div className="kpi">
                <div className="kLabel">{t.rentPerAcc}</div>
                <div className="kValue">{rentPerAccSol == null ? "—" : `${rentPerAccSol.toFixed(6)} SOL`}</div>
              </div>

              <div className="kpi">
                <div className="kLabel">{t.estimatedReturn}</div>
                <div className="kValue">
                  {rentPerAccSol == null ? "—" : `${(rentPerAccSol * empties.length).toFixed(4)} SOL`}
                </div>
              </div>
            </div>

            <div className="status">
              <b>{t.status}:</b> {status || "—"}
              {claiming && (
                <>
                  {"\n"}
                  {t.progress(progressDone, progressTotal)}
                </>
              )}
              {lastTxSig && (
                <>
                  {"\n"}
                  <b>{t.lastTx}:</b> {lastTxSig}
                </>
              )}
            </div>

            <div className="divider" />

            <div className="row">
              <div style={{ color: "rgba(255,255,255,.65)", fontSize: 13 }}>
                {t.selected}:{" "}
                <b style={{ color: "rgba(255,255,255,.9)" }}>{selectedList.length}</b>{" "}
                (gross {safeToFixed(estimatedGrossSol, 6)} SOL • fee {safeToFixed(estimatedFeeSol, 6)} SOL • net{" "}
                {safeToFixed(estimatedNetSol, 6)} SOL)
              </div>

              <button className="btn" onClick={() => setShowList((s) => !s)}>
                {showList ? t.hideList : t.showList}
              </button>
            </div>

            {showList && (
              <>
                <div className="divider" />
                <div style={{ display: "grid", gap: 8 }}>
                  {empties.slice(0, MAX_PREVIEW).map((a) => {
                    const pk58 = a.pubkey.toBase58();
                    const isSel = selected.has(pk58);
                    return (
                      <div key={pk58} className="pillRow" style={{ justifyContent: "space-between" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <input type="checkbox" checked={isSel} onChange={() => toggleSelect(pk58)} />
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,.92)" }}>
                            {shortPk(pk58, 6, 6)}
                          </span>
                        </label>

                        <span style={{ color: "rgba(255,255,255,.45)", fontSize: 12 }}>
                          {t.program}: {a.program} • mint {shortPk(a.mint.toBase58(), 6, 4)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {empties.length > MAX_PREVIEW && (
                  <div style={{ marginTop: 10, color: "rgba(255,255,255,.45)", fontSize: 12 }}>
                    {lang === "fi"
                      ? `Näytetään ${MAX_PREVIEW}/${empties.length}`
                      : `Showing ${MAX_PREVIEW}/${empties.length}`}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
