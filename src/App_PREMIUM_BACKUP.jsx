import React from "react";

function LogoMark({ size = 140 }) {
  return (
    <img
      src="/assets/logo.png"
      alt="SOLINT"
      style={{
        width: size,
        height: size,
        objectFit: "contain"
      }}
    />
  );
}

export default function App() {
  const [page, setPage] = React.useState("home");

  return page === "home" ? (
    <div style={{
      width: "100vw",
      height: "100vh",
      background: "#070111",
      color: "#fff",
      fontFamily: "Inter, sans-serif",
      padding: "60px 80px"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "80px"
      }}>
        <LogoMark size={90} />
        <div style={{ fontSize: "36px", fontWeight: 900 }}>
          SOLINT
        </div>
      </div>

      {/* HERO */}
      <h1 style={{
        fontSize: "82px",
        fontWeight: 900,
        lineHeight: 1,
        maxWidth: "800px"
      }}>
        Clean your{" "}
        <span style={{
          background: "linear-gradient(90deg,#8F4FFF,#EC4899)",
          WebkitBackgroundClip: "text",
          color: "transparent"
        }}>
          Solana Wallet
        </span>{" "}
        in seconds.
      </h1>

      <p style={{
        marginTop: "30px",
        fontSize: "22px",
        opacity: 0.6
      }}>
        Scan and remove unused token accounts instantly.
      </p>

      {/* CTA */}
      <button
        onClick={() => setPage("claim")}
        style={{
          marginTop: "60px",
          padding: "20px 40px",
          fontSize: "22px",
          borderRadius: "20px",
          border: 0,
          background: "linear-gradient(90deg,#8F4FFF,#EC4899)",
          color: "#fff",
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        Scan your wallet
      </button>
    </div>
  ) : (
    <div style={{
      width: "100vw",
      minHeight: "100vh",
      background: "#070111",
      color: "#fff",
      padding: "60px 80px",
      fontFamily: "Inter, sans-serif"
    }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "60px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px"
        }}>
          <LogoMark size={80} />
          <div style={{ fontSize: "32px", fontWeight: 900 }}>
            SOLINT
          </div>
        </div>

        <button
          onClick={() => setPage("home")}
          style={{
            padding: "12px 24px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.05)",
            color: "#fff",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
      </div>

      {/* CONTENT */}
      <h1 style={{
        fontSize: "64px",
        fontWeight: 900,
        marginBottom: "20px"
      }}>
        Claim page
      </h1>

      <p style={{
        opacity: 0.6,
        marginBottom: "40px"
      }}>
        Wallet connect + scan + reclaim flow tulee tähän.
      </p>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        padding: "24px",
        borderRadius: "20px",
        marginBottom: "20px"
      }}>
        Connected: 9m7R...L8q2
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        padding: "24px",
        borderRadius: "20px",
        marginBottom: "20px"
      }}>
        Empty accounts: 14
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        padding: "24px",
        borderRadius: "20px",
        marginBottom: "30px",
        color: "#20D8FF",
        fontWeight: 700
      }}>
        0.08 SOL reclaimable
      </div>

      <button style={{
        padding: "20px 40px",
        fontSize: "20px",
        borderRadius: "20px",
        border: 0,
        background: "linear-gradient(90deg,#8F4FFF,#EC4899)",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer"
      }}>
        Connect wallet
      </button>
    </div>
  );
}
