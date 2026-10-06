"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, Mic, Activity, ShieldAlert, WifiOff, RefreshCcw } from "lucide-react";

const FREQ_0 = 18000; // 18 kHz (near ultrasonic)
const FREQ_1 = 19000; // 19 kHz
const BAUD_RATE = 150; // ms per bit
const START_FREQ = 17000;

export function SonicGapBridgeTool() {
  const [mode, setMode] = useState<"idle" | "tx" | "rx">("idle");
  const [payload, setPayload] = useState("CASTOV");
  const [receivedBits, setReceivedBits] = useState("");
  const [receivedText, setReceivedText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Audio context refs
  const audioCtx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const dataArray = useRef<Uint8Array | null>(null);
  const rafId = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioCtx.current && audioCtx.current.state !== 'closed') {
        audioCtx.current.close().catch(() => {});
      }
    };
  }, []);

  // --- TRANSMITTER (Tx) ---
  const transmit = async () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    setMode("tx");
    
    // String to Binary (ASCII)
    const binary = payload.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join('');
    
    const playFreq = (freq: number, duration: number) => {
      return new Promise<void>(resolve => {
        const osc = audioCtx.current!.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        osc.connect(audioCtx.current!.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          resolve();
        }, duration);
      });
    };

    // Transmission Sequence
    await playFreq(START_FREQ, 300); // Start marker
    for (const bit of binary) {
      await playFreq(bit === '1' ? FREQ_1 : FREQ_0, BAUD_RATE);
    }
    
    setMode("idle");
  };

  // --- RECEIVER (Rx) ---
  const receive = async () => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    setMode("rx");
    setReceivedBits("");
    setReceivedText("");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const source = audioCtx.current.createMediaStreamSource(stream);
      analyser.current = audioCtx.current.createAnalyser();
      analyser.current.fftSize = 2048;
      source.connect(analyser.current);
      
      const bufferLength = analyser.current.frequencyBinCount;
      dataArray.current = new Uint8Array(bufferLength);
      
      let isReceiving = false;
      let bits = "";
      let lastProcessTime = 0;

      const detectFrequency = () => {
        if (!analyser.current || !dataArray.current || mode !== "rx") return;
        analyser.current.getByteFrequencyData(dataArray.current as any);
        
        const sampleRate = audioCtx.current!.sampleRate;
        const binSize = sampleRate / analyser.current.fftSize;
        
        const getAmp = (freq: number) => {
          const bin = Math.floor(freq / binSize);
          return dataArray.current![bin];
        };

        const ampStart = getAmp(START_FREQ);
        const amp0 = getAmp(FREQ_0);
        const amp1 = getAmp(FREQ_1);
        
        const threshold = 150;
        const now = performance.now();

        if (ampStart > threshold && !isReceiving) {
          isReceiving = true;
          lastProcessTime = now + 150; // offset wait
        } else if (isReceiving && now - lastProcessTime > BAUD_RATE * 0.8) {
          if (amp1 > threshold) {
            bits += "1";
            lastProcessTime = now;
            setReceivedBits(bits);
          } else if (amp0 > threshold) {
            bits += "0";
            lastProcessTime = now;
            setReceivedBits(bits);
          }
          
          // Auto decode every 8 bits
          if (bits.length % 8 === 0 && bits.length > 0) {
            let str = "";
            for (let i = 0; i < bits.length; i += 8) {
              const charCode = parseInt(bits.slice(i, i + 8), 2);
              if (charCode >= 32 && charCode <= 126) str += String.fromCharCode(charCode);
            }
            setReceivedText(str);
          }
        }

        drawVisualizer();
        rafId.current = requestAnimationFrame(detectFrequency);
      };
      
      detectFrequency();
    } catch (err) {
      alert("Microphone access denied or unavailable.");
      setMode("idle");
    }
  };

  const stopReceive = () => {
    setMode("idle");
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
  };

  // --- CANVAS VISUALIZER ---
  const drawVisualizer = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyser.current || !dataArray.current) return;
    const ctx = canvas.getContext("2d")!;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / analyser.current.frequencyBinCount) * 5;
    let x = 0;
    
    // Draw FFT Spectrogram
    for(let i = 0; i < analyser.current.frequencyBinCount; i += 5) {
      const barHeight = (dataArray.current[i] / 255) * canvas.height;
      const r = barHeight + 25 * (i/analyser.current.frequencyBinCount);
      const g = 250 * (i/analyser.current.frequencyBinCount);
      const b = 250;
      
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  return (
    <div className="space-y-6 text-white max-w-6xl mx-auto">
      <div className="bg-black/60 border border-[#a855f7]/30 p-8 rounded-2xl shadow-[0_0_40px_rgba(168,85,247,0.15)] relative overflow-hidden">
        <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none">
          <WifiOff className="w-96 h-96 text-[#a855f7]" />
        </div>
        
        <div className="relative z-10 flex items-center gap-4 mb-4">
          <ShieldAlert className="w-10 h-10 text-[#a855f7]" />
          <div>
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#a855f7]">Sonic-Gap Bridge</h2>
            <p className="text-muted font-mono text-sm mt-1">Air-Gapped Ultrasonic Acoustic Data Transfer Protocol (FSK 18kHz-19kHz)</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* TRANSMITTER */}
          <div className="bg-[#050510] border border-[#00f0FF]/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#00f0FF] uppercase flex items-center gap-2 mb-4"><Volume2 className="w-5 h-5"/> Transmitter (Tx)</h3>
            <div className="space-y-4">
              <input 
                type="text" maxLength={10} value={payload} onChange={e => setPayload(e.target.value.toUpperCase())} disabled={mode !== "idle"}
                className="w-full bg-black border border-[#00f0FF]/50 rounded-lg p-4 font-mono text-[#00f0FF] outline-none uppercase"
                placeholder="DATA PAYLOAD (MAX 10 CHARS)"
              />
              <button 
                onClick={transmit} disabled={mode !== "idle" || !payload}
                className="w-full bg-[#00f0FF]/20 hover:bg-[#00f0FF]/40 text-[#00f0FF] border border-[#00f0FF]/50 p-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {mode === "tx" ? "Broadcasting Ultrasonic Frequencies..." : "Transmit Data via Audio"}
              </button>
            </div>
          </div>

          {/* RECEIVER */}
          <div className="bg-[#050510] border border-[#10B981]/20 rounded-xl p-6">
            <h3 className="text-lg font-bold text-[#10B981] uppercase flex items-center gap-2 mb-4"><Mic className="w-5 h-5"/> Receiver (Rx)</h3>
            <div className="space-y-4">
              <div className="w-full h-[58px] bg-black border border-[#10B981]/50 rounded-lg p-4 font-mono text-[#10B981] shadow-inner flex items-center justify-between">
                <span>{receivedText || "// AWAITING SONIC SIGNAL"}</span>
                {receivedBits && <span className="text-[10px] opacity-50">{receivedBits.slice(-16)}</span>}
              </div>
              <button 
                onClick={mode === "rx" ? stopReceive : receive} disabled={mode === "tx"}
                className={`w-full p-4 rounded-lg font-bold uppercase tracking-widest transition-all disabled:opacity-50 border ${mode === "rx" ? "bg-red-500/20 text-red-500 border-red-500/50" : "bg-[#10B981]/20 hover:bg-[#10B981]/40 text-[#10B981] border-[#10B981]/50"}`}
              >
                {mode === "rx" ? "Stop Listening" : "Listen for Ultrasonic Data"}
              </button>
            </div>
          </div>
        </div>

        {/* VISUALIZER */}
        <div className="mt-8 border border-white/10 rounded-xl bg-black h-48 relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#a855f7]" />
            <span className="text-xs font-bold text-[#a855f7] uppercase tracking-widest">Real-Time FFT Spectrogram</span>
          </div>
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
