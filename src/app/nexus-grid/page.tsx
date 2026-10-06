import { NexusGridTool } from "@/components/tools/nexus-grid-tool";

export const metadata = {
  title: "Castov NexusGrid | Decentralized WebGPU Supercomputer",
  description: "Pool your idle browser GPU power to train AI models locally using WebGPU and WebRTC P2P networks.",
};

export default function NexusGridPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <NexusGridTool />
    </div>
  );
}
