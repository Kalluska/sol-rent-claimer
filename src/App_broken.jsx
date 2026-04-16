import React, { useEffect, useMemo, useState } from "react";

/* ============================================================================
   ROUTING
============================================================================ */

function getHashPage() {
  const hash = window.location.hash || "#/";
  return hash === "#/claim" ? "claim" : "home";
}

/* ============================================================================
   BRAND / ICONS
============================================================================ */

function LogoMark({ size = 138 }) {
  return (
    <img
      src="/assets/logo.png"
      alt="SOLINT"
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}

function ShieldIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      <path
        d="M27 7l15 7v11c0 9.3-6.2 16.3-15 20-8.8-3.7-15-10.7-15-20V14l15-7z"
        stroke="#9F7AEA"
        strokeWidth="2.8"
      />
      <path
        d="M21.4 27.2l4.1 4.1 7.6-8.9"
        stroke="#9F7AEA"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      <rect
        x="14"
        y="22"
        width="26"
        height="18"
        rx="4"
        stroke="#9F7AEA"
        strokeWidth="2.8"
      />
      <path
        d="M19.5 22v-5.5c0-5 3-8.5 7.5-8.5s7.5 3.5 7.5 8.5V22"
        stroke="#9F7AEA"
        strokeWidth="2.8"
      />
      <circle cx="27" cy="30" r="2.2" fill="#9F7AEA" />
      <path
        d="M27 32.4v3"
        stroke="#9F7AEA"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      <path
        d="M31.5 8L17 30h9.2l-2.5 16L38 24.7h-9.6L31.5 8z"
        stroke="#9F7AEA"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ScanBrandIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" aria-hidden="true">
      <defs>
        <linearGradient
          id="scanGradA"
          x1="7"
          y1="12"
          x2="40"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2EF2C3" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      <path d="M10 13h23l-4.5 5.2H5.5L10 13z" fill="url(#scanGradA)" />
      <path d="M15 23.2h23l-4.5 5.2H10.5l4.5-5.2z" fill="url(#scanGradA)" />
      <path d="M20 33.4h23l-4.5 5.2H15.5l4.5-5.2z" fill="url(#scanGradA)" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none" aria-hidden="true">
      <circle cx="34" cy="34" r="25" stroke="#1EE7A8" strokeWidth="3.5" />
      <path
        d="M25.8 34.6l6.2 6.2 12.2-15.2"
        stroke="#1EE7A8"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashRoundIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="44" height="44" rx="22" fill="rgba(168,85,247,0.18)" />
      <path
        d="M16 16h14M18 16v-2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0l.9 13a1 1 0 001 .9h4.2a1 1 0 001-.9l.9-13m-6 4v6m4-6v6"
        stroke="#C084FC"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SolRoundIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="44" height="44" rx="22" fill="rgba(34,216,255,0.12)" />
      <path
        d="M15 14h14l-2.9 3.2H12.1L15 14zm3 6.2h14l-2.9 3.2H15.1l2.9-3.2zm3 6.2h14l-2.9 3.2H18.1l2.9-3.2z"
        fill="#20D8FF"
      />
    </svg>
  );
}

function GhostIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 3.6c5.2 0 9.3 4.1 9.3 9.3v8.5c0 .6-.6.9-1 .6l-2.2-1.6-2 1.6a.8.8 0 01-1 0l-2-1.6-2 1.6a.8.8 0 01-1 0l-2-1.6L5 22c-.4.3-1 .1-1-.5v-8.6c0-5.2 4-9.3 9-9.3z"
        fill="#DCCBFF"
      />
      <circle cx="10.2" cy="12.7" r="1.15" fill="#28143E" />
      <circle cx="15.8" cy="12.7" r="1.15" fill="#28143E" />
    </svg>
  );
}

  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================================
   BACKGROUND
============================================================================ */

