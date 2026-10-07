import fs from 'fs';

let code = fs.readFileSync('src/content/guides.ts', 'utf8');

// 1. Inject Slugs
const newSlugs = [
  '"local-llms-webgpu-guide"',
  '"understanding-mcp-protocol"',
  '"zero-server-ai-privacy"',
  '"cursorrules-optimization"',
  '"advanced-prompt-engineering"'
];

code = code.replace(/export type GuideSlug =/, 'export type GuideSlug =\n  | ' + newSlugs.join('\n  | '));

// 2. Prepare new guide objects
const newGuidesStr = `
  {
    slug: "local-llms-webgpu-guide",
    name: "Running Local LLMs with WebGPU",
    seoTitle: "A Developer's Guide to Local LLMs via WebGPU | Castov",
    metaDescription: "Learn how to run massive AI models directly in your browser using WebGPU, WebAssembly (WASM), and the zero-server architecture.",
    summary: "Running Large Language Models locally is the next frontier of AI. By leveraging WebGPU, developers can run models like Llama 3 entirely in the browser, eliminating server costs and ensuring absolute data privacy.",
    readingMinutes: 6,
    tools: ["p2p-ghost-tunnel"],
    sections: [
      {
        heading: "The Rise of WebGPU in AI",
        paragraphs: [
          "Historically, running AI models required expensive cloud GPUs. With the introduction of WebGPU—a modern web API that provides low-level access to the device's graphics card—browsers can now execute highly parallel compute workloads natively.",
          "This changes everything. Instead of sending sensitive data to a server API, the user's browser downloads a quantized model (using formats like GGUF) and runs the inference locally."
        ]
      },
      {
        heading: "Memory Management & Quantization",
        paragraphs: [
          "A standard 7B parameter model requires around 14GB of RAM in 16-bit precision. To fit this into consumer devices, we use Quantization (reducing the precision of weights to 4-bit or even 1.58-bit). This drastically reduces the memory footprint, allowing powerful models to run seamlessly on a 4GB RAM laptop."
        ]
      }
    ]
  },
  {
    slug: "understanding-mcp-protocol",
    name: "Understanding MCP Protocol",
    seoTitle: "What is the Model Context Protocol (MCP)? | Castov",
    metaDescription: "A deep dive into the Model Context Protocol (MCP), explaining how it standardizes context injection for AI editors like Cursor and Claude Desktop.",
    summary: "The Model Context Protocol (MCP) is an open standard that allows developers to securely expose local resources, databases, and APIs to AI assistants. Learn how it turns isolated LLMs into context-aware agents.",
    readingMinutes: 5,
    tools: ["mcp-config-builder"],
    sections: [
      {
        heading: "What is MCP?",
        paragraphs: [
          "The Model Context Protocol (MCP) is to AI what USB-C is to hardware. It acts as a universal adapter that allows AI models to read from your local databases, search your GitHub repos, or query your Slack workspace securely without needing custom plugins for every app."
        ]
      },
      {
        heading: "How MCP Works Under the Hood",
        paragraphs: [
          "MCP uses a client-server architecture over standard transport layers (like stdio or SSE). The AI Editor (like Cursor or Claude) acts as the Client. You run a lightweight MCP Server locally that securely reads a specific database and streams the context back to the AI using a standardized JSON-RPC format."
        ]
      }
    ]
  },
  {
    slug: "cursorrules-optimization",
    name: "Optimizing .cursorrules",
    seoTitle: "How to Write the Perfect .cursorrules File | Castov",
    metaDescription: "Maximize your AI coding efficiency by crafting the ultimate .cursorrules file for context-aware code generation in the Cursor IDE.",
    summary: "AI code editors like Cursor are only as smart as the context they are given. A well-crafted .cursorrules file instructs the AI on your exact tech stack, architecture rules, and formatting preferences.",
    readingMinutes: 4,
    tools: ["cursorrules-generator"],
    sections: [
      {
        heading: "The Importance of Project Context",
        paragraphs: [
          "When you ask an AI to 'create a login component', it has thousands of ways to do it. Should it use React or Vue? Tailwind or CSS Modules? By placing a .cursorrules file in the root of your project, you constrain the AI's creativity to match your exact architectural guidelines."
        ]
      },
      {
        heading: "Anatomy of a Great Rule File",
        paragraphs: [
          "A perfect .cursorrules file includes three main sections: 1. The Stack (Next.js 15, App Router, TypeScript). 2. The UI Patterns (Tailwind, Lucide Icons, Shadcn UI). 3. The Anti-Patterns (NEVER use 'any', always use Server Actions over API routes)."
        ]
      }
    ]
  },
  {
    slug: "zero-server-ai-privacy",
    name: "The Zero-Server AI Era",
    seoTitle: "Zero-Server AI: The Ultimate Approach to Data Privacy | Castov",
    metaDescription: "Explore why zero-server architecture is the definitive solution for enterprise AI privacy, ensuring proprietary code never leaves your local machine.",
    summary: "Enterprise companies are terrified of pasting proprietary code into ChatGPT. Zero-Server AI solves this by bringing the LLM directly to the user's device, ensuring that sensitive data is processed 100% locally.",
    readingMinutes: 5,
    tools: ["env-vault"],
    sections: [
      {
        heading: "The Enterprise AI Dilemma",
        paragraphs: [
          "While APIs like OpenAI are incredibly powerful, they require you to send your data over the internet. For healthcare, finance, and deep tech companies, sending proprietary algorithms or PII to a third-party server is a massive security violation."
        ]
      },
      {
        heading: "Client-Side Processing",
        paragraphs: [
          "Zero-Server architecture shifts the compute paradigm. Instead of sending data to the server, we send the logic (the app) to the client. The browser downloads the necessary WASM modules and AI models, disconnects from the backend, and processes everything locally. It's the ultimate firewall."
        ]
      }
    ]
  },
  {
    slug: "advanced-prompt-engineering",
    name: "Advanced Prompt Patterns",
    seoTitle: "Advanced Prompt Engineering Patterns for Developers | Castov",
    metaDescription: "Move beyond simple prompts. Learn advanced engineering patterns like Chain-of-Thought, Few-Shot prompting, and React (Reasoning and Acting) loops.",
    summary: "Prompt engineering has evolved into a rigid software discipline. Master the architectural patterns of prompting to yield deterministic, high-quality code from unpredictable LLMs.",
    readingMinutes: 7,
    tools: ["vercel-ai-sdk-code-generator"],
    sections: [
      {
        heading: "Chain of Thought (CoT)",
        paragraphs: [
          "LLMs often fail at complex logic if asked to provide the final answer immediately. By adding the phrase 'Think step by step' or explicitly creating a <thinking> block, the model is forced to allocate computation to the reasoning process before writing the code, drastically reducing hallucinations."
        ]
      },
      {
        heading: "Few-Shot Formatting",
        paragraphs: [
          "If you need JSON output, don't just describe the JSON. Provide 3 exact examples of the input-output pairs. LLMs are pattern-matching engines; few-shot examples anchor their probability distribution, ensuring the output matches your schema perfectly."
        ]
      }
    ]
  },
`;

// Inject guides into the array
code = code.replace(/export const GUIDES: Guide\[\] = \[/, 'export const GUIDES: Guide[] = [\n' + newGuidesStr);

fs.writeFileSync('src/content/guides.ts', code);
console.log("Injected successfully!");
