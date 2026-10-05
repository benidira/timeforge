const fs = require('fs');
let code = fs.readFileSync('src/components/tool-interface.tsx', 'utf-8');

// If we already added standard import, remove it and add dynamic import
code = code.replace(
  'import { RegexExplainerTool } from "./tools/regex-explainer-tool";',
  'import dynamic from "next/dynamic";\nconst RegexExplainerTool = dynamic(() => import("./tools/regex-explainer-tool").then((m) => m.RegexExplainerTool), { ssr: false });'
);

fs.writeFileSync('src/components/tool-interface.tsx', code);
