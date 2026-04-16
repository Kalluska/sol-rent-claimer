import React from "react";
import Logo from "./Logo";

export default function Header() {
  return (
    <div style={{
      position: "absolute",
      top: "24px",
      left: "72px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      zIndex: 10
    }}>
      <Logo />
      <div style={{
        fontSize: "32px",
        fontWeight: 900
      }}>
        SOLINT
      </div>
    </div>
  );
}
