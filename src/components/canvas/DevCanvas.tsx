"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { InputNode, JsonNode, OutputNode, Base64EncodeNode, Base64DecodeNode, RegexNode } from "./nodes/CanvasNodes";

const nodeTypes = {
  inputNode: InputNode,
  jsonNode: JsonNode,
  outputNode: OutputNode,
  base64EncodeNode: Base64EncodeNode,
  base64DecodeNode: Base64DecodeNode,
  regexNode: RegexNode,
};

const initialNodes: Node[] = [
  {
    id: "node-input-1",
    type: "inputNode",
    position: { x: 50, y: 150 },
    data: { value: 'user_email: dev@example.com\nsecret_token: c29tZSBzZWNyZXQgdGV4dA==' },
  },
  {
    id: "node-regex-1",
    type: "regexNode",
    position: { x: 400, y: 50 },
    data: { value: null, pattern: '[a-zA-Z0-9+/]{20,}={0,2}', error: false },
  },
  {
    id: "node-base64-decode",
    type: "base64DecodeNode",
    position: { x: 750, y: 50 },
    data: { value: null, error: false },
  },
  {
    id: "node-output-1",
    type: "outputNode",
    position: { x: 1100, y: 150 },
    data: { value: "" },
  },
];

const initialEdges: Edge[] = [
  { id: "e-in-reg", source: "node-input-1", target: "node-regex-1", animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: "e-reg-b64", source: "node-regex-1", target: "node-base64-decode", animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: "e-b64-out", source: "node-base64-decode", target: "node-output-1", animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
];

export default function DevCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Hook input changes up
  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.type === "inputNode") {
          return {
            ...n,
            data: {
              ...n.data,
              onChange: (val: string) => {
                setNodes((currentNds) =>
                  currentNds.map((cn) =>
                    cn.id === n.id ? { ...cn, data: { ...cn.data, value: val } } : cn
                  )
                );
              },
            },
          };
        }
        return n;
      })
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Data Propagation Loop
  useEffect(() => {
    let changed = false;
    const newNodes = nodes.map((node) => {
      // Find what feeds into this node
      const incomingEdges = edges.filter((e) => e.target === node.id);
      if (incomingEdges.length === 0) return node;

      const sourceNode = nodes.find((n) => n.id === incomingEdges[0].source);
      if (!sourceNode) return node;

      const sourceVal = sourceNode.data.value;

      if (node.type === "jsonNode") {
        try {
          if (typeof sourceVal === 'string' && sourceVal.trim().length > 0) {
            const parsed = JSON.parse(sourceVal);
            const formatted = JSON.stringify(parsed, null, 2);
            if (node.data.value !== formatted) {
              changed = true;
              return { ...node, data: { ...node.data, value: formatted, error: false } };
            }
          } else {
            if (node.data.value !== "") {
              changed = true;
              return { ...node, data: { ...node.data, value: "", error: false } };
            }
          }
        } catch {
          if (!node.data.error) {
            changed = true;
            return { ...node, data: { ...node.data, value: "Invalid JSON", error: true } };
          }
        }
      }

      if (node.type === "base64EncodeNode") {
        try {
          if (typeof sourceVal === 'string') {
            const encoded = btoa(sourceVal);
            if (node.data.value !== encoded) {
              changed = true;
              return { ...node, data: { ...node.data, value: encoded, error: false } };
            }
          }
        } catch {
          if (!node.data.error) { changed = true; return { ...node, data: { ...node.data, value: "", error: true } }; }
        }
      }

      if (node.type === "base64DecodeNode") {
        try {
          if (typeof sourceVal === 'string') {
            const decoded = atob(sourceVal);
            if (node.data.value !== decoded) {
              changed = true;
              return { ...node, data: { ...node.data, value: decoded, error: false } };
            }
          }
        } catch {
          if (!node.data.error) { changed = true; return { ...node, data: { ...node.data, value: "Invalid Base64", error: true } }; }
        }
      }

      if (node.type === "regexNode") {
        try {
          if (typeof sourceVal === 'string' && typeof node.data.pattern === 'string' && node.data.pattern) {
            const re = new RegExp(node.data.pattern, 'g');
            const matches = [...sourceVal.matchAll(re)].map(m => m[0]);
            const formatted = matches.join('\n');
            if (node.data.value !== formatted) {
              changed = true;
              return { ...node, data: { ...node.data, value: formatted, error: false } };
            }
          } else {
             if (node.data.value !== "") { changed = true; return { ...node, data: { ...node.data, value: "", error: false } }; }
          }
        } catch {
          if (!node.data.error) { changed = true; return { ...node, data: { ...node.data, value: "Invalid Regex", error: true } }; }
        }
      }

      if (node.type === "outputNode") {
        if (node.data.value !== sourceVal) {
          changed = true;
          return { ...node, data: { ...node.data, value: sourceVal } };
        }
      }

      return node;
    });

    if (changed) {
      setNodes(newNodes);
    }
  }, [nodes, edges, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } }, eds)),
    [setEdges],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      fitView
      className="bg-bg"
    >
      <Controls className="bg-card border-line fill-fg text-fg" />
      <MiniMap nodeStrokeWidth={3} className="bg-card" nodeColor="#3f3f46" maskColor="rgba(0,0,0,0.2)" />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="rgba(255,255,255,0.1)" />
    </ReactFlow>
  );
}
