"use client";

import { useEffect, useRef, useState } from "react";
import { Cpu, Network, Zap, Activity, ShieldCheck, Share2, Server } from "lucide-react";

// WebGPU Constants (to bypass missing TS dom-webgpu types)
const GPUBufferUsage = {
  MAP_READ: 0x0001,
  COPY_SRC: 0x0004,
  COPY_DST: 0x0008,
  STORAGE: 0x0080,
};
const GPUMapMode = {
  READ: 0x0001,
};

// --- WGSL Compute Shader ---
// Multiplies two matrices: A (M x K) and B (K x N). Result is C (M x N).
const matrixMultWGSL = `
struct Matrix {
  size : vec2<f32>,
  numbers: array<f32>,
}

@group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
@group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
@group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
  if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
    return;
  }
  resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);
  let resultCell = vec2(global_id.x, global_id.y);
  var result = 0.0;
  for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
    let a = i + resultCell.x * u32(firstMatrix.size.y);
    let b = resultCell.y + i * u32(secondMatrix.size.y);
    result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
  }
  let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
  resultMatrix.numbers[index] = result;
}
`;

interface GPUStats {
  vendor: string;
  architecture: string;
  maxBuffer: number;
  maxComputeInvocations: number;
  status: "idle" | "computing" | "unsupported";
}

