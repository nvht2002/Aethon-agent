"use client";

import { Play, BookOpen, Brain } from "lucide-react";

const COURSES = [
  { id: "1", title: "Getting Started with AETHON", progress: 100, duration: "15 min" },
  { id: "2", title: "Building AI Agents", progress: 65, duration: "45 min" },
  { id: "3", title: "Advanced Prompt Engineering", progress: 30, duration: "60 min" },
  { id: "4", title: "Custom Tool Creation", progress: 0, duration: "40 min" },
];

export default function TrainingPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-white/5">
        <div>
          <h1 className="text-xl font-bold text-white">Training</h1>
          <p className="text-sm text-slate-500">Learn to build with AETHON</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSES.map((course) => (
            <div key={course.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 flex items-center justify-center">
                  <Brain size={18} className="text-cyan-400" />
                </div>
                <span className="text-xs text-slate-500">{course.duration}</span>
              </div>
              <h3 className="font-semibold text-white mb-2">{course.title}</h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
                <span className="text-xs text-slate-400">{course.progress}%</span>
              </div>
              {course.progress === 0 && (
                <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 text-sm text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                  <Play size={14} /> Start Course
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
