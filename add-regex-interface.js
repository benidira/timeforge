const fs = require('fs');
let code = fs.readFileSync('src/components/tool-interface.tsx', 'utf-8');
if (!code.includes('RegexExplainerTool')) {
  code = code.replace(
    'import { SqliteFiddleTool } from "./tools/sqlite-fiddle-tool";',
    'import { SqliteFiddleTool } from "./tools/sqlite-fiddle-tool";\nimport { RegexExplainerTool } from "./tools/regex-explainer-tool";'
  );
  code = code.replace(
    'case "sqlite-fiddle":\n      return <SqliteFiddleTool />;',
    'case "sqlite-fiddle":\n      return <SqliteFiddleTool />;\n    case "regex-explainer":\n      return <RegexExplainerTool />;'
  );
  fs.writeFileSync('src/components/tool-interface.tsx', code);
}
