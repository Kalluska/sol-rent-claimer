export default function Claim() {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-[#05050a]">

      {/* RIGHT BACKGROUND GLOW */}
      <div className="absolute right-[-200px] top-1/2 h-[800px] w-[800px] -translate-y-1/2 rounded-full bg-gradient-to-br from-purple-600/30 via-indigo-500/20 to-blue-500/10 blur-[120px]" />

      {/* CONTENT */}
      <div className="relative z-10 w-full max-w-7xl px-12 grid md:grid-cols-2 gap-20 items-center">

        {/* LEFT */}
        <div>

          {/* LOGO TEXT FIXED SPACING */}
          <h1 className="text-[72px] leading-[1.05] font-semibold tracking-tight">
            Clean your
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 bg-clip-text text-transparent">
              Solana wallet
            </span>
            <br />
            in seconds.
          </h1>

          <p className="mt-6 text-lg text-white/60 max-w-lg">
            Scan and remove unused token accounts instantly.
          </p>

          {/* FEATURES (LIKE ORIGINAL) */}
          <div className="mt-12 flex gap-16 text-sm text-white/60">

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                ✓
              </div>
              <span>Non-custodial</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                🔒
              </div>
              <span>Secure</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                ⚡
              </div>
              <span>Fast & Open Source</span>
            </div>

          </div>

        </div>

        {/* RIGHT CARD */}
        <div className="flex justify-center">

          <div className="relative w-[420px] rounded-[30px] border border-white/10 bg-[#0b0b1a]/90 backdrop-blur-xl p-8 shadow-[0_0_80px_rgba(139,92,246,0.2)]">

            {/* INNER GLOW */}
            <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-xl" />

            <div className="relative">

              {/* HEADER */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-blue-400" />
                  <span className="text-lg font-semibold">Scan complete</span>
                </div>
                <div className="text-purple-400 text-xl">✓</div>
              </div>

              {/* TEXT */}
              <p className="text-white/60 mb-6">
                We found <span className="text-purple-400 font-medium">14</span> unused token accounts
              </p>

              {/* ROWS */}
              <div className="space-y-5">

                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-white/60">Unused token accounts</span>
                  <span>14</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-white/60">SOL to reclaim</span>
                  <span className="text-green-400 font-medium">0.08 SOL</span>
                </div>

              </div>

              {/* CTA */}
              <button className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 py-3 font-semibold text-white hover:opacity-90 transition">
                Clean now →
              </button>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
