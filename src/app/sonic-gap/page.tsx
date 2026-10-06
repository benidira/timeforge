import { SonicGapBridgeTool } from "@/components/tools/sonic-gap-bridge-tool";

export const metadata = {
  title: "Sonic-Gap Bridge | Castov",
  description: "Air-Gapped Ultrasonic Acoustic Data Transfer Protocol.",
};

export default function SonicGapPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <SonicGapBridgeTool />
    </div>
  );
}
