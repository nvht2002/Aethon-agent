export default function FooterSection() {
  return (
    <footer className="relative border-t border-white/5 py-16">
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* CTA Banner */}
        <div className="relative rounded-3xl overflow-hidden mb-16">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-violet-600/10 to-cyan-500/10" />
          <div className="absolute inset-0 border border-white/5 rounded-3xl" />
          <div className="relative px-8 py-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Sẵn sàng trải nghiệm{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                AETHON AI OS
              </span>
              ?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
              Hệ điều hành AI tự trị đầu tiên — không demo, không dữ liệu giả,
              chỉ có kết quả thật.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105">
                Bắt đầu ngay →
              </button>
              <button className="px-8 py-4 border border-white/10 text-gray-300 font-semibold rounded-xl hover:border-white/20 hover:text-white transition-all">
                Tìm hiểu thêm
              </button>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">Æ</span>
            </div>
            <div>
              <div className="text-white font-bold text-base tracking-wider">
                AETHON
              </div>
              <div className="text-gray-600 text-xs">
                Autonomous AI Operating System
              </div>
            </div>
          </div>

          {/* Creator */}
          <div className="text-center">
            <div className="text-gray-500 text-sm">
              Designed &amp; Built by{" "}
              <span className="text-violet-400 font-semibold">
                Nguyễn Văn Hoài Thương
              </span>
            </div>
            <div className="text-gray-600 text-xs mt-1">
              Founder &amp; Lead Architect
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Operational
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
          © 2025 AETHON AI OS. All rights reserved. · No Demo · Real Data Only
        </div>
      </div>
    </footer>
  );
}
