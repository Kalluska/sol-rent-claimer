import React from "react";

export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");

    if (isDark) {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <button
      onClick={toggle}
      className="absolute top-6 right-6 text-sm opacity-70 hover:opacity-100"
    >
      Toggle
    </button>
  );
}
