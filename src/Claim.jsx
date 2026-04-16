export default function Claim() {
  return (
    <div className="h-screen w-screen bg-[#05010a] text-white flex items-center justify-center">

      <div className="w-[400px] bg-[#0d0618] p-6 rounded-2xl border border-white/10">

        <h2 className="text-2xl font-bold mb-4">Claim</h2>

        <div className="space-y-4">

          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-sm text-gray-400">Wallet</p>
            <p>Not connected</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-sm text-gray-400">Empty accounts</p>
            <p>0</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl">
            <p className="text-sm text-gray-400">Estimated</p>
            <p>0.00 SOL</p>
          </div>

        </div>

        <button className="mt-6 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          Connect wallet
        </button>

      </div>
    </div>
  );
}
