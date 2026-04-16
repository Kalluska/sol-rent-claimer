export default function HeroPro({ onScan }: { onScan: () => void }) {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(168,85,247,0.28),transparent_0_26%),radial-gradient(circle_at_18%_82%,rgba(99,102,241,0.12),transparent_0_22%)]" />

      <div className="absolute w-[900px] h-[900px] rounded-full blur-[180px] bg-purple-600/20 -top-[280px] -right-[220px]" />
      <div className="absolute w-[700px] h-[700px] rounded-full blur-[180px] bg-blue-500/10 -bottom-[220px] -left-[140px]" />

      <div className="relative z-10 max-w-7xl w-full grid md:grid-cols-2 gap-14 items-center">
        <div>
          <div className="flex items-center gap-4 mb-8">
            <img
              src="/solint-logo.png"
              alt="SOLINT"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="text-3xl font-semibold tracking-wide">SOLINT</div>
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-[-0.04em]">
            Clean your <span className="text-purple-400">Solana wallet</span> in seconds.
          </h1>

          <p className="text-gray-300/80 mt-8 text-2xl leading-relaxed max-w-2xl">
            Scan and remove unused token accounts instantly.
          </p>

          <div className="flex gap-12 mt-14 text-purple-300/90 text-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">🛡️</div>
              <div className="text-center leading-tight">Non-custodial</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">🔒</div>
              <div className="text-center leading-tight">Secure</div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="text-5xl">⚡</div>
              <div className="text-center leading-tight">Fast & Open Source</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 rounded-[32px] bg-purple-500/10 blur-3xl" />

          <div className="relative rounded-[32px] border border-purple-300/30 bg-[linear-gradient(180deg,rgba(10,10,16,0.96),rgba(6,6,10,0.98))] p-8 shadow-[0_0_80px_rgba(124,58,237,0.18)]">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="text-white/50 text-2xl mb-2">SOLINT</div>
                <div className="text-6xl font-extrabold tracking-[-0.03em]">Scan complete</div>
              </div>
              <div className="w-20 h-20 rounded-full border-2 border-emerald-400 flex items-center justify-center text-5xl text-emerald-400">
                ✓
              </div>
            </div>

            <div className="text-white/70 text-2xl mb-8">
              We found <span className="text-purple-400 font-semibold">14</span> unused token accounts
            </div>

            <div className="border-t border-white/10 my-6" />

            <div className="grid gap-5">
              <div className="rounded-[24px] border border-white/8 bg-white/3 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl">🗑️</div>
                  <div>
                    <div className="text-2xl font-semibold">Unused token accounts</div>
                    <div className="text-white/55 text-xl">Ready to clean</div>
                  </div>
                </div>
                <div className="text-purple-400 font-bold text-5xl">14</div>
              </div>

              <div className="rounded-[24px] border border-white/8 bg-white/3 p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-cyan-400/10 flex items-center justify-center text-3xl">◎</div>
                  <div>
                    <div className="text-2xl font-semibold">SOL to reclaim</div>
                    <div className="text-white/55 text-xl">Estimated amount</div>
                  </div>
                </div>
                <div className="text-cyan-400 font-bold text-5xl">0.08 SOL</div>
              </div>
            </div>

            <button
              onClick={onScan}
              className="w-full mt-8 py-6 rounded-[22px] bg-gradient-to-r from-purple-600 to-fuchsia-400 text-3xl font-bold shadow-[0_0_40px_rgba(168,85,247,0.35)] hover:opacity-95 transition"
            >
              Clean now →
            </button>

            <div className="mt-8 rounded-full border border-white/10 bg-white/3 px-6 py-4 inline-flex items-center gap-3 text-xl text-white/80">
              <span className="text-2xl">👻</span>
              Built for <span className="text-purple-300 font-semibold">Phantom</span> users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
