"use client";

import { useState, useRef } from "react";
import { Lock, Image as ImageIcon, Download, ShieldCheck, Unlock } from "lucide-react";

export function SteganographyEnvVaultTool() {
  const [envText, setEnvText] = useState("DATABASE_URL=postgres://user:pass@localhost:5432/db\nAPI_KEY=sk_test_12345");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [decodedText, setDecodedText] = useState("");
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

  const strToBin = (str: string) => {
    const bin = [];
    for (let i = 0; i < str.length; i++) {
      let b = str.charCodeAt(i).toString(2);
      while (b.length < 8) b = "0" + b;
      bin.push(b);
    }
    return bin.join("") + "0000000000000000"; // Null terminator (16 zeros)
  };

  const binToStr = (bin: string) => {
    let str = "";
    for (let i = 0; i < bin.length; i += 8) {
      const byte = bin.substring(i, i + 8);
      if (byte === "00000000") break; // Stop at null terminator
      str += String.fromCharCode(parseInt(byte, 2));
    }
    return str;
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

  const handleEncode = () => {
    if (!imageSrc) return alert("Upload a PNG logo first.");
    processImage((ctx, imgData, img) => {
      const binary = strToBin(envText);
      const data = imgData.data;
      
      if (binary.length > data.length / 4 * 3) {
        return alert("Image is too small to hold this much data. Use a larger image or less text.");
      }

      let binIndex = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (binIndex < binary.length) { data[i] = (data[i] & ~1) | parseInt(binary[binIndex++]); } // R
        if (binIndex < binary.length) { data[i+1] = (data[i+1] & ~1) | parseInt(binary[binIndex++]); } // G
        if (binIndex < binary.length) { data[i+2] = (data[i+2] & ~1) | parseInt(binary[binIndex++]); } // B
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      // Download the modified image
      const a = document.createElement("a");
      a.href = canvasRef.current!.toDataURL("image/png");
      a.download = "secure_vault_logo.png";
      a.click();
    });
  };

  const handleDecode = () => {
    if (!imageSrc) return alert("Upload an encoded PNG logo first.");
    processImage((ctx, imgData) => {
      const data = imgData.data;
      let binary = "";
      
      for (let i = 0; i < data.length; i += 4) {
        binary += (data[i] & 1).toString();
        binary += (data[i+1] & 1).toString();
        binary += (data[i+2] & 1).toString();
        
        // Optimization: check for null terminator periodically
        if (binary.length % 8 === 0 && binary.endsWith("0000000000000000")) {
          break;
        }
      }
      
      try {
        const decoded = binToStr(binary);
        setDecodedText(decoded);
      } catch (e) {
        alert("Could not decode. Are you sure this image contains hidden data?");
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 border-b border-line pb-4">
        <button 
          onClick={() => setMode("encode")} 
          className={`px-4 py-2 font-bold rounded-lg ${mode === "encode" ? "bg-primary text-primary-fg" : "hover:bg-hover"}`}
        >
          Hide Secrets (Encode)
        </button>
        <button 
          onClick={() => setMode("decode")} 
          className={`px-4 py-2 font-bold rounded-lg ${mode === "decode" ? "bg-primary text-primary-fg" : "hover:bg-hover"}`}
        >
          Extract Secrets (Decode)
        </button>
      </div>

      <div className="card p-8 bg-card border-line relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldCheck className="w-48 h-48" />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <label className="font-semibold text-sm">1. Carrier Image (PNG)</label>
            <div className="w-full h-48 border-2 border-dashed border-line rounded-lg flex flex-col items-center justify-center relative bg-bg hover:border-accent transition-colors overflow-hidden">
              <input type="file" accept="image/png" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
              {imageSrc ? (
                <img src={imageSrc} className="w-full h-full object-contain p-2" alt="Carrier" />
              ) : (
                <div className="text-center text-muted">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-sm">Click or Drop PNG here</span>
                </div>
              )}
            </div>
            {imageSrc && (
              <button onClick={() => setImageSrc(null)} className="text-xs text-danger hover:underline">Remove Image</button>
            )}
          </div>
          
          <div className="space-y-4">
            <label className="font-semibold text-sm">
              {mode === "encode" ? "2. Secret Payload (.env)" : "2. Extracted Payload"}
            </label>
            {mode === "encode" ? (
              <textarea 
                value={envText}
                onChange={e => setEnvText(e.target.value)}
                className="w-full h-48 bg-bg border border-line rounded-lg p-4 font-mono text-sm resize-none focus:border-accent outline-none"
              />
            ) : (
              <div className="w-full h-48 bg-black border border-line rounded-lg p-4 font-mono text-sm overflow-auto text-green-400 select-all">
                {decodedText || "// No data extracted yet. Click Extract below."}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 relative z-10 flex gap-4">
          {mode === "encode" ? (
            <button onClick={handleEncode} className="btn btn-primary gap-2 px-8 py-3">
              <Lock className="w-5 h-5" /> Embed & Download PNG
            </button>
          ) : (
            <button onClick={handleDecode} className="btn btn-primary gap-2 px-8 py-3">
              <Unlock className="w-5 h-5" /> Extract from PNG
            </button>
          )}
        </div>

        {/* Hidden canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
