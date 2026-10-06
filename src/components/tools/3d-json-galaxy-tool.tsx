"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import { BoxIcon, UploadCloudIcon } from "lucide-react";
import * as THREE from "three";

function DataNode({ position, color, label }: { position: [number, number, number], color: string, label: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="white" anchorX="center" anchorY="middle">
        {label}
      </Text>
    </group>
  );
}

export function ThreeJsonGalaxyTool() {
  const [hasData, setHasData] = useState(false);

  return (
    <div className="space-y-6">
      {!hasData ? (
        <div className="card p-12 text-center border-dashed border-2 border-line bg-card">
          <BoxIcon className="w-16 h-16 text-accent mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Holographic JSON Explorer</h2>
          <p className="text-muted max-w-xl mx-auto mb-8">
            Upload a massive JSON file and explore its architecture as a 3D universe. Objects become planets, arrays become asteroid belts. Find structural anomalies visually.
          </p>
          <button onClick={() => setHasData(true)} className="btn btn-primary gap-2 px-8 py-3">
            <UploadCloudIcon className="w-5 h-5" /> Load Demo Schema
          </button>
        </div>
      ) : (
        <div className="h-[700px] w-full rounded-2xl overflow-hidden border border-line bg-black relative shadow-2xl">
          <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white">
            <h3 className="font-bold">JSON Galaxy Active</h3>
            <p className="text-sm opacity-70">Scroll to zoom. Drag to orbit.</p>
          </div>
          <button 
            onClick={() => setHasData(false)} 
            className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Reset
          </button>
          
          <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
            <color attach="background" args={['#050510']} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Root Node */}
            <DataNode position={[0, 0, 0]} color="#3b82f6" label="{ root }" />
            
            {/* Child Nodes */}
            <DataNode position={[-5, 2, -5]} color="#10b981" label="users: []" />
            <DataNode position={[5, -2, -2]} color="#f59e0b" label="config: {}" />
            <DataNode position={[0, 4, -8]} color="#ec4899" label="metadata: {}" />
            
            {/* Connecting lines (mock) */}
            <line>
              <bufferGeometry attach="geometry" />
              <lineBasicMaterial attach="material" color="#ffffff" opacity={0.2} transparent />
            </line>
            
            <OrbitControls autoRotate autoRotateSpeed={0.5} enableDamping dampingFactor={0.05} />
          </Canvas>
        </div>
      )}
    </div>
  );
}
