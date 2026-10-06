import { ChronoStateDbTool } from "@/components/tools/chrono-state-db-tool";

export const metadata = {
  title: "Chrono-State DB | Castov",
  description: "Local-First Git-Versioned NoSQL Database Simulator.",
};

export default function ChronoDbPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <ChronoStateDbTool />
    </div>
  );
}