function BackgroundArt({ claim = false }) {
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: claim
            ? "radial-gradient(circle at 16% 10%, rgba(33,26,89,0.42), transparent 28%), radial-gradient(circle at 88% 18%, rgba(86,31,160,0.16), transparent 34%), #070111"
            : "radial-gradient(circle at 13% 9%, rgba(33,26,89,0.55), transparent 30%), radial-gradient(circle at 88% 16%, rgba(86,31,160,0.16), transparent 30%), #070111",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: claim ? "-120px" : "-100px",
          top: claim ? "110px" : "95px",
          width: claim ? "650px" : "700px",
          height: claim ? "650px" : "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 38%, rgba(212,168,255,0.54), rgba(139,92,246,0.28) 42%, rgba(80,32,140,0.1) 63%, transparent 76%)",
          filter: claim ? "blur(26px)" : "blur(22px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: claim ? "126px" : "120px",
          top: claim ? "226px" : "208px",
          width: claim ? "560px" : "620px",
          height: claim ? "400px" : "430px",
          borderRadius: "50%",
          border: "1.2px solid rgba(151,98,255,0.16)",
          transform: "rotate(-16deg)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: claim ? "174px" : "160px",
          top: claim ? "246px" : "230px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: "#8B5CF6",
          boxShadow: "0 0 18px rgba(139,92,246,0.85)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: claim ? "126px" : "108px",
          top: claim ? "540px" : "560px",
          width: "11px",
          height: "11px",
          borderRadius: "50%",
          background: "#8B5CF6",
          boxShadow: "0 0 18px rgba(139,92,246,0.85)",
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/* ============================================================================
   BUTTONS
============================================================================ */

function PrimaryButton({
  children,
  onClick,
  width = "100%",
  fontSize = "24px",
  padding = "26px 28px",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width,
        padding,
        fontSize,
        border: 0,
        borderRadius: "28px",
        background: "linear-gradient(90deg, #8F4FFF 0%, #EC4899 100%)",
        color: "#FFFFFF",
        fontWeight: 900,
        letterSpacing: "-0.03em",
        boxShadow:
          "0 0 34px rgba(168,85,247,0.34), 0 12px 40px rgba(236,72,153,0.16)",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "15px 18px",
        minWidth: "120px",
        borderRadius: "18px",
        border: "1px solid rgba(255,255,255,0.09)",
        background: "rgba(255,255,255,0.02)",
        color: "#FFFFFF",
        fontWeight: 700,
        fontSize: "17px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/* ============================================================================
   HOME
============================================================================ */

function HomeHeader() {
  return (
    <div
      style={{
        position: "absolute",
        top: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "calc(100% - 96px)",
        maxWidth: "1540px",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-start",
        zIndex: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0px",
          marginLeft: "96px",
        }}
      >
        <LogoMark size={146} />

        <div
          style={{
            fontSize: "31px",
            fontWeight: 900,
            letterSpacing: "0.05em",
            color: "#FFFFFF",
            lineHeight: 1,
            transform: "translateY(-1px)",
          }}
        >
          SOLINT
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, label, width = "120px" }) {
  return (
    <div
      style={{
        width,
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>

      <div
        style={{
          marginTop: "12px",
          fontSize: "18px",
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function HeroLeft({ goClaim }) {
  return (
    <section
      style={{
        paddingLeft: "12px",
        maxWidth: "760px",
        marginTop: "26px",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "84px",
          lineHeight: 0.93,
          letterSpacing: "-0.065em",
          fontWeight: 900,
        }}
      >
        Clean your{" "}
        <span
          style={{
            background:
              "linear-gradient(90deg, #9B5CFF 0%, #AE68FF 46%, #EC4899 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Solana Wallet
        </span>{" "}
        in seconds.
      </h1>

      <p
        style={{
          marginTop: "34px",
          maxWidth: "590px",
          fontSize: "26px",
          lineHeight: 1.42,
          color: "rgba(255,255,255,0.58)",
        }}
      >
        Scan and remove unused token accounts instantly.
      </p>

      <div
        style={{
          display: "flex",
          gap: "66px",
          marginTop: "66px",
          alignItems: "center",
        }}
      >
        <FeatureItem
          icon={<ShieldIcon />}
          label="Non-custodial"
          width="128px"
        />

        <FeatureItem
          icon={<LockIcon />}
          label="Secure"
          width="120px"
        />

        <FeatureItem
          icon={<BoltIcon />}
          label="Fast & Open Source"
          width="176px"
        />
      </div>

      <div style={{ marginTop: "42px", maxWidth: "360px" }}>
        <PrimaryButton onClick={goClaim}>Scan your wallet</PrimaryButton>
      </div>
    </section>
  );
}

function ScanCard({ goClaim }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "646px",
        borderRadius: "32px",
        border: "1.5px solid rgba(180,124,255,0.28)",
        background: "linear-gradient(180deg, rgba(7,8,16,0.98), rgba(6,7,14,0.98))",
        boxShadow:
          "0 0 86px rgba(124,58,237,0.12), inset 0 0 0 1px rgba(255,255,255,0.03)",
        padding: "38px 42px 30px 42px",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0px",
          }}
        >
          <ScanBrandIcon />

          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              letterSpacing: "-0.03em",
            }}
          >
            Scan complete
          </div>
        </div>

        <CheckIcon />
      </div>

      <div
        style={{
          marginTop: "24px",
          color: "rgba(255,255,255,0.66)",
          fontSize: "19px",
          lineHeight: 1.5,
        }}
      >
        We found{" "}
        <span
          style={{
            color: "#B87BFF",
            fontWeight: 700,
          }}
        >
          14
        </span>{" "}
        unused token accounts
      </div>

      <div
        style={{
          height: "1px",
          background: "rgba(255,255,255,0.08)",
          margin: "28px 0 22px 0",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.04)",
          padding: "21px 24px",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0px",
          }}
        >
          <TrashRoundIcon />

          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              Unused token accounts
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "16px",
                color: "rgba(255,255,255,0.58)",
              }}
            >
              Ready to clean
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "30px",
            fontWeight: 800,
            color: "#B87BFF",
          }}
        >
          14
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0px",
          borderRadius: "28px",
          background: "rgba(255,255,255,0.035)",
          border: "1px solid rgba(255,255,255,0.04)",
          padding: "21px 24px",
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0px",
          }}
        >
          <SolRoundIcon />

          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              SOL to reclaim
            </div>

            <div
              style={{
                marginTop: "5px",
                fontSize: "16px",
                color: "rgba(255,255,255,0.58)",
              }}
            >
              Estimated amount
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "20px",
            fontWeight: 800,
            color: "#20D8FF",
          }}
        >
          0.08 SOL
        </div>
      </div>

      <PrimaryButton onClick={goClaim}>Clean now →</PrimaryButton>

      <div
        style={{
          marginTop: "24px",
          width: "fit-content",
          minWidth: "376px",
          maxWidth: "100%",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.03)",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          color: "rgba(255,255,255,0.88)",
          fontSize: "16px",
        }}
      >
        <LockIcon />

        <span>
          Built for{" "}
          <span
            style={{
              color: "#B87BFF",
              fontWeight: 700,
            }}
          >
            Phantom
          </span>{" "}
          users
        </span>

        <GhostIcon />
      </div>
    </div>
  );
}

