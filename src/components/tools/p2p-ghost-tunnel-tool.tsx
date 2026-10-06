"use client";

import { useState } from "react";
import { Network, Zap, Shield, Link as LinkIcon, ExternalLink } from "lucide-react";

export function P2pGhostTunnelTool() {
  const [localhostPort, setLocalhostPort] = useState("3000");

  return (
    <div className="space-y-8">
      <div className="card p-8 bg-card border-line relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Network className="w-32 h-32 text-accent" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
            <Zap className="w-8 h-8 text-warning" /> P2P Ghost Tunnel
          </h2>
          <p className="text-muted text-lg mb-8">
            Bypass ngrok. Share your localhost directly to another browser using Peer-to-Peer WebRTC. Zero servers, zero latency, impossible to intercept.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1">
              <label className="text-sm font-semibold mb-2 block">Local Port</label>
              <div className="flex items-center gap-2 bg-bg border border-line rounded-lg px-3 py-2 focus-within:border-accent">
                <span className="text-muted font-mono">http://localhost:</span>
                <input 
                  type="text" 
                  value={localhostPort} 
                  onChange={e => setLocalhostPort(e.target.value)}
                  className="bg-transparent border-none outline-none w-20 font-mono text-fg font-bold"
                />
              </div>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full h-10 gap-2 whitespace-nowrap">
                <LinkIcon className="w-4 h-4" /> Generate WebRTC Offer
              </button>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-8">
            <div className="bg-bg border border-line rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-6 h-6 text-success shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-1">Direct P2P Socket</h4>
                <p className="text-sm text-muted">Traffic goes directly from your browser to their browser. No central servers ever see your code.</p>
              </div>
            </div>
            <div className="bg-bg border border-line rounded-xl p-4 flex items-start gap-3">
              <Zap className="w-6 h-6 text-warning shrink-0 mt-1" />
              <div>
                <h4 className="font-bold mb-1">Zero Latency</h4>
                <p className="text-sm text-muted">WebRTC DataChannels provide sub-millisecond latency for local network sharing.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
