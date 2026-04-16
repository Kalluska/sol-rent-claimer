export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white transition-colors duration-300">
      <header className="w-full">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <img
                src="/logo.png"
                alt="Solint logo"
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
            <span className="text-3xl font-semibold tracking-tight">Solint</span>
          </div>

          <button
            onClick={() => {
              const root = document.documentElement;
              root.classList.toggle("dark");
              localStorage.setItem(
                "theme",
                root.classList.contains("dark") ? "dark" : "light"
              );
            }}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10"
          >
            Toggle
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-88px)] w-full max-w-6xl items-center px-6 pb-10 md:px-8">
        {children}
      </main>
    </div>
  );
}
