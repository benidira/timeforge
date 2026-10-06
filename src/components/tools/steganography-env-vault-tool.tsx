"use client";

import { useState, useRef } from "react";
import { Lock, Image as ImageIcon, Download, ShieldCheck, Unlock, KeyRound } from "lucide-react";

// --- WebCrypto API Utilities ---
const getPasswordKey = async (password: string, salt: Uint8Array) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as unknown as BufferSource, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

const encryptAES = async (text: string, password: string): Promise<Uint8Array> => {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getPasswordKey(password, salt);
  
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(text)
  );
  
  // Pack: [Salt(16)] + [IV(12)] + [Ciphertext]
  const payload = new Uint8Array(16 + 12 + encryptedBuf.byteLength);
  payload.set(salt, 0);
  payload.set(iv, 16);
  payload.set(new Uint8Array(encryptedBuf), 28);
  return payload;
};

const decryptAES = async (payload: Uint8Array, password: string): Promise<string> => {
  if (payload.length < 28) throw new Error("Invalid payload length");
  const salt = payload.slice(0, 16);
  const iv = payload.slice(16, 28);
  const ciphertext = payload.slice(28);
  
  const key = await getPasswordKey(password, salt);
  const decryptedBuf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  
  return new TextDecoder().decode(decryptedBuf);
};

// --- Conversion Utilities ---
const bufToBinStr = (buf: Uint8Array) => {
  let bin = "";
  for (let i = 0; i < buf.length; i++) {
    bin += buf[i].toString(2).padStart(8, "0");
  }
  return bin;
};

const binStrToBuf = (bin: string) => {
  const buf = new Uint8Array(Math.floor(bin.length / 8));
  for (let i = 0; i < buf.length; i++) {
    buf[i] = parseInt(bin.substring(i * 8, (i + 1) * 8), 2);
  }
  return buf;
};

