const agents = [
  {
    name: "ResearchAgent",
    role: "Intelligence Gatherer",
    description:
      "Thu thập và phân tích thông tin từ web theo thời gian thực. Sử dụng Serper.dev API để tìm kiếm, tổng hợp và trình bày dữ liệu có cấu trúc.",
    capabilities: ["Web Search", "Data Analysis", "Report Generation", "Fact Checking"],
    icon: "🔬",
    status: "Active",
    color: "cyan",
  },
  {
    name: "CodeAgent",
    role: "Senior Engineer",
    description:
      "Viết, sửa đổi và tối ưu hóa mã nguồn với tư duy của một Senior Engineer. Hiểu ngữ cảnh dự án, đề xuất kiến trúc và tự review code.",
    capabilities: ["Code Generation", "Refactoring", "Bug Fixing", "Architecture Design"],
    icon: "💻",
    status: "Active",
    color: "violet",
  },
  {
    name: "AutomationAgent",
    role: "Process Automator",
    description:
      "Thực hiện các quy trình tự động hóa phức tạp thông qua Puppeteer. Điều khiển trình duyệt, tương tác UI, scrape dữ liệu và điền form tự động.",
    capabilities: ["Browser Control", "UI Interaction", "Data Scraping", "Form Automation"],
    icon: "🤖",
    status: "Active",
    color: "blue",
  },
  {
    name: "SystemAgent",
    role: "Orchestrator",
    description:
      "Quản lý các tác vụ cấp hệ thống và điều phối toàn bộ pipeline. Phân công công việc, theo dõi tiến độ và đảm bảo tính nhất quán của hệ thống.",
    capabilities: ["Task Orchestration", "Resource Management", "Pipeline Control", "Error Recovery"],
    icon: "⚙️",
    status: "Active",
    color: "emerald",
  },
];

const colorMap: Record<string, { border: string; badge: string; dot: string; tag: string }> = {
  cyan: {
    border: "border-cyan-400/20",
    badge: "text-cyan-400 bg-cyan-400/10",
    dot: "bg-cyan-400",
    tag: "text-cyan-300/70 bg-cyan-400/5 border-cyan-400/10",
  },
  violet: {
    border: "border-violet-400/20",
    badge: "text-violet-400 bg-violet-400/10",
    dot: "bg-violet-400",
    tag: "text-violet-300/70 bg-violet-400/5 border-violet-400/10",
  },
  blue: {
    border: "border-blue-400/20",
    badge: "text-blue-400 bg-blue-400/10",
    dot: "bg-blue-400",
    tag: "text-blue-300/70 bg-blue-400/5 border-blue-400/10",
  },
  emerald: {
    border: "border-emerald-400/20",
    badge: "text-emerald-400 bg-emerald-400/10",
    dot: "bg-emerald-400",
    tag: "text-emerald-300/70 bg-emerald-400/5 border-emerald-400/10",
  },
};

export default function AgentsSection() {
  return (
    <section id="agents" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-blue-400/20 bg-blue-400/5 rounded-full px-4 py-2 mb-6">
            <span className="text-blue-400 text-sm font-medium tracking-wide">
              Multi-Agent Architecture
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Hệ thống Agent chuyên biệt
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Bốn Agent chuyên trách cộng tác với nhau trong kiến trúc đa tác
            nhân — mỗi Agent là một chuyên gia trong lĩnh vực của mình.
          </p>
        </div>

        {/* Agents grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {agents.map((agent) => {
            const colors = colorMap[agent.color];
            return (
              <div
                key={agent.name}
                className={`card-glass rounded-2xl p-7 border ${colors.border} transition-all duration-300 hover:bg-white/5`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{agent.icon}</div>
                    <div>
                      <h3 className="text-white font-bold text-lg">
                        {agent.name}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}
                      >
                        {agent.role}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                    <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse`} />
                    {agent.status}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-400 text-sm leading-relaxed mb-5">
                  {agent.description}
                </p>

                {/* Capabilities */}
                <div className="flex flex-wrap gap-2">
                  {agent.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className={`text-xs px-2.5 py-1 rounded-lg border ${colors.tag}`}
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Collaboration note */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-3 text-sm text-gray-500 border border-white/5 rounded-xl px-6 py-4 bg-white/2">
            <span className="text-2xl">🤝</span>
            <span>
              Các Agent giao tiếp với nhau qua{" "}
              <span className="text-white font-medium">
                Gemini Orchestrator
              </span>{" "}
              — không cần can thiệp thủ công
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
