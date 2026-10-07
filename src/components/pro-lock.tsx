import Link from "next/link";
import { Crown, Lock } from "lucide-react";

export function ProLock({ children, isPro }: { children: React.ReactNode; isPro?: boolean }) {
  if (!isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-background/60 rounded-xl border border-line">
        <div className="bg-card p-8 rounded-2xl shadow-2xl border border-primary/30 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/20">
            <Lock className="w-8 h-8 text-yellow-500" />
          </div>
          <h3 className="text-2xl font-bold text-fg mb-2 flex items-center justify-center gap-2">
            Pro Feature <Crown className="w-5 h-5 text-yellow-500" />
          </h3>
          <p className="text-muted mb-6">
            This advanced tool is exclusively available for Castov Pro members. Upgrade now to unlock this and many other premium features.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/20"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
      <div className="opacity-20 pointer-events-none select-none blur-sm">
        {children}
      </div>
    </div>
  );
}
