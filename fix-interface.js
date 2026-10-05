const fs = require('fs');
let code = fs.readFileSync('src/components/tool-interface.tsx', 'utf-8');
code = code.replace(
  /import dynamic from "next\/dynamic";\s*const RegexExplainerTool = dynamic\(\(\) => import\("\.\/tools\/regex-explainer-tool"\)\.then\(\(m\) => m\.RegexExplainerTool\), \{ ssr: false \}\);/g,
  'import { RegexExplainerTool } from "./tools/regex-explainer-dynamic";'
);
fs.writeFileSync('src/components/tool-interface.tsx', code);