export function SteganographyEnvVaultTool() {
  const [envText, setEnvText] = useState("DATABASE_URL=postgres://user:pass@localhost:5432/db\nAPI_KEY=sk_test_12345\nNEXT_PUBLIC_URL=https://castov.com");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [password, setPassword] = useState("");
  const [decodedText, setDecodedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageSrc(ev.target?.result as string);
        setDecodedText(""); // Reset
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = (callback: (ctx: CanvasRenderingContext2D, imgData: ImageData, img: HTMLImageElement) => void) => {
    if (!imageSrc || !canvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      callback(ctx, imgData, img);
    };
    img.src = imageSrc;
  };

  const handleEncode = async () => {
    if (!imageSrc) return alert("Upload a PNG logo first.");
    if (!password) return alert("Master password is required for AES-GCM encryption.");
    
    setIsProcessing(true);
    try {
      const payloadBuf = await encryptAES(envText, password);
      const binaryPayload = bufToBinStr(payloadBuf);
      
      // Store length of payload in first 32 bits
      const lengthBin = binaryPayload.length.toString(2).padStart(32, "0");
      const fullBinary = lengthBin + binaryPayload;

      processImage((ctx, imgData) => {
        const data = imgData.data;
        // Total available bits = width * height * 3 (RGB, ignoring Alpha)
        const availableBits = (data.length / 4) * 3;
        
        if (fullBinary.length > availableBits) {
          alert(`Image is too small! Need ${fullBinary.length} bits, but image only has ${availableBits} bits.`);
          setIsProcessing(false);
          return;
        }

        let binIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (binIndex < fullBinary.length) data[i] = (data[i] & ~1) | parseInt(fullBinary[binIndex++]); // R
          if (binIndex < fullBinary.length) data[i+1] = (data[i+1] & ~1) | parseInt(fullBinary[binIndex++]); // G
          if (binIndex < fullBinary.length) data[i+2] = (data[i+2] & ~1) | parseInt(fullBinary[binIndex++]); // B
          if (binIndex >= fullBinary.length) break;
        }
        
        ctx.putImageData(imgData, 0, 0);
        
        const a = document.createElement("a");
        a.href = canvasRef.current!.toDataURL("image/png");
        a.download = "castov_vault_logo.png";
        a.click();
        setIsProcessing(false);
      });
    } catch (e: any) {
      alert("Encryption failed: " + e.message);
      setIsProcessing(false);
    }
  };

  const handleDecode = () => {
    if (!imageSrc) return alert("Upload an encoded PNG logo first.");
    if (!password) return alert("Master password is required for decryption.");
    
    setIsProcessing(true);
    processImage(async (ctx, imgData) => {
      try {
        const data = imgData.data;
        
        // 1. Extract first 32 bits to get payload length
        let lengthBin = "";
        let i = 0;
        while (lengthBin.length < 32 && i < data.length) {
          if (lengthBin.length < 32) lengthBin += (data[i] & 1).toString();
          if (lengthBin.length < 32) lengthBin += (data[i+1] & 1).toString();
          if (lengthBin.length < 32) lengthBin += (data[i+2] & 1).toString();
          i += 4; // Skip alpha
        }
        
        const payloadLength = parseInt(lengthBin, 2);
        
        if (payloadLength <= 0 || payloadLength > (data.length / 4) * 3) {
          throw new Error("No hidden vault found in this image, or image is corrupted.");
        }

        // 2. Extract payload bits
        let payloadBin = "";
        // We continue from where we left off. 
        // Wait, the loops above might have over-consumed the last pixel if 32 is not divisible by 3.
        // Let's re-traverse safely from index 0 to grab EXACTLY 32 + payloadLength bits.
        
        let allBits = "";
        const totalBitsNeeded = 32 + payloadLength;
        for (let j = 0; j < data.length && allBits.length < totalBitsNeeded; j += 4) {
          if (allBits.length < totalBitsNeeded) allBits += (data[j] & 1).toString();
          if (allBits.length < totalBitsNeeded) allBits += (data[j+1] & 1).toString();
          if (allBits.length < totalBitsNeeded) allBits += (data[j+2] & 1).toString();
        }
        
        payloadBin = allBits.substring(32, 32 + payloadLength);
        
        if (payloadBin.length !== payloadLength) {
          throw new Error("Image corrupted. Missing bits.");
        }

        // 3. Convert bin to buf and decrypt
        const payloadBuf = binStrToBuf(payloadBin);
        const decrypted = await decryptAES(payloadBuf, password);
        setDecodedText(decrypted);
      } catch (e: any) {
        alert("Decryption failed. " + (e.message.includes("OperationError") ? "Incorrect Master Password." : e.message));
        setDecodedText("");
      } finally {
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex gap-4 border-b border-line pb-4">
        <button 
          onClick={() => setMode("encode")} 
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${mode === "encode" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-hover"}`}
        >
          Hide Secrets (Encode)
        </button>
        <button 
          onClick={() => setMode("decode")} 
          className={`px-4 py-2 font-bold rounded-lg transition-colors ${mode === "decode" ? "bg-primary text-primary-fg" : "text-muted hover:text-fg hover:bg-hover"}`}
        >
          Extract Secrets (Decode)
        </button>
      </div>

      <div className="card p-8 bg-card border-line relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldCheck className="w-64 h-64 text-accent" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <label className="font-semibold text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> 
              1. Carrier Image (PNG)
            </label>
            <div className="w-full h-48 border-2 border-dashed border-line rounded-lg flex flex-col items-center justify-center relative bg-bg hover:border-accent/50 transition-colors overflow-hidden group">
              <input type="file" accept="image/png" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {imageSrc ? (
                <div className="relative w-full h-full p-2 flex items-center justify-center">
                  <img src={imageSrc} className="max-w-full max-h-full object-contain drop-shadow-md" alt="Carrier" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-white font-bold text-sm">Replace Image</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted group-hover:text-primary transition-colors">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50 group-hover:opacity-100" />
                  <span className="text-sm font-medium">Click or Drop PNG here</span>
                </div>
              )}
            </div>
            {imageSrc && (
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-muted">WebCrypto AES-GCM 256-bit</span>
                <button onClick={() => { setImageSrc(null); setDecodedText(""); }} className="text-xs text-danger hover:underline font-semibold">Remove</button>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <label className="font-semibold text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-warning" /> 
              {mode === "encode" ? "2. Secret Payload (.env)" : "2. Extracted Payload"}
            </label>
            {mode === "encode" ? (
              <textarea 
                value={envText}
                onChange={e => setEnvText(e.target.value)}
                placeholder="DATABASE_URL=..."
                className="w-full h-48 bg-bg border border-line rounded-lg p-4 font-mono text-sm resize-none focus:border-accent outline-none shadow-inner"
              />
            ) : (
              <div className="w-full h-48 bg-black border border-line rounded-lg p-4 font-mono text-sm overflow-auto text-green-400 select-all shadow-inner relative">
                {decodedText ? (
                  <pre className="whitespace-pre-wrap">{decodedText}</pre>
                ) : (
                  <span className="opacity-50 select-none">
                    // No data extracted yet.<br/>// Upload encoded PNG and enter password.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-line relative z-10">
          <div className="flex flex-col md:flex-row gap-4 max-w-xl">
            <div className="flex-1 relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input 
                type="password" 
                placeholder="Master Password (AES-256 Key)" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-bg border border-line rounded-lg outline-none focus:border-primary font-mono text-sm"
              />
            </div>
            
            {mode === "encode" ? (
              <button 
                onClick={handleEncode} 
                disabled={isProcessing || !imageSrc || !password}
                className="btn btn-primary gap-2 px-8 py-3 disabled:opacity-50 flex-shrink-0"
              >
                {isProcessing ? <span className="animate-pulse">Encrypting...</span> : <><Lock className="w-4 h-4" /> Embed & Download</>}
              </button>
            ) : (
              <button 
                onClick={handleDecode} 
                disabled={isProcessing || !imageSrc || !password}
                className="btn btn-primary gap-2 px-8 py-3 disabled:opacity-50 flex-shrink-0"
              >
                {isProcessing ? <span className="animate-pulse">Decrypting...</span> : <><Unlock className="w-4 h-4" /> Decrypt & Extract</>}
              </button>
            )}
          </div>
          <p className="text-xs text-muted mt-3 max-w-xl">
            <strong>Zero-Knowledge:</strong> All cryptography and pixel manipulation happens locally in your browser using the native WebCrypto API. No servers are involved.
          </p>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
