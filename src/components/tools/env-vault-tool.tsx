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
        alert("Saved locally! (DB error: " + error.message + ")");
        setEncryptedLink(`http://localhost:3000/env-vault?id=local_mock&payload=${encodeURIComponent(payloadBase64)}`);
      } else {
        setEncryptedLink(`${window.location.origin}/env-vault?id=${data.id}`);
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
      // In a real scenario, fetch payload using vaultId. 
      // For demo, we parse it directly if passed via URL or mock
      let payloadBase64 = vaultId; // Allow pasting raw payload for now if no DB
      
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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex bg-muted/20 p-1 rounded-lg w-fit mx-auto border border-line">
        <button className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${mode === "encrypt" ? "bg-card shadow text-primary" : "text-muted hover:text-fg"}`} onClick={() => setMode("encrypt")}>
          <LockIcon size={14} className="inline mr-2" /> Create Vault
        </button>
        <button className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${mode === "decrypt" ? "bg-card shadow text-emerald-500" : "text-muted hover:text-fg"}`} onClick={() => setMode("decrypt")}>
          <UnlockIcon size={14} className="inline mr-2" /> Open Vault
        </button>
      </div>

      {mode === "encrypt" && (
        <div className="bg-card border border-line rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Zero-Knowledge .env Sharer</h3>
          <p className="text-sm text-muted mb-6">Your .env file is encrypted entirely in the browser using AES-GCM. The server never sees your raw secrets.</p>
          
          <textarea 
            value={rawEnv} onChange={e => setRawEnv(e.target.value)}
            className="w-full bg-field border border-line rounded-lg p-4 font-mono text-sm h-48 mb-4 focus:ring-1 focus:ring-primary focus:outline-none"
            placeholder="PASTE .ENV CONTENTS HERE..."
          />
          
          <div className="flex gap-4">
            <input 
              type="password" placeholder="Encryption Password" value={encPassword} onChange={e => setEncPassword(e.target.value)}
              className="flex-1 bg-field border border-line rounded-lg px-4 py-2"
            />
            <button onClick={handleEncrypt} disabled={!encPassword || isEncrypting} className="btn btn-primary">
              {isEncrypting ? "Encrypting..." : "Encrypt & Generate Link"}
            </button>
          </div>

          {encryptedLink && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-4">
              <LinkIcon className="text-primary shrink-0" />
              <input readOnly value={encryptedLink} className="w-full bg-transparent border-none text-sm font-mono focus:outline-none" />
              <button className="btn btn-secondary btn-sm shrink-0" onClick={() => navigator.clipboard.writeText(encryptedLink)}>
                <CopyIcon size={14} /> Copy
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "decrypt" && (
        <div className="bg-card border border-line rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-2">Unlock .env Vault</h3>
          <p className="text-sm text-muted mb-6">Enter the encrypted payload and the password to decrypt your secrets locally.</p>
          
          <input 
            type="text" placeholder="Paste Encrypted Payload or Vault ID..." value={vaultId} onChange={e => setVaultId(e.target.value)}
            className="w-full bg-field border border-line rounded-lg px-4 py-2 mb-4 font-mono text-xs"
          />
          
          <div className="flex gap-4">
            <input 
              type="password" placeholder="Decryption Password" value={decPassword} onChange={e => setDecPassword(e.target.value)}
              className="flex-1 bg-field border border-line rounded-lg px-4 py-2"
            />
            <button onClick={handleDecrypt} disabled={!decPassword || !vaultId || isDecrypting} className="btn btn-secondary !bg-emerald-500/10 !text-emerald-500 hover:!bg-emerald-500/20">
              {isDecrypting ? "Decrypting..." : "Decrypt"}
            </button>
          </div>

          {decryptError && <div className="mt-4 text-red-500 text-sm font-medium">{decryptError}</div>}
          
          {decryptedEnv && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-emerald-500">Decrypted Successfully</span>
                <button className="text-xs text-muted hover:text-fg flex items-center gap-1" onClick={() => navigator.clipboard.writeText(decryptedEnv)}>
                  <CopyIcon size={12} /> Copy
                </button>
              </div>
              <textarea 
                readOnly value={decryptedEnv}
                className="w-full bg-field border border-emerald-500/30 rounded-lg p-4 font-mono text-sm h-48 focus:outline-none"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
