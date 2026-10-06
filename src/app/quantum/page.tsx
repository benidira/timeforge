import { QuantumSimulatorTool } from "@/components/tools/quantum-simulator-tool";

export const metadata = {
  title: "Quantum Web Simulator | Castov",
  description: "Browser-Native Quantum Circuit execution via Matrix Tensors.",
};

export default function QuantumPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <QuantumSimulatorTool />
    </div>
  );
}
