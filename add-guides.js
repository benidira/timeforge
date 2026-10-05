const fs = require('fs');
let code = fs.readFileSync('src/content/guides.ts', 'utf-8');

// Update GuideSlug
code = code.replace(
  '| "cron-expressions-explained";',
  '| "cron-expressions-explained"\n  | "understanding-regex-ast"\n  | "mastering-docker-compose";'
);

// New guides
const newGuides = `
  {
    slug: "understanding-regex-ast",
    name: "Understanding Regex AST",
    seoTitle: "Regex AST (Abstract Syntax Tree) Explained | Castov",
    metaDescription: "Learn how Regular Expressions are parsed into Abstract Syntax Trees (AST) under the hood and how visualizers can help you write better patterns.",
    summary: "Regular Expressions are notoriously hard to read. By breaking them down into an Abstract Syntax Tree (AST), developers can easily debug, understand, and optimize complex patterns.",
    readingMinutes: 4,
    tools: ["regex-explainer"],
    sections: [
      {
        heading: "What is an Abstract Syntax Tree?",
        paragraphs: [
          "An Abstract Syntax Tree (AST) is a tree representation of the abstract syntactic structure of source code written in a programming language. In the context of Regular Expressions, an AST breaks down a dense string of characters like ^[a-z]+$ into logical, nested nodes.",
          "Instead of trying to parse the string visually, an AST separates the pattern into Anchors, Quantifiers, Character Classes, and Groups."
        ]
      },
      {
        heading: "Why Visualize Regex?",
        paragraphs: [
          "When you write a regex for an email validator, it might look like a random jumble of symbols. A visualizer maps each symbol to its English equivalent, ensuring that your pattern actually does what you intended without catastrophic backtracking."
        ]
      }
    ]
  },
  {
    slug: "mastering-docker-compose",
    name: "Mastering Docker Compose",
    seoTitle: "Mastering Docker Compose Architecture | Castov",
    metaDescription: "A deep dive into visualizing and structuring complex microservices architectures using Docker Compose.",
    summary: "Docker Compose allows developers to define and run multi-container Docker applications. Understanding the network topology and service dependencies is critical for modern infrastructure.",
    readingMinutes: 5,
    tools: ["docker-visualizer"],
    sections: [
      {
        heading: "The Power of Infrastructure as Code",
        paragraphs: [
          "Docker Compose uses a YAML file to configure your application’s services, networks, and volumes. With a single command, you create and start all the services from your configuration.",
          "However, as applications grow, the docker-compose.yml file can become hundreds of lines long. Visualizing this file as a node graph helps teams instantly understand service dependencies (e.g., frontend depends on backend, backend depends on redis and postgres)."
        ]
      }
    ]
  },
`;

code = code.replace(
  'export const GUIDES: Guide[] = [',
  'export const GUIDES: Guide[] = [\n' + newGuides
);

fs.writeFileSync('src/content/guides.ts', code);
