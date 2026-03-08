export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-radial from-cyan-500/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-cyan-400 text-sm font-medium tracking-wide">
            AI Operating System · No Demo · Real Data
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight mb-6 leading-none">
          <span className="text-white">THE</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AETHON
          </span>
          <br />
          <span className="text-white">AI OS</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-4 leading-relaxed">
          Không chỉ là chatbot — AETHON là{" "}
          <span className="text-white font-semibold">
            Hệ điều hành AI tự trị
          </span>{" "}
          có khả năng tự phát triển ứng dụng, nghiên cứu thông tin, tự động hóa
          quy trình và quản lý dự án một cách độc lập.
        </p>
        <p className="text-base text-gray-500 max-w-2xl mx-auto mb-12">
          Designed by{" "}
          <span className="text-violet-400 font-medium">
            Nguyễn Văn Hoài Thương
          </span>{" "}
          · Founder &amp; Lead Architect
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 text-base">
            Khám phá AETHON
          </button>
          <button className="w-full sm:w-auto px-8 py-4 border border-white/10 text-gray-300 font-semibold rounded-xl hover:border-cyan-400/40 hover:text-white transition-all text-base bg-white/3">
            Xem kiến trúc →
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: "8", label: "Technology Pillars" },
            { value: "4", label: "Specialized Agents" },
            { value: "100%", label: "Real Data Only" },
            { value: "∞", label: "Self-Improving" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="card-glass rounded-xl p-4 transition-all duration-300"
            >
              <div
                className="text-3xl font-black mb-1"
                style={{
                  background:
                    "linear-gradient(135deg, #00f5ff 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#030712] to-transparent pointer-events-none" />
    </section>
  );
}
