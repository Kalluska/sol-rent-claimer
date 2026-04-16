export default function HeroSection({ onScan }: { onScan: () => void }) {
  return (
    <div className="flex flex-col justify-center">

      <h1 className="text-[64px] leading-[1.05] font-bold">
        Clean your{" "}
        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Solana wallet
        </span>{" "}
        in seconds.
      </h1>

      <p className="mt-6 text-gray-400 text-lg max-w-xl">
        Scan and remove unused token accounts instantly.
      </p>

      <div className="flex gap-12 mt-10 text-sm text-gray-400">
        <div className="flex items-center gap-2">🛡 Non-custodial</div>
        <div className="flex items-center gap-2">🔒 Secure</div>
        <div className="flex items-center gap-2">⚡ Fast & Open Source</div>
      </div>

      <button onClick={() => window.location.href="/claim"}
        onClick={onScan}
        className="mt-10 w-[320px] py-4 rounded-xl text-lg font-semibold
        bg-gradient-to-r from-purple-500 to-pink-500
        hover:opacity-90 transition
        shadow-[0_0_40px_rgba(168,85,247,0.4)]"
      >
        Scan your wallet
      </button>

    </div>
  );
}
