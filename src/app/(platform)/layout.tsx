"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Settings,
  Puzzle,
  Zap,
  ListTodo,
  Bot,
  FolderOpen,
  Code,
  Wand2,
  Brain,
  Database,
  Play,
  Package,
  HardDrive,
  BarChart3,
  Users,
  ChevronDown,
  Search,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const MAIN_NAV: NavItem[] = [
  { label: "AI Chat", href: "/chat", icon: MessageSquare },
  { label: "Tasks", href: "/tasks", icon: ListTodo },
  { label: "Agents", href: "/agents", icon: Bot },
];

const BUILD_NAV: NavItem[] = [
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Code IDE", href: "/ide", icon: Code },
  { label: "Workflows", href: "/workflows", icon: Wand2 },
];

const AI_NAV: NavItem[] = [
  { label: "Models", href: "/models", icon: Brain },
  { label: "Knowledge", href: "/knowledge", icon: Database },
  { label: "Training", href: "/training", icon: Play },
];

const SYSTEM_NAV: NavItem[] = [
  { label: "Webhooks", href: "/webhooks", icon: Zap },
  { label: "Integrations", href: "/integrations", icon: Puzzle },
  { label: "Plugins", href: "/plugins", icon: Package },
  { label: "Deploy", href: "/deploy", icon: HardDrive },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Team", href: "/team", icon: Users },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface NavGroupProps {
  title: string;
  items: NavItem[];
  groupKey: string;
  expandedGroups: string[];
  toggleGroup: (key: string) => void;
  isActive: (href: string) => boolean;
}

function NavGroup({ title, items, groupKey, expandedGroups, toggleGroup, isActive }: NavGroupProps) {
  const isExpanded = expandedGroups.includes(groupKey);

  return (
    <div className="mb-2">
      <button
        onClick={() => toggleGroup(groupKey)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-300 transition-colors"
      >
        <ChevronDown
          size={12}
          className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
        />
        {title}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <nav className="space-y-0.5 mt-1">
              {items.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                    ${isActive(href)
                      ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={`
                      shrink-0 transition-colors
                      ${isActive(href) ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'}
                    `}
                  />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["main", "build", "ai", "system"]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#030712] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl shrink-0 transition-all duration-300
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0">
                <Zap size={16} className="text-white fill-current" />
              </div>
              {!sidebarCollapsed && (
                <span className="font-black text-lg tracking-tight">AETHON</span>
              )}
            </Link>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              {sidebarCollapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          <NavGroup title="AI Tools" items={MAIN_NAV} groupKey="main" expandedGroups={expandedGroups} toggleGroup={toggleGroup} isActive={isActive} />
          <NavGroup title="Build" items={BUILD_NAV} groupKey="build" expandedGroups={expandedGroups} toggleGroup={toggleGroup} isActive={isActive} />
          <NavGroup title="AI Engine" items={AI_NAV} groupKey="ai" expandedGroups={expandedGroups} toggleGroup={toggleGroup} isActive={isActive} />
          <NavGroup title="System" items={SYSTEM_NAV} groupKey="system" expandedGroups={expandedGroups} toggleGroup={toggleGroup} isActive={isActive} />
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Account</p>
                <p className="text-xs text-slate-500 truncate">Pro Plan</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <motion.div
          className="h-full"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
