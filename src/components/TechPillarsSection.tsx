const pillars = [
  {
    number: "01",
    title: "Self-Mutation Engine",
    description:
      "AI tự đọc và ghi đè mã nguồn của chính nó thông qua GitHub PR với cơ chế rollback an toàn. Không cần lập trình viên can thiệp.",
    icon: "🧬",
    tag: "Self-Evolving",
    color: "cyan",
  },
  {
    number: "02",
    title: "CodeRabbit Review",
    description:
      "Tự động phân tích Pull Request, phát hiện SQL Injection, Memory Leak và tự tạo bản vá tức thời trước khi merge.",
    icon: "🔍",
    tag: "Security",
    color: "blue",
  },
  {
    number: "03",
    title: "Gemini Orchestrator",
    description:
      'Sử dụng Gemini làm "bộ não" điều phối mọi công cụ thông qua cơ chế Function Calling thông minh và hiệu quả.',
    icon: "🌐",
    tag: "Orchestration",
    color: "violet",
  },
  {
    number: "04",
    title: "Vector Memory (RAG)",
    description:
      "Bộ nhớ dài hạn lưu trữ toàn bộ ngữ cảnh dự án vào Supabase Vector (pgvector) để tra cứu tương đồng siêu tốc.",
    icon: "🧠",
    tag: "Long-term Memory",
    color: "purple",
  },
  {
    number: "05",
    title: "AI-to-UI Automation",
    description:
      "Tương tác với bất kỳ giao diện web nào thông qua trình duyệt ảo Puppeteer — điền form, click, scrape dữ liệu.",
    icon: "🖥️",
    tag: "Browser Control",
    color: "pink",
  },
  {
    number: "06",
    title: "One-Click Deploy",
    description:
      "Tự động đẩy mã nguồn lên GitHub và triển khai trực tiếp lên Vercel. Từ ý tưởng đến production trong vài giây.",
    icon: "🚀",
    tag: "Auto Deploy",
    color: "emerald",
  },
  {
    number: "07",
    title: "Multi-Model Routing",
    description:
      "Định tuyến thông minh giữa Gemini, OpenAI, Claude để tối ưu hóa chi phí và hiệu suất theo từng loại tác vụ.",
    icon: "⚡",
    tag: "Cost Optimization",
    color: "amber",
  },
  {
    number: "08",
    title: "Autonomous Reasoning",
    description:
      "Tự suy luận và tự cải thiện quy trình làm việc theo thời gian thông qua hệ thống học máy nội bộ.",
    icon: "🔮",
    tag: "Self-Improving",
    color: "rose",
  },
];

const colorMap: Record<string, { border: string; tag: string; glow: string; number: string }> = {
  cyan: {
    border: "hover:border-cyan-400/30",
    tag: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
    glow: "group-hover:shadow-cyan-500/10",
    number: "text-cyan-400",
  },
  blue: {
    border: "hover:border-blue-400/30",
    tag: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    glow: "group-hover:shadow-blue-500/10",
    number: "text-blue-400",
  },
  violet: {
    border: "hover:border-violet-400/30",
    tag: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    glow: "group-hover:shadow-violet-500/10",
    number: "text-violet-400",
  },
  purple: {
    border: "hover:border-purple-400/30",
    tag: "text-purple-400 bg-purple-400/10 border-purple-400/20",
    glow: "group-hover:shadow-purple-500/10",
    number: "text-purple-400",
  },
  pink: {
    border: "hover:border-pink-400/30",
    tag: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    glow: "group-hover:shadow-pink-500/10",
    number: "text-pink-400",
  },
  emerald: {
    border: "hover:border-emerald-400/30",
    tag: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    glow: "group-hover:shadow-emerald-500/10",
    number: "text-emerald-400",
  },
  amber: {
    border: "hover:border-amber-400/30",
    tag: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    glow: "group-hover:shadow-amber-500/10",
    number: "text-amber-400",
  },
  rose: {
    border: "hover:border-rose-400/30",
    tag: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    glow: "group-hover:shadow-rose-500/10",
    number: "text-rose-400",
  },
};

export default function TechPillarsSection() {
  return (
    <section id="pillars" className="py-24 relative">
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-cyan-400/20 bg-cyan-400/5 rounded-full px-4 py-2 mb-6">
            <span className="text-cyan-400 text-sm font-medium tracking-wide">
              8 Technology Pillars
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Trụ cột Công nghệ
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            8 nền tảng công nghệ đột phá tạo nên sức mạnh của AETHON — từ tự
            đột biến mã nguồn đến triển khai tự động.
          </p>
        </div>

        {/* Pillars grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((pillar) => {
            const colors = colorMap[pillar.color];
            return (
              <div
                key={pillar.number}
                className={`group card-glass rounded-2xl p-6 transition-all duration-300 ${colors.border} hover:shadow-xl ${colors.glow} cursor-default`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{pillar.icon}</span>
                  <span
                    className={`text-xs font-bold ${colors.number} opacity-40`}
                  >
                    {pillar.number}
                  </span>
                </div>

                {/* Tag */}
                <div className="mb-3">
                  <span
                    className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.tag}`}
                  >
                    {pillar.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-base mb-2 leading-tight">
                  {pillar.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
