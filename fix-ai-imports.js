const fs = require('fs');
const f = 'src/app/ai/[slug]/page.tsx';
let content = fs.readFileSync(f, 'utf8');
content = content.replace(/import \{ ClaudeSystemPromptBuilder \} from "@\/components\/ai-tools\/ClaudeSystemPromptBuilder";/g, 'import { ClaudeSystemPromptBuilder } from "@/components/ai-tools/claude-system-prompt-builder";');
content = content.replace(/import \{ VercelAiSdkGenerator \} from "@\/components\/ai-tools\/VercelAiSdkGenerator";/g, 'import { VercelAiSdkGenerator } from "@/components/ai-tools/vercel-ai-sdk-generator";');
fs.writeFileSync(f, content);
