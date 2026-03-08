/**
 * Founder Section - AETHON AI OS
 * Displays the founder Nguyễn Văn Hoài Thương
 */

import { User, Crown } from "lucide-react";

export default function FounderSection() {
  return (
    <section className="py-24 px-4 bg-[#030712] relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
              Nhà Sáng Lập
            </span>
          </h2>
          <p className="text-gray-400 text-lg">
            The Visionary Behind AETHON
          </p>
        </div>

        <div className="flex justify-center">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
            
            <div className="relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 max-w-md">
              {/* Avatar placeholder - gradient background */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-2xl">
                  <User className="w-16 h-16 text-white" />
                </div>
              </div>

              {/* Name */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2">
                  NGUYỄN VĂN HOÀI THƯƠNG
                </h3>
                <p className="text-cyan-400 font-medium flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  Founder & Lead Architect of AETHON Core
                </p>
              </div>

              {/* Description */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <p className="text-gray-400 text-center text-sm leading-relaxed">
                  Dẫn dắt tinh thần sáng tạo và quyết đoán trong hành trình xây dựng 
                  Hệ điều hành Trí tuệ (AIOS) đầu tiên Việt Nam. Với tầm nhìn vượt 
                  khỏi giới hạn của một chatbot thông thường, AETHON được thiết kế 
                  để thống trị quy trình phát triển phần mềm hiện đại.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
