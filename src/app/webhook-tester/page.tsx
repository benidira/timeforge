"use client";

import { useState } from "react";
import { Webhook, Activity, Copy, Check, RefreshCw } from "lucide-react";
import { JsonLd } from "@/components/json-ld";
import { websiteJsonLd } from "@/lib/seo";

export default function WebhookTesterPage() {
  const [copied, setCopied] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const url = "https://castov.com/api/webhook/mock-tester-endpoint";

  const copyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const simulateWebhook = () => {
    const payload = {
      id: "evt_" + Math.random().toString(36).substring(2, 11),
      type: "payment_intent.succeeded",
      created: Math.floor(Date.now() / 1000),
      data: {
        object: {
          id: "pi_" + Math.random().toString(36).substring(2, 11),
          amount: 2000,
          currency: "usd",
          status: "succeeded"
        }
      }
    };

    setRequests(prev => [{
      timestamp: new Date().toISOString(),
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
        "stripe-signature": "t=" + Math.floor(Date.now() / 1000) + ",v1=mock_signature"
      },
      body: payload
    }, ...prev]);
  };

  const clearAll = () => setRequests([]);

  return (
    <div className="layout-content max-w-5xl py-12">
      <JsonLd data={[websiteJsonLd()]} />
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-fg mb-4">
          Local Webhook Tester <span className="text-accent text-lg align-top ml-2 bg-accent/10 px-2 py-0.5 rounded-full">Interactive Demo</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-8">
          Generate a temporary endpoint to catch and inspect incoming webhooks in real-time. 
          Perfect for testing Stripe, GitHub, or any external API.
        </p>
        
        <div className="max-w-2xl mx-auto flex items-center bg-card border border-line rounded-xl p-2 pl-4 shadow-sm">
          <div className="flex-1 font-mono text-sm text-fg truncate text-left select-all">
            {url}
          </div>
          <button 
            onClick={copyUrl}
            className="btn btn-primary ml-4 gap-2 h-10 px-6"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-fg">Requests ({requests.length})</h3>
            <button onClick={simulateWebhook} className="btn btn-secondary btn-sm gap-2">
              <RefreshCw className="w-3 h-3" /> Mock Receive
            </button>
          </div>
          
          <div className="border border-line rounded-xl bg-card overflow-hidden h-[600px] flex flex-col">
            {requests.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-muted p-6 text-center">
                <Activity className="w-10 h-10 mb-4 opacity-30" />
                <p className="text-sm">Waiting for incoming requests...</p>
                <p className="text-xs opacity-50 mt-2">Click "Mock Receive" to simulate a Stripe webhook.</p>
              </div>
            ) : (
              <div className="overflow-y-auto">
                {requests.map((req, i) => (
                  <div key={i} className="p-4 border-b border-line hover:bg-hover cursor-pointer transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-success">{req.method}</span>
                      <span className="text-xs text-muted">
                        {new Date(req.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-fg font-medium truncate">
                      {req.body?.type || "Unknown Event"}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {requests.length > 0 && (
              <div className="p-2 border-t border-line bg-bg">
                <button onClick={clearAll} className="w-full btn btn-secondary btn-sm text-danger hover:bg-danger/10 hover:border-danger/20">
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-fg">Request Details</h3>
          <div className="border border-line rounded-xl bg-bg h-[600px] p-6 overflow-auto shadow-inner">
            {requests.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-muted text-center">
                <Webhook className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a request from the sidebar to inspect its payload and headers.</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Headers</h4>
                  <div className="bg-card rounded-lg border border-line p-4 font-mono text-xs overflow-x-auto">
                    {Object.entries(requests[0].headers).map(([k, v]) => (
                      <div key={k} className="mb-1">
                        <span className="text-accent font-semibold">{k}:</span> <span className="text-fg">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-muted uppercase tracking-wider mb-3">Body (JSON)</h4>
                  <div className="bg-card rounded-lg border border-line p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-fg">
                      {JSON.stringify(requests[0].body, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
