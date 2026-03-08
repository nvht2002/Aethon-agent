import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-2xl font-black text-white tracking-tight">AETHON</span>
          </div>
          <p className="text-slate-400 text-sm">Autonomous AI Operating System</p>
        </div>

        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton:
                "bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all",
              formFieldLabel: "text-slate-300",
              formFieldInput:
                "bg-slate-900/50 border-slate-700 text-white focus:border-cyan-500 focus:ring-cyan-500/20",
              formButtonPrimary:
                "bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold",
              footerActionLink: "text-cyan-400 hover:text-cyan-300",
              identityPreviewText: "text-slate-300",
              identityPreviewEditButton: "text-cyan-400",
            },
          }}
        />
      </div>
    </div>
  );
}