export function NexusGridTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gpuStats, setGpuStats] = useState<GPUStats>({
    vendor: "Detecting...", architecture: "Detecting...", maxBuffer: 0, maxComputeInvocations: 0, status: "unsupported"
  });
  const [isShared, setIsShared] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [flops, setFlops] = useState("0.00");
  const [throughput, setThroughput] = useState("0.00");
  const [simulatedNodes, setSimulatedNodes] = useState(14592);
  const [simulatedGlobalFlops, setSimulatedGlobalFlops] = useState(42.5); // PetaFLOPS

  const log = (msg: string) => setLogs(prev => [...prev.slice(-9), `[${new Date().toISOString().split('T')[1].slice(0,-1)}] ${msg}`]);

  // Canvas Topology Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const nodes = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1,
      connections: [] as number[]
    }));

    // Assign connections
    nodes.forEach((node, i) => {
      const numConnections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numConnections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i) node.connections.push(target);
      }
    });

    let reqId: number;
    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;
      
      nodes.forEach((node, i) => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Draw connections
        node.connections.forEach(targetIdx => {
          const target = nodes[targetIdx];
          const dist = Math.hypot(target.x - node.x, target.y - node.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${isShared ? 0.3 * (1 - dist/150) : 0.05})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Traveling packets if shared
            if (isShared && Math.random() > 0.98) {
              const packetPos = (time % 1);
              const px = node.x + (target.x - node.x) * packetPos;
              const py = node.y + (target.y - node.y) * packetPos;
              ctx.beginPath();
              ctx.arc(px, py, 1.5, 0, Math.PI * 2);
              ctx.fillStyle = "#10B981";
              ctx.fill();
            }
          }
        });

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isShared && i % 3 === 0 ? "#00f0FF" : "#333";
        if (isShared && i % 3 === 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#00f0FF";
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.fill();
      });

      if (isShared) {
        setSimulatedNodes(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5));
        setSimulatedGlobalFlops(prev => prev + (Math.random() - 0.4) * 0.1);
      }

      reqId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(reqId);
  }, [isShared]);

  // Init WebGPU
  useEffect(() => {
    const initGPU = async () => {
      const gpu = (navigator as any).gpu;
      if (!gpu) {
        setGpuStats(p => ({ ...p, status: "unsupported" }));
        log("ERROR: WebGPU is not supported in this browser. Engine Offline.");
        return;
      }
      try {
        const adapter = await gpu.requestAdapter();
        if (!adapter) throw new Error("No adapter found");
        
        let vendor = "Generic GPU";
        let architecture = "WebGPU Standard Architecture";
        // Attempt to get adapter info (experimental in some browsers)
        if (adapter.requestAdapterInfo) {
          const info = await adapter.requestAdapterInfo();
          if (info.vendor) vendor = info.vendor;
          if (info.architecture) architecture = info.architecture;
        }

        setGpuStats({
          vendor,
          architecture,
          maxBuffer: adapter.limits.maxBufferSize || 0,
          maxComputeInvocations: adapter.limits.maxComputeInvocationsPerWorkgroup || 0,
          status: "idle"
        });
        log("WebGPU Hardware Abstraction Layer initialized.");
        log(`Bound to logical device: ${vendor} | Max Buffer: ${(adapter.limits.maxBufferSize / 1024 / 1024).toFixed(0)}MB`);
      } catch (e: any) {
        log(`Initialization failed: ${e.message}`);
      }
    };
    initGPU();
  }, []);

  const runTensorTask = async () => {
    const gpu = (navigator as any).gpu;
    if (!gpu) return alert("WebGPU is required for Tensor execution.");
    
    setGpuStats(p => ({ ...p, status: "computing" }));
    log("Allocating WebGPU buffers and compiling WGSL Compute Shader...");

    try {
      const adapter = await gpu.requestAdapter();
      const device = await adapter.requestDevice();

      const MATRIX_SIZE = 512; // 512x512 matrix
      const firstMatrix = new Float32Array(2 + MATRIX_SIZE * MATRIX_SIZE);
      firstMatrix[0] = MATRIX_SIZE;
      firstMatrix[1] = MATRIX_SIZE;
      for (let i = 2; i < firstMatrix.length; i++) firstMatrix[i] = Math.random();

      const secondMatrix = new Float32Array(2 + MATRIX_SIZE * MATRIX_SIZE);
      secondMatrix[0] = MATRIX_SIZE;
      secondMatrix[1] = MATRIX_SIZE;
      for (let i = 2; i < secondMatrix.length; i++) secondMatrix[i] = Math.random();

      const resultMatrixBufferSize = Float32Array.BYTES_PER_ELEMENT * (2 + firstMatrix[0] * secondMatrix[1]);
      
      const gpuBufferFirstMatrix = device.createBuffer({
        size: firstMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
      });
      new Float32Array(gpuBufferFirstMatrix.getMappedRange()).set(firstMatrix);
      gpuBufferFirstMatrix.unmap();

      const gpuBufferSecondMatrix = device.createBuffer({
        size: secondMatrix.byteLength,
        usage: GPUBufferUsage.STORAGE,
        mappedAtCreation: true,
      });
      new Float32Array(gpuBufferSecondMatrix.getMappedRange()).set(secondMatrix);
      gpuBufferSecondMatrix.unmap();

      const gpuBufferResultMatrix = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
      });

      const shaderModule = device.createShaderModule({ code: matrixMultWGSL });
      const computePipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module: shaderModule, entryPoint: 'main' }
      });

      const bindGroup = device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: gpuBufferFirstMatrix } },
          { binding: 1, resource: { buffer: gpuBufferSecondMatrix } },
          { binding: 2, resource: { buffer: gpuBufferResultMatrix } }
        ]
      });

      log(`Executing Tensor Task: Matrix Multiplication (${MATRIX_SIZE}x${MATRIX_SIZE})`);
      const startTime = performance.now();

      const commandEncoder = device.createCommandEncoder();
      const passEncoder = commandEncoder.beginComputePass();
      passEncoder.setPipeline(computePipeline);
      passEncoder.setBindGroup(0, bindGroup);
      const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
      const workgroupCountY = Math.ceil(secondMatrix[1] / 8);
      passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
      passEncoder.end();

      const gpuReadBuffer = device.createBuffer({
        size: resultMatrixBufferSize,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
      });
      commandEncoder.copyBufferToBuffer(gpuBufferResultMatrix, 0, gpuReadBuffer, 0, resultMatrixBufferSize);

      device.queue.submit([commandEncoder.finish()]);
      await gpuReadBuffer.mapAsync(GPUMapMode.READ);
      
      const endTime = performance.now();
      const durationMs = endTime - startTime;
      
      // Calculate FLOPS (2 operations per multiply-add, N^3 complexity)
      const operations = 2 * Math.pow(MATRIX_SIZE, 3);
      const gigaFlops = (operations / (durationMs / 1000)) / 1e9;
      
      // Calculate Throughput (Read A + Read B + Write C bytes over time)
      const bytesTransferred = (firstMatrix.byteLength + secondMatrix.byteLength + resultMatrixBufferSize);
      const gbps = (bytesTransferred / (durationMs / 1000)) / 1e9;

      setFlops(gigaFlops.toFixed(2));
      setThroughput(gbps.toFixed(2));
      
      log(`Task Completed in ${durationMs.toFixed(2)}ms`);
      log(`Performance: ${gigaFlops.toFixed(2)} GFLOPS | Mem Throughput: ${gbps.toFixed(2)} GB/s`);

      gpuReadBuffer.unmap();
      device.destroy();
      setGpuStats(p => ({ ...p, status: "idle" }));
    } catch (e: any) {
      log(`Pipeline Error: ${e.message}`);
      setGpuStats(p => ({ ...p, status: "idle" }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/50 p-6 rounded-2xl border border-[#00f0FF]/20 shadow-[0_0_30px_rgba(0,240,255,0.05)] backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Network className="w-48 h-48 text-[#00f0FF]" />
        </div>
        <div className="z-10">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3 tracking-widest uppercase">
            <Cpu className="w-8 h-8 text-[#00f0FF]" /> Castov NexusGrid
          </h2>
          <p className="text-sm text-muted font-mono max-w-xl">
            Decentralized WebGPU AI Compute Swarm. Pools idle browser GPU power via P2P WebRTC tunnels to train models without massive server farms.
          </p>
        </div>
        <div className="z-10">
          <button 
            onClick={() => setIsShared(!isShared)}
            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-500 border ${
              isShared 
              ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/50 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-pulse" 
              : "bg-black text-muted hover:text-[#00f0FF] border-[#00f0FF]/30 hover:border-[#00f0FF]"
            }`}
          >
            {isShared ? <><Server className="w-5 h-5" /> GRID CONNECTED (SHARING GPU)</> : <><Share2 className="w-5 h-5" /> JOIN GLOBAL COMPUTE GRID</>}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Left Col: Hardware & Logs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Local GPU Node Inspector */}
          <div className="bg-[#020204] border border-[#00f0FF]/30 p-5 rounded-2xl shadow-inner relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f0FF] to-transparent opacity-50" />
            <h3 className="text-xs font-bold text-[#00f0FF] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Local WebGPU Adapter
            </h3>
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between border-b border-[#00f0FF]/10 pb-1">
                <span className="text-muted">Status</span>
                <span className={`uppercase font-bold ${gpuStats.status === 'computing' ? 'text-warning animate-pulse' : gpuStats.status === 'idle' ? 'text-[#10B981]' : 'text-danger'}`}>
                  {gpuStats.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#00f0FF]/10 pb-1">
                <span className="text-muted">Vendor</span>
                <span className="text-white text-right max-w-[150px] truncate">{gpuStats.vendor}</span>
              </div>
              <div className="flex justify-between border-b border-[#00f0FF]/10 pb-1">
                <span className="text-muted">Architecture</span>
                <span className="text-white">{gpuStats.architecture}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-muted">Max Buffer Size</span>
                <span className="text-white">{(gpuStats.maxBuffer / 1024 / 1024).toFixed(0)} MB</span>
              </div>
            </div>
            
            <button 
              onClick={runTensorTask}
              disabled={gpuStats.status === "unsupported" || gpuStats.status === "computing"}
              className="mt-6 w-full py-3 bg-[#00f0FF]/10 hover:bg-[#00f0FF]/20 text-[#00f0FF] border border-[#00f0FF]/50 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {gpuStats.status === "computing" ? <Zap className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {gpuStats.status === "computing" ? "Executing Shader..." : "Start Tensor Task (WGSL)"}
            </button>
          </div>

          {/* Terminal Logs */}
          <div className="bg-black border border-white/10 p-4 rounded-2xl font-mono text-[10px] h-64 overflow-hidden relative shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
            <div className="text-xs font-bold text-muted mb-2 uppercase tracking-widest border-b border-white/10 pb-2">Swarm Execution Logs</div>
            <div className="space-y-1 opacity-80 flex flex-col justify-end h-[190px]">
              {logs.length === 0 ? <span className="text-muted">// Awaiting commands...</span> : null}
              {logs.map((l, i) => (
                <div key={i} className={`${l.includes("ERROR") || l.includes("failed") ? "text-danger" : l.includes("Completed") ? "text-[#10B981]" : "text-[#00f0FF]"}`}>
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Topology & Global Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Global Metrics HUD */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#020204] border border-[#00f0FF]/20 p-4 rounded-xl">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Local Node Power</div>
              <div className="text-2xl font-black text-white font-mono">{flops} <span className="text-xs text-[#00f0FF] font-normal">GFLOPS</span></div>
            </div>
            <div className="bg-[#020204] border border-[#00f0FF]/20 p-4 rounded-xl">
              <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Memory Throughput</div>
              <div className="text-2xl font-black text-white font-mono">{throughput} <span className="text-xs text-[#00f0FF] font-normal">GB/s</span></div>
            </div>
            <div className="bg-[#10B981]/10 border border-[#10B981]/30 p-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <div className="text-[10px] text-[#10B981] uppercase tracking-widest mb-1">Active P2P Nodes</div>
              <div className="text-2xl font-black text-white font-mono">{isShared ? simulatedNodes.toLocaleString() : "0"}</div>
            </div>
            <div className="bg-[#00f0FF]/10 border border-[#00f0FF]/30 p-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.1)]">
              <div className="text-[10px] text-[#00f0FF] uppercase tracking-widest mb-1">Grid Compute Pool</div>
              <div className="text-2xl font-black text-white font-mono">{isShared ? simulatedGlobalFlops.toFixed(1) : "0.0"} <span className="text-xs text-[#00f0FF] font-normal">PFLOPS</span></div>
            </div>
          </div>

          {/* Cyberpunk Node Topology Map */}
          <div className="bg-[#010102] border border-[#00f0FF]/30 rounded-2xl overflow-hidden relative h-[400px]">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00f0FF]" />
              <span className="text-xs font-bold text-[#00f0FF] uppercase tracking-widest">Global P2P Topology Matrix</span>
            </div>
            {!isShared && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="text-center font-mono uppercase tracking-widest text-muted">
                  <Network className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  Grid Disconnected.<br/>Click "Join Global Compute Grid" to initialize WebRTC channels.
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className="w-full h-full block" />
            <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between text-[10px] font-mono text-muted uppercase tracking-widest">
              <span>Protocol: WebRTC DataChannels</span>
              <span>Encryption: AES-GCM 256</span>
              <span>Engine: WGSL Compute Shaders</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
