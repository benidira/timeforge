import Link from "next/link";
import { Check, Zap, Shield, Crown } from "lucide-react";

export const metadata = {
  title: "Pricing | Castov - Developer Toolkit",
  description: "Upgrade to Castov Pro to unlock Team Vaults, Unlimited AI Prompts, and P2P Multiplayer Canvas.",
};

export default function PricingPage() {
  return (
    <div className="w-full pb-20">
      <section className="w-full border-b border-line bg-card pt-20 pb-16">
        <div className="layout-content flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent font-medium text-sm tracking-wide uppercase">
            <Zap className="w-4 h-4" />
            Supercharge Your Workflow
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-fg mb-6">
            Simple Pricing for <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Elite Developers</span>
          </h1>
          <p className="text-lg text-muted max-w-xl">
            Start for free, upgrade when you need massive AI power and secure team collaboration tools.
          </p>
        </div>
      </section>

      <section className="layout-content py-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-card border border-line rounded-3xl p-8 md:p-10 flex flex-col hover:border-muted transition-colors">
            <h3 className="text-2xl font-bold text-fg mb-2">Hacker</h3>
            <p className="text-muted mb-6">Perfect for individual developers.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-fg">$0</span>
              <span className="text-muted">/forever</span>
            </div>
            
            <Link 
              href="/tools"
              className="w-full py-4 px-6 bg-field hover:bg-hover border border-line text-fg font-bold rounded-xl text-center transition-colors mb-8"
            >
              Start Building
            </Link>

            <ul className="space-y-4 flex-grow text-muted font-medium">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-success" /> All 35+ Basic Dev Tools</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-success" /> Local Zero-Server Execution</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-success" /> Chrome Extension Access</li>
              <li className="flex items-center gap-3 text-muted/50"><Shield className="w-5 h-5" /> Team Env Vaults (Locked)</li>
              <li className="flex items-center gap-3 text-muted/50"><Crown className="w-5 h-5" /> 100k AI Prompts Library (Locked)</li>
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="bg-[#050505] border-2 border-primary rounded-3xl p-8 md:p-10 flex flex-col shadow-2xl relative shadow-primary/20 hover:shadow-primary/40 transition-shadow transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-bold px-4 py-1 rounded-full text-sm">
              MOST POPULAR
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Castov Pro <Crown className="w-6 h-6 text-yellow-500" />
            </h3>
            <p className="text-gray-400 mb-6">For professional devs & teams.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-white">$12</span>
              <span className="text-gray-500">/month</span>
            </div>
            
            <Link 
              href="/signup?plan=pro"
              className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl text-center transition-colors mb-8 shadow-lg shadow-primary/25"
            >
              Upgrade to Pro
            </Link>

            <ul className="space-y-4 flex-grow text-gray-300 font-medium">
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Everything in Hacker</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> <b>100,000+</b> AI Prompts Library</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Secure Team Env Vaults</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> P2P Multiplayer Canvas (Unlimited)</li>
              <li className="flex items-center gap-3"><Check className="w-5 h-5 text-primary" /> Priority API Mocker</li>
            </ul>
          </div>

        </div>
      </section>
    </div>
  );
}
