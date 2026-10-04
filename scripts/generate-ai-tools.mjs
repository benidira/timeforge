import fs from 'fs';
import path from 'path';

const tools = [
  { slug: 'cursorrules-generator', name: '.cursorrules Generator', category: 'prompts' },
  { slug: 'claude-system-prompt-builder', name: 'Claude System Prompt Builder', category: 'prompts' },
  { slug: 'gpt4o-system-prompt-generator', name: 'GPT-4o System Prompt Generator', category: 'prompts' },
  { slug: 'copilot-instructions-generator', name: 'Copilot Instructions Generator', category: 'prompts' },
  { slug: 'windsurf-rules-generator', name: 'Windsurf Rules Generator', category: 'prompts' },
  { slug: 'few-shot-prompt-formatter', name: 'Few-Shot Prompt Formatter', category: 'prompts' },
  { slug: 'chain-of-thought-prompt-builder', name: 'Chain of Thought Prompt Builder', category: 'prompts' },
  { slug: 'ai-agent-persona-designer', name: 'AI Agent Persona Designer', category: 'prompts' },
  { slug: 'ollama-modelfile-builder', name: 'Ollama Modelfile Builder', category: 'local-llm' },
  { slug: 'gguf-vram-estimator', name: 'GGUF VRAM Estimator', category: 'local-llm' },
  { slug: 'vllm-config-generator', name: 'vLLM Config Generator', category: 'local-llm' },
  { slug: 'context-window-memory-calculator', name: 'Context Window Memory Calculator', category: 'local-llm' },
  { slug: 'huggingface-modelcard-generator', name: 'HuggingFace Modelcard Generator', category: 'local-llm' },
  { slug: 'openwebui-pipeline-configurator', name: 'OpenWebUI Pipeline Configurator', category: 'local-llm' },
  { slug: 'llm-api-cost-calculator', name: 'LLM API Cost Calculator', category: 'calculators' },
  { slug: 'repo-token-estimator', name: 'Repo Token Estimator', category: 'calculators' },
  { slug: 'embedding-cost-calculator', name: 'Embedding Cost Calculator', category: 'calculators' },
  { slug: 'fine-tuning-cost-estimator', name: 'Fine-Tuning Cost Estimator', category: 'calculators' },
  { slug: 'rag-chunk-size-calculator', name: 'RAG Chunk Size Calculator', category: 'calculators' },
  { slug: 'llm-latency-benchmark-calculator', name: 'LLM Latency Benchmark Calculator', category: 'calculators' },
  { slug: 'json-schema-tool-calling-generator', name: 'JSON Schema Tool Calling Generator', category: 'schemas' },
  { slug: 'pydantic-structured-output-builder', name: 'Pydantic Structured Output Builder', category: 'schemas' },
  { slug: 'vercel-ai-sdk-code-generator', name: 'Vercel AI SDK Code Generator', category: 'schemas' },
  { slug: 'langchain-boilerplate-builder', name: 'Langchain Boilerplate Builder', category: 'schemas' },
  { slug: 'mcp-config-builder', name: 'MCP Config Builder', category: 'schemas' },
  { slug: 'rest-api-to-ai-tool-converter', name: 'REST API to AI Tool Converter', category: 'schemas' },
  { slug: 'ai-guardrails-configurator', name: 'AI Guardrails Configurator', category: 'evals' },
  { slug: 'prompt-markdown-json-escaper', name: 'Prompt Markdown JSON Escaper', category: 'evals' },
  { slug: 'jsonl-dataset-formatter', name: 'JSONL Dataset Formatter', category: 'evals' },
  { slug: 'llm-eval-rubric-generator', name: 'LLM Eval Rubric Generator', category: 'evals' },
];

const generateData = tools.map(t => ({
  slug: t.slug,
  name: t.name,
  category: t.category,
  description: `Professional, enterprise-grade ${t.name} for AI developers. Generate, configure, and optimize seamlessly.`,
  keywords: [t.name.toLowerCase(), t.category, 'ai developer tool', 'castov', 'timeforge'],
  inputs: [
    { name: 'framework', label: 'Framework / Model', type: 'text', placeholder: 'e.g., GPT-4o, Claude 3.5 Sonnet' },
    { name: 'context', label: 'Context & Requirements', type: 'textarea', placeholder: 'Describe your specific requirements here...' }
  ],
  pseoContent: {
    h2: `How to use the ${t.name}`,
    content: `The ${t.name} is designed to streamline your AI development workflow. Simply enter your requirements in the form above to generate optimized configurations instantly.`
  }
}));

const targetPath = path.join(process.cwd(), 'src/data/ai-tools.json');
fs.mkdirSync(path.dirname(targetPath), { recursive: true });
fs.writeFileSync(targetPath, JSON.stringify(generateData, null, 2));
console.log('Successfully generated src/data/ai-tools.json');
