"use client";

import { useRef, useState, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Line, Stats } from "@react-three/drei";
import { BoxIcon, UploadCloudIcon, Maximize2, Zap } from "lucide-react";
import * as THREE from "three";

interface NodeData {
  id: string;
  label: string;
  type: "root" | "object" | "array" | "value";
  value: string;
  path: string;
  position: [number, number, number];
  color: string;
}

interface EdgeData {
  source: [number, number, number];
  target: [number, number, number];
}

interface HudState {
  label: string;
  path: string;
  value: string;
  type: string;
}

function DataNode({ data, setHud }: { data: NodeData, setHud: (s: HudState | null) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      if (data.type === "root") {
        // Pulsing effect for sun
        const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      }
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  const geometryArgs = data.type === "root" ? [2, 4] 
                     : data.type === "object" ? [1, 2] 
                     : data.type === "array" ? [0.8, 1] 
                     : [0.3, 0];

  return (
    <group position={data.position}>
      <mesh 
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); setHud({ label: data.label, path: data.path, value: data.value, type: data.type }); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { setHovered(false); setHud(null); document.body.style.cursor = 'auto'; }}
      >
        {/* @ts-ignore */}
        <icosahedronGeometry args={geometryArgs} />
        <meshStandardMaterial 
          color={hovered ? "#ffffff" : data.color} 
          wireframe={data.type !== "value" && data.type !== "root"} 
          emissive={data.type === "root" || hovered ? data.color : "#000000"}
          emissiveIntensity={hovered ? 2 : data.type === "root" ? 1 : 0}
          opacity={data.type === "value" ? 0.9 : 1} 
          transparent 
        />
      </mesh>
      {(data.type !== "value" || hovered) && (
        <Text position={[0, geometryArgs[0] * 1.5, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
          {data.label}
        </Text>
      )}
    </group>
  );
}

export function ThreeJsonGalaxyTool({ providedJson = null }: { providedJson?: any }) {
  const [hasData, setHasData] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [error, setError] = useState("");
  const [hud, setHud] = useState<HudState | null>(null);

  const parseJSONToGraph = (obj: any) => {
    const newNodes: NodeData[] = [];
    const newEdges: EdgeData[] = [];
    let idCounter = 0;

    const traverse = (data: any, depth: number, parentPos: [number, number, number] | null, label: string, currentPath: string) => {
      // Hard limit to prevent WebGL crashing on massive files (limit to ~1000 nodes)
      if (idCounter > 1000) return;

      const id = (idCounter++).toString();
      let type: "root" | "object" | "array" | "value" = "value";
      if (depth === 0) type = "root";
      else if (Array.isArray(data)) type = "array";
      else if (typeof data === "object" && data !== null) type = "object";
      
      const valueStr = type === "value" ? String(data) : type === "array" ? `Array(${data.length})` : `Object(${Object.keys(data).length})`;

      // Mathematical Solar System Layout
      const radius = depth === 0 ? 0 : depth * 6 + (Math.random() * 2);
      const theta = Math.random() * Math.PI * 2;
      // Distribute mostly on a flat disc (galaxy plane) with slight Z variance
      const phi = (Math.PI / 2) + (Math.random() * 0.5 - 0.25);
      
      const position: [number, number, number] = depth === 0 ? [0,0,0] : [
        (parentPos ? parentPos[0] : 0) + radius * Math.sin(phi) * Math.cos(theta),
        (parentPos ? parentPos[1] : 0) + radius * Math.cos(phi), // Y is up
        (parentPos ? parentPos[2] : 0) + radius * Math.sin(phi) * Math.sin(theta),
      ];

      const color = type === "root" ? "#f59e0b" // Sun (Yellow/Orange)
                  : type === "object" ? "#3b82f6" // Planet (Blue)
                  : type === "array" ? "#10b981" // Belt (Green)
                  : "#9ca3af"; // Moon (Gray)
      
      newNodes.push({ id, label: depth === 0 ? "{ root }" : label, type, value: valueStr, path: currentPath || "root", position, color });

      if (parentPos) {
        newEdges.push({ source: parentPos, target: position });
      }

      if (depth < 6 && type !== "value") { 
        const keys = Object.keys(data).slice(0, 20); // Limit children per node
        keys.forEach(key => traverse(data[key], depth + 1, position, key, `${currentPath}.${key}`));
      }
    };

    traverse(obj, 0, null, "root", "");
    setNodes(newNodes);
    setEdges(newEdges);
    setHasData(true);
  };

  useEffect(() => {
    if (providedJson) {
      parseJSONToGraph(providedJson);
    }
  }, [providedJson]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target?.result as string);
        parseJSONToGraph(obj);
        setError("");
      } catch (err) {
        setError("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 w-full">
      {!hasData ? (
        <div className="card p-12 text-center border-dashed border-2 border-line bg-card w-full">
          <BoxIcon className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Holographic 3D JSON Galaxy</h2>
          <p className="text-muted max-w-xl mx-auto mb-8">
            Upload a JSON file and explore its architecture as a 3D universe. 
            Root is the Sun. Objects are Planets. Primitives are Moons.
          </p>
          {error && <p className="text-danger mb-4 font-bold">{error}</p>}
          <div className="flex justify-center gap-4">
            <label className="btn btn-primary cursor-pointer gap-2">
              <UploadCloudIcon className="w-5 h-5" /> Upload JSON File
              <input type="file" accept="application/json" onChange={handleUpload} className="hidden" />
            </label>
          </div>
        </div>
      ) : (
        <div className="h-[80vh] min-h-[600px] w-full rounded-2xl overflow-hidden border border-line bg-black relative shadow-2xl">
          
          {/* Performance Badge & HUD Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-4 w-72 pointer-events-none">
            <div className="bg-black/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-warning" />
                <h3 className="font-bold text-sm tracking-widest uppercase">WebGPU Engine</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs opacity-70 font-mono">
                <div>Nodes: {nodes.length}</div>
                <div>Edges: {edges.length}</div>
              </div>
            </div>

            {hud && (
              <div className="bg-black/90 backdrop-blur-md p-4 rounded-xl border border-accent/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-in fade-in slide-in-from-left-4 duration-200">
                <div className="text-xs text-muted mb-1 font-mono break-all">{hud.path}</div>
                <div className="font-bold text-lg mb-2">{hud.label} <span className="text-xs opacity-50 font-normal">({hud.type})</span></div>
                <div className="text-sm font-mono bg-white/5 p-2 rounded overflow-auto max-h-32 text-accent">
                  {hud.value}
                </div>
              </div>
            )}
          </div>

          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {!providedJson && (
              <button onClick={() => setHasData(false)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors font-semibold">
                Reset
              </button>
            )}
          </div>
          
          <Canvas camera={{ position: [0, 20, 40], fov: 60 }} dpr={[1, 2]}>
            <color attach="background" args={['#030305']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#f59e0b" distance={100} /> {/* Sun Light */}
            <directionalLight position={[10, 20, 10]} intensity={1} />
            
            <Stars radius={150} depth={50} count={7000} factor={4} saturation={0} fade speed={0.5} />
            
            {nodes.map(node => (
              <DataNode key={node.id} data={node} setHud={setHud} />
            ))}
            
            {edges.map((edge, i) => (
              <Line 
                key={i} 
                points={[edge.source, edge.target]} 
                color="#ffffff" 
                opacity={0.15} 
                transparent 
                lineWidth={1} 
              />
            ))}
            
            <OrbitControls autoRotate autoRotateSpeed={0.3} enableDamping dampingFactor={0.05} maxDistance={200} />
            <Stats className="!absolute !bottom-4 !right-4 !left-auto !top-auto !w-[80px]" />
          </Canvas>
        </div>
      )}
    </div>
  );
}
