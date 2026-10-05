"use client";
import dynamic from "next/dynamic";

export const RegexExplainerTool = dynamic(
  () => import("./regex-explainer-tool").then((mod) => mod.RegexExplainerTool),
  { ssr: false, loading: () => <div className="p-8 text-center text-muted font-mono animate-pulse">Loading Regex Parser Engine...</div> }
);
