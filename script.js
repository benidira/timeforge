const fs = require('fs');
let content = fs.readFileSync('src/components/pseo/tool-host.tsx', 'utf8');

const dynamicImports = `
const P2pGhostTunnelTool = dynamic(
  () => import("@/components/tools/p2p-ghost-tunnel-tool").then((m) => m.P2pGhostTunnelTool as any),
  { ssr: false }
);
const SteganographyEnvVaultTool = dynamic(
  () => import("@/components/tools/steganography-env-vault-tool").then((m) => m.SteganographyEnvVaultTool as any),
  { ssr: false }
);
const ThreeJsonGalaxyTool = dynamic(
  () => import("@/components/tools/3d-json-galaxy-tool").then((m) => m.ThreeJsonGalaxyTool as any),
  { ssr: false }
);
const RegexGeneticEvolutionTool = dynamic(
  () => import("@/components/tools/regex-genetic-evolution-tool").then((m) => m.RegexGeneticEvolutionTool as any),
  { ssr: false }
);
const ApiTimeMachineTool = dynamic(
  () => import("@/components/tools/api-time-machine-tool").then((m) => m.ApiTimeMachineTool as any),
  { ssr: false }
);
const AstConflictTelepathyTool = dynamic(
  () => import("@/components/tools/ast-conflict-telepathy-tool").then((m) => m.AstConflictTelepathyTool as any),
  { ssr: false }
);
`;

const switchCases = `
    case "p2p-ghost-tunnel": return <P2pGhostTunnelTool />;
    case "steganography-env-vault": return <SteganographyEnvVaultTool />;
    case "3d-json-galaxy": return <ThreeJsonGalaxyTool />;
    case "regex-genetic-evolution": return <RegexGeneticEvolutionTool />;
    case "api-time-machine": return <ApiTimeMachineTool />;
    case "ast-conflict-telepathy": return <AstConflictTelepathyTool />;
`;

content = content.replace('const JsonViewerTool = dynamic(', dynamicImports + 'const JsonViewerTool = dynamic(');
content = content.replace('case "json-viewer":\n      return <JsonViewerTool />;', 'case "json-viewer":\n      return <JsonViewerTool />;\n' + switchCases);

fs.writeFileSync('src/components/pseo/tool-host.tsx', content);
