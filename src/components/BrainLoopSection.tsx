const steps = [
  {
    number: "01",
    title: "Tiếp nhận yêu cầu",
    description: "Phân tích và hiểu sâu đầu vào từ người dùng, xác định mục tiêu cốt lõi.",
    icon: "📥",
    color: "from-cyan-500 to-cyan-400",
  },
  {
    number: "02",
    title: "Lập kế hoạch (Planner)",
    description: "Xây dựng lộ trình thực hiện chi tiết, phân tích rủi ro và tối ưu hóa chiến lược.",
    icon: "🧠",
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "03",
    title: "Phân rã tác vụ",
    description: "Chia nhỏ mục tiêu thành các nhiệm vụ cụ thể, phân công cho từng Agent chuyên biệt.",
    icon: "⚡",
    color: "from-violet-500 to-blue-500",
  },
  {
    number: "04",
    title: "Thực thi công cụ",
    description: "Sử dụng các công cụ thực tế — API, Terminal, Browser — để tác động vào hệ thống.",
    icon: "🔧",
    color: "from-purple-500 to-violet-500",
  },
  {
    number: "05",
    title: "Quan sát & Cập nhật",
    description: "Học hỏi từ kết quả thực hiện, lưu trữ ngữ cảnh vào bộ nhớ dài hạn Vector DB.",
    icon: "🔄",
    color: "from-pink-500 to-purple-500",
  },
];

export default function BrainLoopSection() {
  return (
    <section id="brain-loop" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-violet-400/20 bg-violet-400/5 rounded-full px-4 py-2 mb-6">
            <span className="text-violet-400 text-sm font-medium tracking-wide">
              Core Architecture
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            AI Brain Loop
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Vòng lặp trí tuệ nhân tạo khép kín — từ tiếp nhận yêu cầu đến tự
            học hỏi và cải thiện liên tục.
          </p>
        </div>

        {/* Loop visualization */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, index) => (
              <div key={step.number} className="relative group">
                {/* Arrow connector (desktop) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-cyan-500/40 text-lg">
                    →
                  </div>
                )}

                <div className="card-glass rounded-2xl p-6 h-full transition-all duration-300 group-hover:border-cyan-400/20 group-hover:bg-white/5">
                  {/* Step number */}
                  <div
                    className={`text-xs font-bold mb-3 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}
                  >
                    STEP {step.number}
                  </div>

                  {/* Icon */}
                  <div className="text-3xl mb-4">{step.icon}</div>

                  {/* Title */}
                  <h3 className="text-white font-bold text-sm mb-2 leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loop indicator */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-3 text-sm text-gray-500 border border-white/5 rounded-full px-6 py-3 bg-white/2">
            <span className="text-cyan-400">↺</span>
            <span>Vòng lặp tự động — không cần can thiệp thủ công</span>
          </div>
        </div>
      </div>
    </section>
  );
}
