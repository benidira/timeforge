const fs = require('fs');

const contentMap = {
  "p2p-ghost-tunnel": {
    sections: '[\n      { heading: "What is P2P Ghost Tunnel?", paragraphs: ["P2P Ghost Tunnel establishes a direct, encrypted WebRTC connection between your browser and another device, entirely bypassing centralized servers. It\'s designed for transferring logs, sensitive payloads, or securely chatting without leaving a trace.", "Because the signaling relies on a minimal exchange of ICE candidates (which can be done manually or via a temporary signaling channel), the resulting connection is strictly peer-to-peer."] }\n    ]',
    howTo: '[\n      "Generate an Offer from Device A and copy the SDP string.",\n      "Paste the Offer into Device B to generate an Answer.",\n      "Copy the Answer back to Device A to establish the connection.",\n      "Once connected, start sending encrypted data or files."\n    ]',
    faq: '[\n      { q: "Is the data routed through Castov servers?", a: "No. All data flows directly between peers using WebRTC data channels. We do not use any TURN/STUN servers that intercept data." },\n      { q: "What happens if both devices are behind strict NATs?", a: "Direct connection might fail without a TURN server. Currently, this tool requires at least one peer to have permissive NAT traversal or use a local network." }\n    ]'
  },
  "steganography-env-vault": {
    sections: '[\n      { heading: "Steganography in Environment Variables", paragraphs: ["Steganography Env Vault allows you to take sensitive .env variables (like database URIs, API keys, and secret tokens) and hide them inside the least significant bits of an ordinary PNG image.", "This technique provides \'plausible deniability\' and extreme security. An attacker who breaches your repository or local drive will only see a standard image file, completely unaware that it contains encrypted configuration data."] }\n    ]',
    howTo: '[\n      "Select a carrier image (PNG format recommended) from your computer.",\n      "Paste your raw .env file contents into the input field.",\n      "Set a strong master password (this will be used to encrypt the data before hiding it).",\n      "Click \'Encode and Download\' to get your new, secret-bearing image.",\n      "To decode, upload the modified image and provide the same password."\n    ]',
    faq: '[\n      { q: "Does the image look different after hiding data?", a: "No. The changes are made to the least significant bits of the image\'s color channels, which is completely imperceptible to the human eye." },\n      { q: "Can I use JPEG images?", a: "No. JPEG uses lossy compression, which will destroy the hidden data. Always use lossless formats like PNG." }\n    ]'
  },
  "3d-json-galaxy": {
    sections: '[\n      { heading: "Navigating JSON in 3D", paragraphs: ["The Holographic JSON Explorer parses massive JSON datasets and visualizes them using Three.js and WebGL. Instead of endless scrolling, you can literally fly through your data.", "Objects are represented as planets or nodes, and arrays form orbital rings or constellations. This spatial representation helps engineers quickly identify deep nesting, circular references, and structural anomalies."] }\n    ]',
    howTo: '[\n      "Upload or paste a large JSON payload into the editor.",\n      "Click \'Launch Galaxy\' to render the 3D visualization.",\n      "Use your mouse to rotate (click and drag) and zoom (scroll wheel).",\n      "Click on specific nodes to see their corresponding JSON keys and values in the side panel."\n    ]',
    faq: '[\n      { q: "Is my JSON uploaded to generate the 3D model?", a: "No. The parsing and 3D rendering are handled entirely by your GPU and browser using WebGL." },\n      { q: "What is the performance limit?", a: "It depends on your graphics card. Modern GPUs can handle tens of thousands of nodes smoothly." }\n    ]'
  },
  "regex-genetic-evolution": {
    sections: '[\n      { heading: "Genetic Algorithms for Regex", paragraphs: ["Writing the perfect Regular Expression often involves tedious trial and error. The Genetic Regex Auto-Healer automates this by applying evolutionary algorithms to \'breed\' the perfect regex.", "You provide positive test cases (strings that must match) and negative test cases (strings that must not match). The engine randomly mutates an initial pattern, scores the offspring based on accuracy, and evolves them over generations until it finds a pattern that passes all tests."] }\n    ]',
    howTo: '[\n      "Enter a list of strings that the regex MUST match (Target Matches).",\n      "Enter a list of strings that the regex MUST NOT match (Anti-Matches).",\n      "Provide an optional starting regex (or let the engine start from scratch).",\n      "Click \'Evolve\' and watch the engine iterate through generations to find the perfect pattern."\n    ]',
    faq: '[\n      { q: "Is this guaranteed to find the best regex?", a: "Not necessarily the most human-readable one, but it will find a mathematically valid regex that satisfies your strict constraints." }\n    ]'
  },
  "api-time-machine": {
    sections: '[\n      { heading: "Chrono-Debug API Replay", paragraphs: ["Testing API idempotency and timing issues is notoriously difficult. The Chrono-Debug API Replay acts as a local proxy that intercepts your HTTP requests and allows you to artificially alter their timing, latency, and order.", "By simulating network conditions from \'the past\' or delaying requests into \'the future\', you can uncover race conditions and state-mutation bugs in your frontend applications."] }\n    ]',
    howTo: '[\n      "Configure your frontend to route API calls through the local proxy endpoint provided.",\n      "Record a sequence of API calls.",\n      "Use the timeline interface to drag requests, altering their latency and arrival order.",\n      "Replay the sequence to observe how your application handles the mutated timing."\n    ]',
    faq: '[\n      { q: "Do I need to install a desktop app for this?", a: "No, this uses Service Workers to intercept fetch requests directly within your browser session." }\n    ]'
  },
  "ast-conflict-telepathy": {
    sections: '[\n      { heading: "AST Conflict Telepathy", paragraphs: ["Git merge conflicts in complex JavaScript/TypeScript files are a nightmare. Standard text-based merging doesn\'t understand code syntax.", "AST Conflict Telepathy parses the conflicting files into Abstract Syntax Trees (AST). It then compares the actual logical intent of the code (e.g., variable renames, moved functions) and resolves conflicts syntactically rather than line-by-line."] }\n    ]',
    howTo: '[\n      "Paste \'Branch A\' code into the left editor.",\n      "Paste \'Branch B\' code into the right editor.",\n      "The tool generates a visual AST diff.",\n      "Select logical nodes to keep or discard, and export the perfectly merged file."\n    ]',
    faq: '[\n      { q: "What languages are supported?", a: "Currently, AST parsing is supported for JavaScript, TypeScript, and JSON." }\n    ]'
  },
  "timezone-travel-simulator": {
    sections: '[\n      { heading: "Timezone Travel Simulator", paragraphs: ["When building global applications, you must test how your UI behaves when a user travels across timezones or when Daylight Saving Time (DST) kicks in.", "This simulator overrides your browser\'s native Intl.DateTimeFormat and Date APIs, allowing you to instantly \'teleport\' your browser to any timezone on Earth without changing your operating system settings."] }\n    ]',
    howTo: '[\n      "Select a target timezone from the world map or dropdown.",\n      "Click \'Teleport Browser\'.",\n      "Interact with your application in another tab; all JavaScript Date functions will behave as if you are physically in that timezone."\n    ]',
    faq: '[\n      { q: "Does this affect other browser tabs?", a: "No, the override is isolated to the current Service Worker scope or injected script execution context." }\n    ]'
  },
  "universal-config-sync": {
    sections: '[\n      { heading: "Universal Config Sync", paragraphs: ["Managing formatting tools across teams is chaos. Prettier, ESLint, EditorConfig, and TSConfig often conflict.", "Universal Config Sync analyzes your repository\'s existing configuration files and automatically generates a unified, conflict-free setup. It highlights contradictory rules (e.g., Prettier wanting single quotes while ESLint demands double quotes) and resolves them based on industry best practices."] }\n    ]',
    howTo: '[\n      "Upload or paste your package.json and existing config files.",\n      "The tool analyzes the AST of your configs.",\n      "Review the highlighted conflicts in the dashboard.",\n      "Download the unified, normalized configuration bundle."\n    ]',
    faq: '[\n      { q: "Does it support custom ESLint plugins?", a: "Yes, it cross-references standard plugin rulesets to prevent collisions." }\n    ]'
  },
  "zero-knowledge-env-vault": {
    sections: '[\n      { heading: "Zero-Knowledge .env Vault", paragraphs: ["Sharing .env files over Slack or email is a massive security risk. The Zero-Knowledge .env Vault allows you to encrypt environment variables in your browser.", "The data is encrypted using AES-GCM via the Web Crypto API. The server only stores the encrypted blob, and the decryption key remains entirely in the fragment of the URL, meaning our servers can never read your secrets."] }\n    ]',
    howTo: '[\n      "Paste your .env content into the vault.",\n      "The browser generates a strong AES key and encrypts the data locally.",\n      "Share the generated URL with your team.",\n      "When they open the URL, their browser extracts the key from the URL fragment (#) and decrypts the payload locally."\n    ]',
    faq: '[\n      { q: "What happens if I lose the URL?", a: "The data is unrecoverable. Because the encryption key is never sent to the server, we cannot restore your access." }\n    ]'
  },
  "universal-secret-scanner": {
    sections: '[\n      { heading: "Universal Secret Scanner", paragraphs: ["Committing API keys or AWS credentials to GitHub can cost thousands of dollars in minutes. The Universal Secret Scanner uses aggressive regex heuristics and Shannon entropy analysis to detect high-probability secrets in your code before you commit.", "It runs entirely in your browser using Web Workers, ensuring your proprietary code is never uploaded to an external server for analysis."] }\n    ]',
    howTo: '[\n      "Drag and drop a folder or file into the dropzone.",\n      "The Web Worker scans the files locally.",\n      "Review the list of flagged secrets, which are categorized by service (AWS, Stripe, GitHub, etc.) or high entropy.",\n      "Sanitize your files before committing."\n    ]',
    faq: '[\n      { q: "Can I configure custom regex patterns?", a: "Yes, you can add custom patterns in the settings panel to detect internal company tokens." }\n    ]'
  },
  "shadow-api-load-tester": {
    sections: '[\n      { heading: "Shadow API Load Tester", paragraphs: ["Stress testing usually requires complex CLI tools. The Shadow API Load Tester brings distributed load testing to the browser.", "By utilizing Web Workers and modern fetch APIs, it generates concurrent HTTP traffic against your staging environments to measure latency, throughput, and error rates in real-time with visual graphs."] }\n    ]',
    howTo: '[\n      "Enter the target API endpoint and HTTP method.",\n      "Configure headers, payload, and the number of concurrent virtual users (Workers).",\n      "Set the duration of the test.",\n      "Click \'Launch Test\' and monitor the live latency/throughput graphs."\n    ]',
    faq: '[\n      { q: "Is it safe to run against production?", a: "WARNING: This tool can generate significant traffic. Only run tests against endpoints you own and have permission to stress test." }\n    ]'
  },
  "docker-architecture-visualizer": {
    sections: '[\n      { heading: "Docker Architecture Visualizer", paragraphs: ["Understanding a complex microservices architecture from a docker-compose.yml file is tough.", "This tool parses your Docker Compose files and generates a beautiful, interactive node-graph visualization. It maps out services, networks, volumes, and port bindings, making it easy to spot isolated containers or misconfigured network bridges."] }\n    ]',
    howTo: '[\n      "Paste your docker-compose.yml content into the editor.",\n      "The tool instantly parses the YAML and renders a node graph.",\n      "Hover over nodes to see exposed ports and environment variables.",\n      "Drag nodes to rearrange the architectural layout."\n    ]',
    faq: '[\n      { q: "Does it support Docker Compose v3 syntax?", a: "Yes, it fully supports version 2, 3, and the latest Compose Specification." }\n    ]'
  },
  "sqlite-fiddle": {
    sections: '[\n      { heading: "In-Browser SQLite Fiddle", paragraphs: ["Testing SQL queries usually requires spinning up a local database or using a heavy IDE. The In-Browser SQLite Fiddle compiles the SQLite engine to WebAssembly (WASM), allowing it to run at near-native speeds directly in your browser.", "You can create tables, insert data, run complex joins, and export the database as a binary file—all without any backend server."] }\n    ]',
    howTo: '[\n      "Write your SQL commands (CREATE TABLE, INSERT, SELECT) in the Monaco editor.",\n      "Click \'Execute\' to run the queries against the local WASM database.",\n      "View the tabular results below.",\n      "Use \'Export DB\' to download your database state as a .sqlite file."\n    ]',
    faq: '[\n      { q: "Is the data saved when I refresh the page?", a: "No, the database runs in memory. If you refresh, all data is lost. Make sure to export your DB if you want to keep it." },\n      { q: "Can I load an existing database?", a: "Yes, use the \'Import DB\' feature to load an existing .sqlite file into the WASM engine." }\n    ]'
  }
};

let raw = fs.readFileSync("src/content/tools.ts", "utf8");

for (const [slug, data] of Object.entries(contentMap)) {
  const slugRegex = new RegExp("(slug:\\s*[\"']" + slug + "[\"'][\\s\\S]*?faq:\\s*)\\[\\],?\\s*(related:\\s*\\[.*?\\])?,?\\s*(sections:\\s*)\\[\\],?\\s*(howTo:\\s*)\\[\\]");
  
  if (slugRegex.test(raw)) {
    raw = raw.replace(slugRegex, (match, p1, p2, p3, p4) => {
      const relatedPart = p2 ? p2 + ',' : 'related: [],';
      return p1 + data.faq + ", " + relatedPart + " " + p3 + data.sections + ", " + p4 + data.howTo;
    });
  } else {
    console.log("Could not match format for: " + slug);
  }
}

fs.writeFileSync("src/content/tools.ts", raw);
console.log("Update completed.");
