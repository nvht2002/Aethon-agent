"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Settings,
  Puzzle,
  Zap,
  ListTodo,
  Bot,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/integrations", label: "Integrations", icon: Puzzle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

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
      <aside className="w-16 md:w-56 flex flex-col border-r border-white/5 bg-black/20 backdrop-blur-xl shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shrink-0">
              <Zap size={16} className="text-white fill-current" />
            </div>
            <span className="hidden md:block font-black text-lg tracking-tight">AETHON</span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
            >
              <Icon size={18} className="shrink-0 group-hover:text-cyan-400 transition-colors" />
              <span className="hidden md:block text-sm font-medium">{label}</span>
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/5 flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "w-8 h-8",
              },
            }}
          />
          <span className="hidden md:block text-sm text-slate-400 truncate">Account</span>
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
