"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { UserCircle, Link as LinkIcon, Bookmark, Settings, LogOut, ArrowRight, Activity, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 flex items-center justify-center">
        <Activity className="w-8 h-8 text-[#00f0FF] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center justify-center text-center">
        <ShieldCheck className="w-16 h-16 text-[#00f0FF] mb-6 opacity-50" />
        <h1 className="text-3xl font-black text-fg mb-4">Authentication Required</h1>
        <p className="text-muted mb-8 max-w-md">Please sign in to access your developer profile and saved configurations.</p>
        <Link href="/login" className="bg-[#00f0FF] text-black font-bold px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all">
          Sign In to Castov
        </Link>
      </div>
    );
  }

  // Mock data for saved items
  const savedItems = [
    { id: 1, title: "Production DB Env Vault", type: "Steganography", date: "Today" },
    { id: 2, title: "User Auth Regex Pattern", type: "Genetic Regex", date: "Yesterday" },
    { id: 3, title: "Global Timezone Layout", type: "World Clock", date: "Oct 2, 2026" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-12 px-4 max-w-5xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-[#020204] border border-[#00f0FF]/20 rounded-3xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,240,255,0.05)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <UserCircle className="w-64 h-64 text-[#00f0FF]" />
        </div>
        
        <div className="relative z-10 w-32 h-32 rounded-full border-2 border-[#00f0FF]/50 bg-black/50 flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(0,240,255,0.2)] flex-shrink-0">
          {user.user_metadata?.avatar_url ? (
            <Image src={user.user_metadata.avatar_url} alt="Profile" fill className="object-cover" />
          ) : (
            <span className="text-5xl font-black text-[#00f0FF]">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </span>
          )}
        </div>
        
        <div className="relative z-10 text-center md:text-left flex-1">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            {user.user_metadata?.full_name || user.email?.split('@')[0] || "Developer"}
          </h1>
          <p className="text-[#00f0FF] font-mono text-sm mb-4">{user.email}</p>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#00f0FF]/50 rounded-lg text-sm font-semibold transition-colors">
              <LinkIcon className="w-4 h-4" /> Connect GitHub
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#00f0FF]/50 rounded-lg text-sm font-semibold transition-colors">
              <Settings className="w-4 h-4" /> Preferences
            </button>
          </div>
        </div>

        <div className="relative z-10">
          <button onClick={handleSignOut} className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Saved Items */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-fg flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-[#10B981]" /> Saved Artifacts
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => (
            <div key={item.id} className="group bg-[#050505] border border-white/10 hover:border-[#10B981]/50 rounded-2xl p-6 transition-all shadow-sm hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] relative">
              <div className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">{item.date}</div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-[#10B981] transition-colors">{item.title}</h3>
              <div className="inline-block px-3 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-bold rounded-md mb-6">
                {item.type}
              </div>
              <button className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-black transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <Link href="/tools" className="group bg-transparent border-2 border-dashed border-white/10 hover:border-[#00f0FF]/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all h-full min-h-[200px]">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-[#00f0FF]/20 group-hover:text-[#00f0FF] transition-colors">
              <span className="text-2xl">+</span>
            </div>
            <h3 className="text-white font-bold mb-1">Create New</h3>
            <p className="text-sm text-muted">Explore Castov Tools</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
