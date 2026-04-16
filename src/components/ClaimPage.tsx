import { useEffect } from "react";

export default function ClaimPage({
  connected,
  publicKey,
  walletSol,
  empties,
  onBack,
  onClaim
}: any) {

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030303",
      color: "white",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px",
      fontFamily: "Inter, sans-serif"
    }}>

      <div style={{
        width: "100%",
        maxWidth: "900px",
        borderRadius: "28px",
        padding: "28px",
        background: "linear-gradient(180deg, rgba(18,18,22,0.95), rgba(8,8,10,0.95))",
        border: "1px solid rgba(168,85,247,0.3)",
        boxShadow: "0 0 80px rgba(124,58,237,0.2)"
      }}>

        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>SOLINT</div>
            <div style={{ fontSize: "32px", fontWeight: "800" }}>Claim SOL</div>
          </div>

          <button onClick={onBack} style={{
            background: "none",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "white",
            padding: "8px 14px",
            borderRadius: "10px",
            cursor: "pointer"
          }}>
            ← Back
          </button>
        </div>

        {/* WALLET */}
        <div style={{
          marginTop: "20px",
          padding: "16px",
          borderRadius: "14px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)"
        }}>
          <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>Wallet</div>
          <div style={{ marginTop: "6px", fontWeight: "600" }}>
            {connected ? publicKey?.toString().slice(0, 8) + "..." : "Not connected"}
          </div>
        </div>

        {/* STATS */}
        <div style={{
          display: "grid",
          gap: "14px",
          marginTop: "18px"
        }}>

          <div style={{
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.03)"
          }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
              Empty accounts
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {empties?.length || 0}
            </div>
          </div>

          <div style={{
            padding: "16px",
            borderRadius: "14px",
            background: "rgba(255,255,255,0.03)"
          }}>
            <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
              Wallet balance
            </div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {walletSol ?? "--"} SOL
            </div>
          </div>

        </div>

        {/* CLAIM BUTTON */}
        <button
          onClick={onClaim}
          disabled={!connected || !empties?.length}
          style={{
            marginTop: "22px",
            width: "100%",
            padding: "18px",
            borderRadius: "16px",
            border: "none",
            fontSize: "18px",
            fontWeight: "700",
            cursor: "pointer",
            background: "linear-gradient(90deg, #7c3aed, #a855f7)",
            color: "white",
            opacity: (!connected || !empties?.length) ? 0.5 : 1
          }}
        >
          Claim SOL
        </button>

      </div>
    </div>
  );
}
