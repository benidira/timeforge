const fs = require('fs');

const contentMap = {
  'timezone-simulator': {
    sections: '[\n      { heading: "Timezone Travel Simulator", paragraphs: ["When building global applications, you must test how your UI behaves when a user travels across timezones or when Daylight Saving Time (DST) kicks in.", "This simulator overrides your browser native Intl.DateTimeFormat and Date APIs, allowing you to instantly teleport your browser to any timezone on Earth without changing your operating system settings."] }\n    ]',
    howTo: '[\n      "Select a target timezone from the world map or dropdown.",\n      "Click Teleport Browser.",\n      "Interact with your application in another tab; all JavaScript Date functions will behave as if you are physically in that timezone."\n    ]',
    faq: '[\n      { q: "Does this affect other browser tabs?", a: "No, the override is isolated to the current Service Worker scope or injected script execution context." }\n    ]'
  },
  'env-vault': {
    sections: '[\n      { heading: "Zero-Knowledge .env Vault", paragraphs: ["Sharing .env files over Slack or email is a massive security risk. The Zero-Knowledge .env Vault allows you to encrypt environment variables in your browser.", "The data is encrypted using AES-GCM via the Web Crypto API. The server only stores the encrypted blob, and the decryption key remains entirely in the fragment of the URL, meaning our servers can never read your secrets."] }\n    ]',
    howTo: '[\n      "Paste your .env content into the vault.",\n      "The browser generates a strong AES key and encrypts the data locally.",\n      "Share the generated URL with your team.",\n      "When they open the URL, their browser extracts the key from the URL fragment and decrypts the payload locally."\n    ]',
    faq: '[\n      { q: "What happens if I lose the URL?", a: "The data is unrecoverable. Because the encryption key is never sent to the server, we cannot restore your access." }\n    ]'
  },
  'secret-scanner': {
    sections: '[\n      { heading: "Universal Secret Scanner", paragraphs: ["Committing API keys or AWS credentials to GitHub can cost thousands of dollars in minutes. The Universal Secret Scanner uses aggressive regex heuristics and Shannon entropy analysis to detect high-probability secrets in your code before you commit.", "It runs entirely in your browser using Web Workers, ensuring your proprietary code is never uploaded to an external server for analysis."] }\n    ]',
    howTo: '[\n      "Drag and drop a folder or file into the dropzone.",\n      "The Web Worker scans the files locally.",\n      "Review the list of flagged secrets, which are categorized by service (AWS, Stripe, GitHub, etc.) or high entropy.",\n      "Sanitize your files before committing."\n    ]',
    faq: '[\n      { q: "Can I configure custom regex patterns?", a: "Yes, you can add custom patterns in the settings panel to detect internal company tokens." }\n    ]'
  },
  'api-load-tester': {
    sections: '[\n      { heading: "Shadow API Load Tester", paragraphs: ["Stress testing usually requires complex CLI tools. The Shadow API Load Tester brings distributed load testing to the browser.", "By utilizing Web Workers and modern fetch APIs, it generates concurrent HTTP traffic against your staging environments to measure latency, throughput, and error rates in real-time with visual graphs."] }\n    ]',
    howTo: '[\n      "Enter the target API endpoint and HTTP method.",\n      "Configure headers, payload, and the number of concurrent virtual users (Workers).",\n      "Set the duration of the test.",\n      "Click Launch Test and monitor the live latency/throughput graphs."\n    ]',
    faq: '[\n      { q: "Is it safe to run against production?", a: "WARNING: This tool can generate significant traffic. Only run tests against endpoints you own and have permission to stress test." }\n    ]'
  },
  'docker-visualizer': {
    sections: '[\n      { heading: "Docker Architecture Visualizer", paragraphs: ["Understanding a complex microservices architecture from a docker-compose.yml file is tough.", "This tool parses your Docker Compose files and generates a beautiful, interactive node-graph visualization. It maps out services, networks, volumes, and port bindings, making it easy to spot isolated containers or misconfigured network bridges."] }\n    ]',
    howTo: '[\n      "Paste your docker-compose.yml content into the editor.",\n      "The tool instantly parses the YAML and renders a node graph.",\n      "Hover over nodes to see exposed ports and environment variables.",\n      "Drag nodes to rearrange the architectural layout."\n    ]',
    faq: '[\n      { q: "Does it support Docker Compose v3 syntax?", a: "Yes, it fully supports version 2, 3, and the latest Compose Specification." }\n    ]'
  }
};

let txt = fs.readFileSync('src/content/tools.ts', 'utf8');
for (const key of Object.keys(contentMap)) {
  const parts = txt.split(`slug: "${key}"`);
  if (parts.length > 1) {
    let block = parts[1];
    block = block.replace(/sections:\s*\[\]/, "sections: " + contentMap[key].sections);
    block = block.replace(/howTo:\s*\[\]/, "howTo: " + contentMap[key].howTo);
    block = block.replace(/faq:\s*\[\]/, "faq: " + contentMap[key].faq);
    parts[1] = block;
    txt = parts.join(`slug: "${key}"`);
    console.log("Updated: " + key);
  }
}
fs.writeFileSync('src/content/tools.ts', txt);
