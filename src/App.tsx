import { useState } from "react";

function Logo() {
  return (
    <img src="/assets/logo.png" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
  );
}
      SOLINT
    </div>
  );
}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="h-screen w-screen overflow-hidden text-white relative">

      {/* 🔥 BACKGROUND */}
      <div className="absolute inset-0 bg-[#05010a]" />
      
      {/* Glow / planet */}
      <div className="absolute right-[-200px] top-[100px] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute left-[-200px] top-[200px] w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />

      <div className="relative z-10 h-full flex items-center justify-center px-10">

        <div className="w-full max-w-[1400px] grid grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
<Logo />
<div style={{ fontSize: "19px", letterSpacing: "0.06em", fontWeight: 800, color: "rgba(255,255,255,0.98)" }}>
  SOLINT
</div>
              Scan and remove unused token accounts instantly.
            </p>

            {/* ICONS */}
            <div className="flex gap-10 mt-10 text-white/70">

              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">🛡️</div>
                <span>Non-custodial
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">🔒</div>
                <span>Secure
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-3xl">⚡</div>
                <span>Fast & Open Source
              </div>

            </div>

            <button onClick={() => window.location.href="/claim"}
              onClick={() => setPage("claim")}
              className="mt-12 px-10 py-5 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
            >
              Scan your wallet
            </button>
          </div>

          {/* RIGHT CARD */}
          <div className="flex justify-end">
            <div className="w-[420px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8">

              <div className="flex justify-between items-center">
                <span className="text-white/50">SOLINT
                <span className="text-green-400 text-3xl">✓
              </div>

              <h2 className="text-5xl font-bold mt-4">
                Scan <br /> complete
              </h2>

              <p className="text-white/60 mt-4">
                We found <span className="text-purple-400 font-bold">14 unused token accounts
              </p>

              <div className="mt-6 border-t border-white/10 pt-6 space-y-4">

                <div className="flex justify-between bg-white/5 p-4 rounded-xl">
                  <div>
                    <div className="font-bold">Unused token accounts</div>
                    <div className="text-white/50">Ready to clean</div>
                  </div>
                  <div className="text-purple-400 text-3xl font-bold">14</div>
                </div>

                <div className="flex justify-between bg-white/5 p-4 rounded-xl">
                  <div>
                    <div className="font-bold">SOL to reclaim</div>
                    <div className="text-white/50">Estimated amount</div>
                  </div>
                  <div className="text-cyan-400 text-3xl font-bold">0.08 SOL</div>
                </div>

              </div>

              <button onClick={() => window.location.href="/claim"}
                onClick={() => setPage("claim")}
                className="mt-6 w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 font-bold"
              >
                Clean now →
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
