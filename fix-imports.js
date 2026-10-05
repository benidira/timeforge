const fs = require('fs');
const files = [
  'src/components/ai-tools/claude-system-prompt-builder.tsx',
  'src/components/ai-tools/vercel-ai-sdk-generator.tsx',
  'src/components/key-vault-modal.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  content = content.replace(/import \{ useKeyManager \} from "@\/context\/KeyManagerContext";/g, 'import { useKeyManager } from "@/context/key-manager-context";');
  fs.writeFileSync(f, content);
});
