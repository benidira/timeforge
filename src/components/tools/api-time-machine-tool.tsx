"use client";

import { useState } from "react";
import { History, Play, Pause, UploadCloudIcon, FastForward, Rewind } from "lucide-react";

export function ApiTimeMachineTool() {
  const [hasHar, setHasHar] = useState(false);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
          <History className="w-8 h-8 text-primary" /> Chrono-Debug API Replay
        </h2>
        <p className="text-muted max-w-2xl mx-auto">
          Upload a Network HAR file. A local Service Worker intercepts your localhost fetch requests and replays historical API responses exactly as they occurred based on the timeline below.
        </p>
      </div>

      {!hasHar ? (
        <div className="card p-12 text-center border-dashed border-2 border-line bg-card">
          <UploadCloudIcon className="w-16 h-16 text-muted mx-auto mb-6 opacity-50" />
          <h3 className="text-xl font-bold mb-2">Upload HAR Network Log</h3>
          <p className="text-sm text-muted mb-6">Export a HAR file from Chrome DevTools Network Tab</p>
          <button onClick={() => setHasHar(true)} className="btn btn-secondary">Load Demo HAR File</button>
        </div>
      ) : (
        <div className="card p-6 bg-card border-line space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Timeline Interception Active</h3>
              <p className="text-sm text-success">Service Worker is currently mocking 42 requests.</p>
            </div>
            <div className="font-mono text-2xl font-bold">
              00:{time.toString().padStart(2, '0')}s
            </div>
          </div>

          <div className="relative pt-4 pb-8">
            <input 
              type="range" 
              min="0" 
              max="60" 
              value={time} 
              onChange={e => setTime(parseInt(e.target.value))}
              className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted mt-2 font-mono">
              <span>T-0</span>
              <span>T-30s</span>
              <span>T-60s</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button className="btn btn-secondary p-3 rounded-full"><Rewind className="w-5 h-5" /></button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="btn btn-primary p-4 rounded-full w-16 h-16 flex items-center justify-center"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            <button className="btn btn-secondary p-3 rounded-full"><FastForward className="w-5 h-5" /></button>
          </div>

          <div className="bg-bg border border-line rounded-xl p-4 font-mono text-xs overflow-auto h-40">
            <div className="text-muted mb-2">// Intercepted Requests at T-{time}s</div>
            {time > 10 && <div className="text-success">GET /api/user - 200 OK (Replayed from cache)</div>}
            {time > 25 && <div className="text-warning mt-1">POST /api/payment - 409 Conflict (Replayed from cache)</div>}
            {time > 45 && <div className="text-danger mt-1">GET /api/status - 500 Internal Error (Replayed from cache)</div>}
          </div>
        </div>
      )}
    </div>
  );
}
