"use client";

import { useState } from "react";
import { LockIcon, UnlockIcon, CopyIcon, LinkIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// WebCrypto AES-GCM Helpers
const generateKey = async (password: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), { name: "PBKDF2" }, false, ["deriveBits", "deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as any, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buffer)));
const base64ToArrayBuffer = (base64: string) => Uint8Array.from(atob(base64), c => c.charCodeAt(0));

export function EnvVaultTool() {
  const [tab, setTab] = useState<"personal" | "team">("personal");
  const [mode, setMode] = useState<"encrypt" | "decrypt">("encrypt");
  
  // Encrypt State
  const [rawEnv, setRawEnv] = useState("DB_PASS=supersecret\nAPI_KEY=xyz");
  const [encPassword, setEncPassword] = useState("");
  const [encryptedLink, setEncryptedLink] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);

  // Decrypt State
  const [vaultId, setVaultId] = useState("");
  const [decPassword, setDecPassword] = useState("");
  const [decryptedEnv, setDecryptedEnv] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptError, setDecryptError] = useState("");

  const handleEncrypt = async () => {
    if (!encPassword || !rawEnv) return;
    setIsEncrypting(true);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await generateKey(encPassword, salt);
      
      const enc = new TextEncoder();
      const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(rawEnv));
      
      const payloadBase64 = arrayBufferToBase64(salt.buffer as ArrayBuffer) + ":" + arrayBufferToBase64(iv.buffer as ArrayBuffer) + ":" + arrayBufferToBase64(ciphertext);
      
      // Save to Supabase (assuming table env_vaults exists)
      const supabase = createClient();
      const { data, error } = await supabase.from('env_vaults').insert([{ encrypted_payload: payloadBase64 }]).select().single();
      
      if (error) {
        // Fallback for local testing if DB is not created yet
        setEncryptedLink(`http://localhost:3000/tools/env-vault?id=local_mock&payload=${encodeURIComponent(payloadBase64)}`);
      } else {
        setEncryptedLink(`${window.location.origin}/tools/env-vault?id=${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
    setIsEncrypting(false);
  };

  const handleDecrypt = async () => {
    if (!decPassword) return;
    setIsDecrypting(true);
    setDecryptError("");
    setDecryptedEnv("");
    try {
      let payloadBase64 = vaultId; 
      
      const parts = payloadBase64.split(":");
      if (parts.length !== 3) throw new Error("Invalid payload format");
      
      const salt = base64ToArrayBuffer(parts[0]);
      const iv = base64ToArrayBuffer(parts[1]);
      const ciphertext = base64ToArrayBuffer(parts[2]);
      
      const key = await generateKey(decPassword, salt);
      const decryptedBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
      
      const dec = new TextDecoder();
      setDecryptedEnv(dec.decode(decryptedBuffer));
    } catch (e) {
      setDecryptError("Decryption failed. Wrong password or corrupted payload.");
    }
    setIsDecrypting(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
      {/* High-End Tab Switcher */}
      <div className="flex bg-[#050505] p-1.5 rounded-xl w-fit mx-auto border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.02)]">
        <button 
          className={`px-8 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${tab === "personal" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`} 
          onClick={() => setTab("personal")}
        >
          Personal Vault
        </button>
        <button 
          className={`px-8 py-2.5 rounded-lg text-sm font-bold tracking-wide transition-all ${tab === "team" ? "bg-white text-black shadow-lg" : "text-zinc-500 hover:text-white"}`} 
          onClick={() => setTab("team")}
        >
          Team Vaults <span className="ml-2 bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[10px] uppercase">Beta</span>
        </button>
      </div>

      {tab === "personal" && (
        <div className="flex flex-col gap-6">
          <div className="flex bg-[#0a0a0a] p-1 rounded-lg w-fit border border-white/5 mx-auto">
            <button className={`px-6 py-2 rounded-md text-xs font-semibold transition-colors uppercase tracking-wider ${mode === "encrypt" ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"}`} onClick={() => setMode("encrypt")}>
              <LockIcon size={14} className="inline mr-2" /> Encrypt
            </button>
            <button className={`px-6 py-2 rounded-md text-xs font-semibold transition-colors uppercase tracking-wider ${mode === "decrypt" ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-500 hover:text-white"}`} onClick={() => setMode("decrypt")}>
              <UnlockIcon size={14} className="inline mr-2" /> Decrypt
            </button>
          </div>

          {mode === "encrypt" && (
            <div className="bg-[#050505] border border-white/10 rounded-2xl p-8 shadow-[0_0_30px_rgba(255,255,255,0.02)] relative overflow-hidden group">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <h3 className="text-xl font-bold text-fg mb-2 tracking-tight">Zero-Knowledge .env Sharer</h3>
              <p className="text-sm text-zinc-400 mb-6">Your .env file is encrypted entirely in the browser using AES-GCM. The server never sees your raw secrets.</p>
              
              <textarea 
                value={rawEnv} onChange={e => setRawEnv(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl p-4 font-mono text-sm h-48 mb-6 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all text-zinc-300 placeholder:text-zinc-700"
                placeholder="PASTE .ENV CONTENTS HERE..."
              />
              
              <div className="flex gap-4">
                <input 
                  type="password" placeholder="Encryption Password" value={encPassword} onChange={e => setEncPassword(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
                <button onClick={handleEncrypt} disabled={!encPassword || isEncrypting} className="bg-white text-black hover:bg-zinc-200 font-bold px-6 rounded-xl transition-colors disabled:opacity-50">
                  {isEncrypting ? "Encrypting..." : "Encrypt & Share"}
                </button>
              </div>

              {encryptedLink && (
                <div className="mt-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center gap-4">
                  <LinkIcon className="text-indigo-400 shrink-0" />
                  <input readOnly value={encryptedLink} className="w-full bg-transparent border-none text-xs font-mono text-indigo-200 focus:outline-none" />
                  <button className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-2" onClick={() => navigator.clipboard.writeText(encryptedLink)}>
                    <CopyIcon size={14} /> Copy
                  </button>
                </div>
              )}
            </div>
          )}

          {mode === "decrypt" && (
            <div className="bg-[#050505] border border-emerald-500/20 rounded-2xl p-8 shadow-[0_0_30px_rgba(16,185,129,0.05)] relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
              <h3 className="text-xl font-bold text-fg mb-2 tracking-tight">Unlock .env Vault</h3>
              <p className="text-sm text-zinc-400 mb-6">Enter the encrypted payload and the password to decrypt your secrets locally.</p>
              
              <input 
                type="text" placeholder="Paste Encrypted Payload or Vault ID..." value={vaultId} onChange={e => setVaultId(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 mb-6 font-mono text-xs text-white focus:outline-none focus:border-emerald-500/50"
              />
              
              <div className="flex gap-4">
                <input 
                  type="password" placeholder="Decryption Password" value={decPassword} onChange={e => setDecPassword(e.target.value)}
                  className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 font-mono text-sm text-white focus:outline-none focus:border-emerald-500/50"
                />
                <button onClick={handleDecrypt} disabled={!decPassword || !vaultId || isDecrypting} className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold px-8 rounded-xl transition-colors disabled:opacity-50">
                  {isDecrypting ? "Decrypting..." : "Decrypt"}
                </button>
              </div>

              {decryptError && <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono">{decryptError}</div>}
              
              {decryptedEnv && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Decrypted Successfully
                    </span>
                    <button className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors" onClick={() => navigator.clipboard.writeText(decryptedEnv)}>
                      <CopyIcon size={12} /> Copy
                    </button>
                  </div>
                  <textarea 
                    readOnly value={decryptedEnv}
                    className="w-full bg-[#0a0a0a] border border-emerald-500/30 rounded-xl p-4 font-mono text-sm h-48 focus:outline-none text-emerald-50"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "team" && (
        <div className="bg-[#050505] border border-white/10 rounded-2xl p-12 text-center shadow-[0_0_30px_rgba(255,255,255,0.02)]">
          <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <LockIcon className="text-indigo-400" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-fg mb-3">Team Shared Vaults</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-8">Share encrypted .env files securely with your team using zero-knowledge RSA-OAEP + AES-GCM cryptography.</p>
          <a href="/env-vault/team" className="inline-flex bg-white text-black hover:bg-zinc-200 font-bold px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            Open Workspace
          </a>
        </div>
      )}
    </div>
  );
}
