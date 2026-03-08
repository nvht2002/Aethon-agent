import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#030712]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Æ</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wider">
              AETHON
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#brain-loop"
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              Architecture
            </a>
            <a
              href="#pillars"
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              Technology
            </a>
            <a
              href="#agents"
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              Agents
            </a>
            <a
              href="#stack"
              className="text-gray-400 hover:text-cyan-400 text-sm transition-colors"
            >
              Stack
            </a>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live System
            </span>
            <Link
              href="/chat"
              className="text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
            >
              Launch App
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
