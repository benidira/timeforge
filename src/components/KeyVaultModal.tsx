"use client";

import { useKeyManager } from "@/context/KeyManagerContext";
import { KeyIcon, XIcon, CheckIcon, ShieldAlertIcon } from "lucide-react";
import { useState } from "react";

export function KeyVaultModal() {
  const { keys, saveKey, removeKey, isKeyModalOpen, setKeyModalOpen } = useKeyManager();
  
  const [tempKeys, setTempKeys] = useState(keys);

  if (!isKeyModalOpen) return null;

  const handleSave = (provider: keyof typeof keys) => {
    saveKey(provider, tempKeys[provider]);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setKeyModalOpen(false)} />
      
      <div className="relative w-full max-w-lg bg-card border border-line/50 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6">
        <button 
          onClick={() => setKeyModalOpen(false)}
          className="absolute top-4 right-4 text-muted hover:text-fg transition-colors"
        >
          <XIcon className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
            <KeyIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-fg">BYOK Vault</h2>
            <p className="text-sm text-muted">Manage your API keys for Live Playgrounds</p>
          </div>
        </div>

        <div className="mb-6 p-3 rounded-lg bg-warning/10 border border-warning/20 flex gap-3 text-warning/90 text-sm">
          <ShieldAlertIcon className="w-5 h-5 shrink-0" />
          <p>Your keys are stored locally in your browser and are never sent to Castov's servers. They are only sent directly to the respective AI providers via our secure edge functions.</p>
        </div>

        <div className="space-y-4">
          {/* OpenAI */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-fg flex items-center justify-between">
              OpenAI API Key
              {keys.openai && <span className="text-xs text-success flex items-center gap-1"><CheckIcon className="w-3 h-3"/> Saved</span>}
            </label>
            <div className="flex gap-2">
              <input 
                type="password"
                placeholder="sk-..."
                className="input flex-1 bg-field border-line focus:border-accent text-sm font-mono"
                value={tempKeys.openai}
                onChange={e => setTempKeys({...tempKeys, openai: e.target.value})}
              />
              <button onClick={() => handleSave("openai")} className="btn btn-primary px-4 py-2">Save</button>
              {keys.openai && (
                <button onClick={() => { removeKey("openai"); setTempKeys({...tempKeys, openai: ""}); }} className="btn btn-secondary px-3 text-danger hover:border-danger hover:bg-danger/10">
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Anthropic */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-fg flex items-center justify-between">
              Anthropic API Key
              {keys.anthropic && <span className="text-xs text-success flex items-center gap-1"><CheckIcon className="w-3 h-3"/> Saved</span>}
            </label>
            <div className="flex gap-2">
              <input 
                type="password"
                placeholder="sk-ant-..."
                className="input flex-1 bg-field border-line focus:border-accent text-sm font-mono"
                value={tempKeys.anthropic}
                onChange={e => setTempKeys({...tempKeys, anthropic: e.target.value})}
              />
              <button onClick={() => handleSave("anthropic")} className="btn btn-primary px-4 py-2">Save</button>
              {keys.anthropic && (
                <button onClick={() => { removeKey("anthropic"); setTempKeys({...tempKeys, anthropic: ""}); }} className="btn btn-secondary px-3 text-danger hover:border-danger hover:bg-danger/10">
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
