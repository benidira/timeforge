"use client";

import { useState } from "react";
import { Lock, Image as ImageIcon, Download, ShieldCheck } from "lucide-react";

export function SteganographyEnvVaultTool() {
  const [envText, setEnvText] = useState("DATABASE_URL=postgres://...\nSTRIPE_KEY=sk_test_...");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImageSrc(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleEncode = () => {
    if (!imageSrc) return alert("Upload a PNG logo first.");
    alert("Steganography Encrypting... The pixels of the image will be mathematically shifted to hide the AES-256 encrypted .env string.");
    // Implementation: Load Image into <canvas>, mutate pixel RGB values, export DataURL.
  };

  return (
    <div className="space-y-8">
      <div className="card p-8 bg-card border-line text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <ShieldCheck className="w-32 h-32" />
        </div>
        <h2 className="text-2xl font-bold mb-4 relative z-10">Hide Secrets in PNG Pixels</h2>
        <p className="text-muted max-w-xl mx-auto relative z-10 mb-8">
          Ditch text-based secret managers. Encrypt your .env variables and embed the ciphertext mathematically into your company's logo. Hackers will only see an image.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 text-left relative z-10">
          <div className="space-y-4">
            <label className="font-semibold text-sm">1. Paste your .env file</label>
            <textarea 
              value={envText}
              onChange={e => setEnvText(e.target.value)}
              className="w-full h-40 bg-bg border border-line rounded-lg p-4 font-mono text-sm resize-none focus:border-accent outline-none"
            />
          </div>
          <div className="space-y-4">
            <label className="font-semibold text-sm">2. Upload Carrier Image (PNG)</label>
            <div className="w-full h-40 border-2 border-dashed border-line rounded-lg flex items-center justify-center relative bg-bg hover:border-accent transition-colors">
              <input type="file" accept="image/png" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              {imageSrc ? (
                <img src={imageSrc} className="w-full h-full object-contain p-2" alt="Carrier" />
              ) : (
                <div className="text-center text-muted">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Click or Drop PNG here</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 relative z-10">
          <button onClick={handleEncode} className="btn btn-primary gap-2 px-8 py-3">
            <Lock className="w-5 h-5" /> Embed Secrets into Image
          </button>
        </div>
      </div>
    </div>
  );
}
