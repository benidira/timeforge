const fs = require('fs');
let code = fs.readFileSync('src/content/tools.ts', 'utf-8');

if (!code.includes('"regex-explainer"')) {
  code = code.replace('| "sqlite-fiddle";', '| "sqlite-fiddle"\n  | "regex-explainer";');

  const regexExplainerConfig = `  {
    slug: "regex-explainer",
    category: "Developer",
    name: "Regex Explainer",
    seoTitle: "Regex Explainer & Interactive AST Visualizer | Castov",
    metaDescription: "Deconstruct, explain, and test Regular Expressions in real-time with an interactive AST breakdown and zero-latency client-side processing.",
    intro: "Deconstruct, explain, and test Regular Expressions in real-time.",
    cardDescription: "Parse, visualize and test regex with a detailed AST breakdown.",
    sections: [
      {
        heading: "How Regex Explainer Works",
        paragraphs: [
          "This tool parses your regular expression into an Abstract Syntax Tree (AST) entirely in your browser.",
          "It highlights and explains each component of your expression and provides real-time matching against your test text."
        ]
      }
    ],
    howTo: [
      "Enter your Regular Expression.",
      "Enter your test string to match against.",
      "View the matching execution and the detailed tree breakdown."
    ],
    faq: [
      {
        question: "Is my data sent to a server?",
        answer: "No, all parsing and matching is done 100% locally in your browser for zero latency and privacy."
      }
    ],
    related: ["cron-generator", "env-vault"]
  }
];`;

  code = code.replace(/];\s*$/g, regexExplainerConfig);
  fs.writeFileSync('src/content/tools.ts', code);
}
