const realTools = [
  {
    name: "Serper.dev",
    purpose: "Real-time web search",
    icon: "🔍",
    color: "text-cyan-400",
  },
  {
    name: "Vercel API",
    purpose: "Auto deployment",
    icon: "▲",
    color: "text-white",
  },
  {
    name: "GitHub API",
    purpose: "Source code management",
    icon: "⚫",
    color: "text-gray-300",
  },
  {
    name: "Supabase",
    purpose: "Vector database storage",
    icon: "🟢",
    color: "text-emerald-400",
  },
  {
    name: "Puppeteer",
    purpose: "Browser automation",
    icon: "🌐",
    color: "text-blue-400",
  },
  {
    name: "Clerk Auth",
    purpose: "Authentication",
    icon: "🔐",
    color: "text-violet-400",
  },
];

const principles = [
  {
    icon: "🚫",
    title: "Không setTimeout ảo",
    description: "Cấm hoàn toàn các lệnh trì hoãn giả lập. Mọi thao tác đều là thực tế.",
    bad: "setTimeout(() => {}, 2000)",
    good: "await realAPI.call()",
  },
  {
    icon: "🚫",
    title: "Không Mock JSON",
    description: "Không dữ liệu mẫu hay phản hồi tĩnh. Chỉ dữ liệu thật từ API thật.",
    bad: 'return { data: "mock" }',
    good: "return await fetch(realEndpoint)",
  },
  {
    icon: "🛡️",
    title: "Bảo mật nghiêm ngặt",
    description: "Allowlist cho đường dẫn tệp tin, denylist cho lệnh Terminal nguy hiểm.",
    bad: "exec(userInput)",
    good: "policy.validate(command)",
  },
];

export default function NoDemoSection() {
  return (
    <section id="no-demo" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-cyan-950/20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-emerald-400/20 bg-emerald-400/5 rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium tracking-wide">
              No Demo · Real Data
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Cam kết{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #00f5ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              100% Real Data
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Mọi hoạt động của AETHON đều dựa trên dữ liệu và kết nối thật.
            Không có bất kỳ dữ liệu giả hay mô phỏng nào.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Real tools */}
          <div>
            <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              Công cụ thật — API thật
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {realTools.map((tool) => (
                <div
                  key={tool.name}
                  className="card-glass rounded-xl p-4 flex items-center gap-3 hover:border-emerald-400/20 transition-all"
                >
                  <span className="text-2xl">{tool.icon}</span>
                  <div>
                    <div className={`font-semibold text-sm ${tool.color}`}>
                      {tool.name}
                    </div>
                    <div className="text-gray-500 text-xs">{tool.purpose}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Principles */}
          <div>
            <h3 className="text-white font-bold text-xl mb-6 flex items-center gap-2">
              <span className="text-cyan-400">⚡</span>
              Nguyên tắc bất biến
            </h3>
            <div className="space-y-4">
              {principles.map((p) => (
                <div
                  key={p.title}
                  className="card-glass rounded-xl p-5 hover:border-cyan-400/20 transition-all"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-xl">{p.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold text-sm">
                        {p.title}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1">
                        {p.description}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-red-950/30 border border-red-500/20 rounded-lg px-3 py-2">
                      <div className="text-red-400 text-xs font-medium mb-1">
                        ✗ Cấm
                      </div>
                      <code className="text-red-300/70 text-xs font-mono">
                        {p.bad}
                      </code>
                    </div>
                    <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg px-3 py-2">
                      <div className="text-emerald-400 text-xs font-medium mb-1">
                        ✓ Dùng
                      </div>
                      <code className="text-emerald-300/70 text-xs font-mono">
                        {p.good}
                      </code>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
