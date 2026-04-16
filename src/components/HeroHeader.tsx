export default function HeroHeader() {
  return (
    <div className="flex items-center gap-3 mb-8">
      <img src={window.location.origin + "/assets/logo.png" className="w-8 h-8" />
      <span className="text-white text-lg tracking-wide">SOLINT</span>
    </div>
  );
}
