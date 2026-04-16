import { useState } from "react";
import HeroPro from "./components/HeroPro";
import ClaimApp from "./App";

export default function AppSafe() {
  const [page, setPage] = useState<"home" | "claim">("home");

  if (page === "home") {
    return <HeroPro onScan={() => setPage("claim")} />;
  }

  return <ClaimApp />;
}
