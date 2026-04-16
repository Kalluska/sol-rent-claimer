export default function HeroFix() {
  return (
    <>
      {/* PLANET BACKGROUND */}
      <div style={{
        position: "absolute",
        right: "-120px",
        top: "80px",
        width: "600px",
        height: "600px",
        background: "radial-gradient(circle, rgba(168,85,247,0.25) 0%, rgba(168,85,247,0.12) 40%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(60px)",
        zIndex: 0
      }} />

      <div style={{
        position: "absolute",
        right: "50px",
        top: "120px",
        width: "480px",
        height: "480px",
        borderRadius: "50%",
        background: "radial-gradient(circle at 30% 30%, rgba(217,70,239,0.25), transparent 70%)",
        filter: "blur(40px)",
        zIndex: 0
      }} />

      {/* LOGO (FIXED PERFECT) */}
      <div style={{
        position: "absolute",
        top: "40px",
        left: "70px",
        display: "flex",
        alignItems: "center",
        gap: "18px",
        zIndex: 10
      }}>
        <img
          src="/assets/logo.png"
          style={{
            width: "64px",
            height: "64px",
            objectFit: "contain",
            filter: "drop-shadow(0 0 35px rgba(168,85,247,0.65))"
          }}
        />
        <span style={{
          fontSize: "22px",
          fontWeight: 800,
          letterSpacing: "0.08em"
        }}>
          SOLINT
        </span>
      </div>
    </>
  );
}
