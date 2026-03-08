"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FolderOpen, 
  Plus, 
  Search, 
  MoreVertical,
  GitBranch,
  Globe,
  Clock,
  Trash2,
  Edit
} from "lucide-react";

const MOCK_PROJECTS = [
  {
    id: "1",
    name: "AETHON Platform",
    description: "Main AI Agent Platform",
    status: "active",
    visibility: "private",
    techStack: ["Next.js", "TypeScript", "Supabase"],
    repoUrl: "https://github.com/nvht2002/Aethon-agent",
    liveUrl: "https://aethon.ai",
    lastUpdated: "2 hours ago",
  },
  {
    id: "2",
    name: "AI Chat Widget",
    description: "Embeddable chat component",
    status: "active",
    visibility: "team",
    techStack: ["React", "TypeScript"],
    repoUrl: "https://github.com/nvht2002/chat-widget",
    liveUrl: "",
    lastUpdated: "1 day ago",
  },
  {
    id: "3",
    name: "Dashboard UI",
    description: "Admin dashboard redesign",
    status: "archived",
    visibility: "private",
    techStack: ["Vue.js", "Tailwind"],
    repoUrl: "https://github.com/nvht2002/dashboard",
    liveUrl: "",
    lastUpdated: "1 week ago",
  },
];

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projects] = useState(MOCK_PROJECTS);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Projects</h1>
            <p className="text-sm text-slate-500">Manage your AI projects</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white hover:from-cyan-400 hover:to-violet-500 transition-all">
            <Plus size={16} />
            New Project
          </button>
        </div>

        {/* Search */}
        <div className="mt-4 relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group bg-white/5 border border-white/10 rounded-xl p-4 hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-600/20 border border-cyan-500/20 flex items-center justify-center">
                    <FolderOpen size={18} className="text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{project.name}</h3>
                    <p className="text-xs text-slate-500">{project.lastUpdated}</p>
                  </div>
                </div>
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                  <MoreVertical size={14} />
                </button>
              </div>

              <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.description}</p>

              {/* Tech Stack */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.techStack.map((tech) => (
                  <span 
                    key={tech}
                    className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Status & Links */}
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${project.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                  <span className="text-xs text-slate-500 capitalize">{project.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  {project.repoUrl && (
                    <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                      <GitBranch size={14} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
                      <Globe size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <FolderOpen size={48} className="text-slate-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No projects found</h3>
              <p className="text-sm text-slate-500 mb-4">Create a new project to get started</p>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-violet-600 rounded-lg text-sm font-medium text-white hover:from-cyan-400 hover:to-violet-500 transition-all">
                <Plus size={16} />
                New Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
