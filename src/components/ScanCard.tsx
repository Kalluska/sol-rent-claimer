export default function ScanCard() {
  return (
    <div className="p-6 rounded-2xl w-[420px]
      bg-white/5 backdrop-blur-xl
      border border-white/10
      shadow-[0_0_60px_rgba(168,85,247,0.25)]">

      <div className="flex justify-between items-center">
        <span className="text-gray-400">SOLINT</span>
        <span className="text-green-400 text-2xl">✔</span>
      </div>

      <h2 className="text-3xl font-bold mt-4">Scan complete</h2>

      <p className="text-gray-400 mt-2">
        We found <span className="text-purple-400">14</span> unused token accounts
      </p>

      <div className="mt-6 p-4 rounded-xl bg-white/5 flex justify-between">
        <div>
          <div className="text-gray-400 text-sm">Unused token accounts</div>
          <div className="text-white">Ready to clean</div>
        </div>
        <div className="text-purple-400 text-xl">14</div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-white/5 flex justify-between">
        <div>
          <div className="text-gray-400 text-sm">SOL to reclaim</div>
          <div className="text-white">Estimated amount</div>
        </div>
        <div className="text-cyan-400 text-xl">0.08 SOL</div>
      </div>

      <button className="mt-6 w-full py-4 rounded-xl text-lg font-semibold
        bg-gradient-to-r from-purple-500 to-pink-500
        shadow-[0_0_40px_rgba(168,85,247,0.4)]">
        Clean now →
      </button>

    </div>
  );
}