function HomePage({ goClaim }) {
  return (
    <>
      <HomeHeader />

      <div
        style={{
          width: "100%",
          maxWidth: "1540px",
          height: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1.05fr 0.95fr",
          alignItems: "center",
          gap: "48px",
          padding: "0 58px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <HeroLeft goClaim={goClaim} />

        <section
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ScanCard goClaim={goClaim} />
        </section>
      </div>
    </>
  );
}

/* ============================================================================
   CLAIM
============================================================================ */

function ClaimHeaderRow({ goHome }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0px",
        }}
      >
        <LogoMark size={118} />

        <div
          style={{
            fontSize: "28px",
            fontWeight: 900,
            letterSpacing: "0.05em",
            color: "#FFFFFF",
            transform: "translateY(-1px)",
          }}
        >
          SOLINT
        </div>
      </div>

      <SecondaryButton onClick={goHome}>
        <BackArrowIcon />
        Back
      </SecondaryButton>
    </div>
  );
}

function StatCard({ label, value, accent = false }) {
  return (
    <div
      style={{
        borderRadius: "28px",
        background: "rgba(255,255,255,0.035)",
        border: "1px solid rgba(255,255,255,0.04)",
        padding: "22px 26px",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          color: "rgba(255,255,255,0.58)",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "28px",
          fontWeight: 800,
          color: accent ? "#20D8FF" : "#FFFFFF",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function ClaimPage({ goHome }) {
  const wallet = useMemo(() => "9m7R...L8q2", []);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1540px",
        height: "100%",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 58px",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "980px",
          borderRadius: "32px",
          border: "1.5px solid rgba(180,124,255,0.28)",
          background: "linear-gradient(180deg, rgba(7,8,16,0.98), rgba(6,7,14,0.98))",
          boxShadow:
            "0 0 86px rgba(124,58,237,0.12), inset 0 0 0 1px rgba(255,255,255,0.03)",
          padding: "34px 38px 36px 38px",
          position: "relative",
          overflowX: "hidden",
        }}
      >
        <ClaimHeaderRow goHome={goHome} />

        <div
          style={{
            fontSize: "58px",
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: "-0.05em",
          }}
        >
          Claim page
        </div>

        <div
          style={{
            marginTop: "20px",
            maxWidth: "760px",
            fontSize: "19px",
            lineHeight: 1.55,
            color: "rgba(255,255,255,0.58)",
          }}
        >
          Tästä jatketaan oikeaan wallet connect + scan + reclaim flow&apos;hun.
        </div>

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "16px",
          }}
        >
          <StatCard label="Wallet" value={`Connected: ${wallet}`} />
          <StatCard label="Empty accounts" value="14" />
          <StatCard label="Estimated reclaim" value="0.08 SOL" accent />
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <SecondaryButton onClick={goHome}>
            <BackArrowIcon />
            Back
          </SecondaryButton>

          <PrimaryButton onClick={() => {}}>Connect wallet</PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   APP
============================================================================ */

export default function App() {
  const [page, setPage] = useState(() => getHashPage());

  useEffect(() => {
    const onHashChange = () => {
      setPage(getHashPage());
    };

    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const goHome = () => {
    window.location.hash = "#/";
    setPage("home");
  };

  const goClaim = () => {
    window.location.hash = "#/claim";
    setPage("claim");
  };

  const isClaim = page === "claim";

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflowX: "hidden",
        overflowY: "auto",
        position: "relative",
        background: "#070111",
        color: "#F5F5F7",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      <BackgroundArt claim={isClaim} />

      {isClaim ? (
        <ClaimPage goHome={goHome} />
      ) : (
        <HomePage goClaim={goClaim} />
      )}
    </div>
  );
}
