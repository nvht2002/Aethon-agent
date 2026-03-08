const stackItems = [
  {
    category: "Frontend",
    icon: "🖥️",
    items: [
      { name: "Next.js 16", detail: "App Router + Server Components", color: "text-white" },
      { name: "React 19", detail: "Latest concurrent features", color: "text-cyan-400" },
      { name: "TypeScript 5", detail: "Strict mode enabled", color: "text-blue-400" },
      { name: "Tailwind CSS 4", detail: "Utility-first styling", color: "text-sky-400" },
    ],
  },
  {
    category: "Backend & AI",
    icon: "⚡",
    items: [
      { name: "Node.js / TypeScript", detail: "Runtime & type safety", color: "text-emerald-400" },
      { name: "Vercel AI SDK", detail: "Streaming real-time responses", color: "text-white" },
      { name: "Gemini API", detail: "Primary AI orchestrator", color: "text-violet-400" },
      { name: "Multi-Model Router", detail: "Gemini · OpenAI · Claude", color: "text-purple-400" },
    ],
  },
  {
    category: "Database & Memory",
    icon: "🧠",
    items: [
      { name: "Supabase Postgres", detail: "Primary database", color: "text-emerald-400" },
      { name: "pgvector", detail: "Vector similarity search", color: "text-green-400" },
      { name: "RAG Pipeline", detail: "Long-term context memory", color: "text-cyan-400" },
      { name: "Embeddings", detail: "Semantic search & retrieval", color: "text-teal-400" },
    ],
  },
  {
    category: "Infrastructure",
    icon: "🚀",
    items: [
      { name: "Vercel", detail: "Auto deployment platform", color: "text-white" },
      { name: "GitHub", detail: "Source control + PR automation", color: "text-gray-300" },
      { name: "Clerk Auth", detail: "Authentication & user management", color: "text-violet-400" },
      { name: "Puppeteer", detail: "Headless browser automation", color: "text-blue-400" },
    ],
  },
];

export default function TechStackSection() {
  return (
    <section id="stack" className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-violet-400/20 bg-violet-400/5 rounded-full px-4 py-2 mb-6">
            <span className="text-violet-400 text-sm font-medium tracking-wide">
              Tech Stack
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Cấu trúc kỹ thuật
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Được xây dựng trên nền tảng công nghệ hiện đại nhất — từ frontend
            đến AI infrastructure.
          </p>
        </div>

        {/* Stack grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stackItems.map((category) => (
            <div
              key={category.category}
              className="card-glass rounded-2xl p-6 hover:border-white/10 transition-all duration-300"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/5">
                <span className="text-2xl">{category.icon}</span>
                <h3 className="text-white font-bold text-sm">
                  {category.category}
                </h3>
              </div>

              {/* Items */}
              <div className="space-y-4">
                {category.items.map((item) => (
                  <div key={item.name} className="flex items-start gap-2">
                    <span className="text-white/20 mt-0.5 text-xs">▸</span>
                    <div>
                      <div className={`font-semibold text-sm ${item.color}`}>
                        {item.name}
                      </div>
                      <div className="text-gray-600 text-xs mt-0.5">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Package manager note */}
        <div className="mt-10 flex justify-center">
          <div className="card-glass rounded-xl px-6 py-4 flex items-center gap-4 border border-white/5">
            <span className="text-2xl">📦</span>
            <div>
              <div className="text-white font-semibold text-sm">
                Package Manager: Bun
              </div>
              <div className="text-gray-500 text-xs">
                Faster installs · Better DX · Native TypeScript support
              </div>
            </div>
            <div className="ml-4 px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-full text-amber-400 text-xs font-semibold">
              bun install
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
