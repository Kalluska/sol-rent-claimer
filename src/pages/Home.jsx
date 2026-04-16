import React from "react";
import Header from "../components/Header";

export default function Home({ goClaim }) {
  return (
    <>
      <Header />

      <div style={{
        width: "100%",
        maxWidth: "1500px",
        margin: "0 auto",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "0 60px"
      }}>
        <div>
          <h1 style={{
            fontSize: "86px",
            fontWeight: 900,
            lineHeight: 0.95
          }}>
            Clean your{" "}
            <span style={{
              background: "linear-gradient(90deg,#9B5CFF,#EC4899)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Solana Wallet
            </span>{" "}
            in seconds.
          </h1>

          <p style={{
            marginTop: "24px",
            fontSize: "26px",
            color: "rgba(255,255,255,0.6)"
          }}>
            Scan and remove unused token accounts instantly.
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            onClick={goClaim}
            style={{
              padding: "24px 36px",
              fontSize: "24px",
              borderRadius: "20px",
              background: "linear-gradient(90deg,#8F4FFF,#EC4899)",
              border: 0,
              color: "white",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Clean now →
          </button>
        </div>
      </div>
    </>
  );
}
