import React from "react";

export default function Logo() {
  return (
    <img
      src="/assets/logo.png"
      alt="logo"
      style={{
        width: 140,
        height: 140,
        objectFit: "contain"
      }}
    />
  );
}
