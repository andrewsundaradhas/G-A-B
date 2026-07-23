export function Nav() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-lavender-mist/80 backdrop-blur-sm border-b border-mist">
      <span className="oryzo-label text-ink-plum text-[14px]">
        PS2GAT<span className="text-slate ml-2 text-[11px]">GAIT LAB</span>
      </span>
      <div className="flex items-center gap-6">
        <a href="#capture" className="oryzo-label text-ink-plum text-[12px] hover:underline">
          Capture
        </a>
        <a href="#results" className="oryzo-label text-ink-plum text-[12px] hover:underline">
          Results
        </a>
        <a href="#history" className="oryzo-label text-ink-plum text-[12px] hover:underline">
          History
        </a>
        <a
          href="#method"
          className="oryzo-label text-ink-plum text-[12px] border-b border-dashed border-fog hover:underline"
        >
          Method
        </a>
      </div>
    </nav>
  );
}
