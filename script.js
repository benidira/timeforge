const fs = require('fs');

let c1 = fs.readFileSync('src/components/tool-interface.tsx', 'utf8');
c1 = c1.replace(
  'import { FetchMockGeneratorTool } from "./tools/fetch-mock-generator-tool";',
  'import { FetchMockGeneratorTool } from "./tools/fetch-mock-generator-tool";\nimport { JsonToTsTool } from "./tools/json-to-ts-tool";\nimport { DiffCheckerTool } from "./tools/diff-checker-tool";'
);
c1 = c1.replace(
  'case "json-viewer":\n      return <JsonViewerTool />;',
  'case "json-viewer":\n      return <JsonViewerTool />;\n    case "json-to-ts":\n      return <JsonToTsTool />;\n    case "diff-checker":\n      return <DiffCheckerTool />;'
);
fs.writeFileSync('src/components/tool-interface.tsx', c1);

let c2 = fs.readFileSync('src/content/tools.ts', 'utf8');
c2 = c2.replace(
  '  | "json-viewer";',
  '  | "json-viewer"\n  | "json-to-ts"\n  | "diff-checker";'
);

const nt = 
  {
    slug: "json-to-ts",
    category: "Developer",
    name: "JSON to TypeScript",
    seoTitle: "JSON to TypeScript Interfaces Converter",
    metaDescription: "Instantly convert JSON objects into TypeScript interfaces.",
    intro: "Paste your JSON and get strictly typed TypeScript interfaces.",
    cardDescription: "Convert JSON strings to TypeScript interfaces.",
    faq: [],
    related: [],
    sections: [],
    howTo: []
  },
  {
    slug: "diff-checker",
    category: "Developer",
    name: "Diff Checker",
    seoTitle: "Online Text Diff Checker",
    metaDescription: "Compare two pieces of text or code and see the differences.",
    intro: "Check differences line by line between original and modified text.",
    cardDescription: "Compare text or code line by line.",
    faq: [],
    related: [],
    sections: [],
    howTo: []
  },
;

c2 = c2.replace('export const TOOLS: Tool[] = [', 'export const TOOLS: Tool[] = [' + nt);
fs.writeFileSync('src/content/tools.ts', c2);
