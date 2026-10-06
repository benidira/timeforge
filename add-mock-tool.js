const fs = require('fs');
let txt = fs.readFileSync('src/content/tools.ts', 'utf8');

if (!txt.includes('fetch-mock-generator')) {
  txt = txt.replace('  | "sqlite-fiddle"', '  | "sqlite-fiddle"\n  | "fetch-mock-generator"');
  
  const mockTool = `
  {
    slug: "fetch-mock-generator",
    category: "Developer",
    name: "Service Worker API Mocker",
    seoTitle: "Local API Mock Server Generator | Castov",
    metaDescription: "Generate a zero-server fetch interceptor script to mock API endpoints directly in your browser.",
    intro: "Stop writing custom mock backends. Define your API JSON responses here and generate a secure injection script that mocks fetch calls instantly in your browser.",
    cardDescription: "Generate local fetch interceptor scripts to mock API endpoints.",
    faq: [{q:"Do I need a Node.js server?", a:"No, this runs a monkey-patch on window.fetch directly in your browser."}],
    related: [],
    sections: [{heading: "Local API Mocking", paragraphs: ["Intercept fetch calls without a backend."]}],
    howTo: ["Define your routes", "Copy the script", "Paste into your browser console or layout file."]
  },`;
  
  txt = txt.replace('export const TOOLS: Tool[] = [', 'export const TOOLS: Tool[] = [\n' + mockTool);
  fs.writeFileSync('src/content/tools.ts', txt);
  console.log('Added fetch-mock-generator');
}
