"use client";

import { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text, Line } from "@react-three/drei";
import { BoxIcon, UploadCloudIcon } from "lucide-react";
import * as THREE from "three";

interface NodeData {
  id: string;
  label: string;
  type: "object" | "array" | "value";
  position: [number, number, number];
  color: string;
}

interface EdgeData {
  source: [number, number, number];
  target: [number, number, number];
}

function DataNode({ data }: { data: NodeData }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }
  });

  const geometryArgs = data.type === "object" ? [1, 2] : data.type === "array" ? [0.8, 1] : [0.5, 0];

  return (
    <group position={data.position}>
      <mesh ref={meshRef}>
        {/* @ts-ignore */}
        <icosahedronGeometry args={geometryArgs} />
        <meshStandardMaterial color={data.color} wireframe={data.type !== "value"} opacity={data.type === "value" ? 0.8 : 1} transparent />
      </mesh>
      <Text position={[0, 1.2, 0]} fontSize={0.3} color="white" anchorX="center" anchorY="middle">
        {data.label}
      </Text>
    </group>
  );
}

export function ThreeJsonGalaxyTool() {
  const [hasData, setHasData] = useState(false);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [error, setError] = useState("");

  const parseJSONToGraph = (obj: any) => {
    const newNodes: NodeData[] = [];
    const newEdges: EdgeData[] = [];
    
    let idCounter = 0;

    const traverse = (data: any, depth: number, parentPos: [number, number, number] | null, label: string) => {
      const id = (idCounter++).toString();
      const type = Array.isArray(data) ? "array" : typeof data === "object" && data !== null ? "object" : "value";
      
      // Spherical layout math
      const radius = depth === 0 ? 0 : depth * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      const position: [number, number, number] = depth === 0 ? [0,0,0] : [
        (parentPos ? parentPos[0] : 0) + radius * Math.sin(phi) * Math.cos(theta) * 0.5,
        (parentPos ? parentPos[1] : 0) + radius * Math.sin(phi) * Math.sin(theta) * 0.5,
        (parentPos ? parentPos[2] : 0) + radius * Math.cos(phi) * 0.5,
      ];

      const color = type === "object" ? "#3b82f6" : type === "array" ? "#10b981" : "#f59e0b";
      
      newNodes.push({ id, label: depth === 0 ? "{ root }" : label, type, position, color });

      if (parentPos) {
        newEdges.push({ source: parentPos, target: position });
      }

      if (depth < 4 && type !== "value") { // Limit depth to prevent browser crash
        const keys = Object.keys(data).slice(0, 10); // Limit children
        keys.forEach(key => traverse(data[key], depth + 1, position, key));
        if (Object.keys(data).length > 10) {
           traverse(`... ${Object.keys(data).length - 10} more`, depth + 1, position, "hidden");
        }
      }
    };

    traverse(obj, 0, null, "root");
    setNodes(newNodes);
    setEdges(newEdges);
    setHasData(true);
  };

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

  const loadDemo = () => {
    parseJSONToGraph({
      project: "Castov",
      version: 2.0,
      active: true,
      features: ["p2p", "3d", "ai", "crypto"],
      database: {
        users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }],
        settings: { theme: "dark", notifications: true }
      },
      meta: { tags: ["nextjs", "threejs", "webgl"] }
    });
  };

  return (
    <div className="space-y-6">
      {!hasData ? (
        <div className="card p-12 text-center border-dashed border-2 border-line bg-card">
          <BoxIcon className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Holographic JSON Explorer</h2>
          <p className="text-muted max-w-xl mx-auto mb-8">
            Upload a JSON file and explore its architecture as a 3D universe. Objects become planets, arrays become asteroid belts. Find structural anomalies visually.
          </p>
          
          {error && <p className="text-danger mb-4 font-bold">{error}</p>}

          <div className="flex justify-center gap-4">
            <label className="btn btn-primary cursor-pointer gap-2">
              <UploadCloudIcon className="w-5 h-5" /> Upload JSON File
              <input type="file" accept="application/json" onChange={handleUpload} className="hidden" />
            </label>
            <button onClick={loadDemo} className="btn btn-secondary">Load Demo Schema</button>
          </div>
        </div>
      ) : (
        <div className="h-[700px] w-full rounded-2xl overflow-hidden border border-line bg-black relative shadow-2xl">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
            <h3 className="font-bold">JSON Galaxy Active</h3>
            <p className="text-sm opacity-70">Nodes: {nodes.length} | Scroll to zoom. Drag to orbit.</p>
          </div>
          <button 
            onClick={() => setHasData(false)} 
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Reset
          </button>
          
          <Canvas camera={{ position: [0, 10, 25], fov: 60 }}>
            <color attach="background" args={['#050510']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {nodes.map(node => (
              <DataNode key={node.id} data={node} />
            ))}
            
            {edges.map((edge, i) => (
              <Line 
                key={i} 
                points={[edge.source, edge.target]} 
                color="white" 
                opacity={0.15} 
                transparent 
                lineWidth={1} 
              />
            ))}
            
            <OrbitControls autoRotate autoRotateSpeed={0.5} enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
