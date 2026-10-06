const fs = require('fs');
const txt = fs.readFileSync('src/content/tools.ts', 'utf8');
const blocks = txt.split('slug:').slice(1);
const empties = [];
blocks.forEach(b => {
  const nameMatch = b.match(/name:\s*['"](.*?)['"]/);
  if (nameMatch && (b.includes('sections: []') || b.includes('howTo: []') || b.includes('faq: []'))) {
    empties.push(nameMatch[1]);
  }
});
console.log('Empty tools: ' + empties.length);
console.log(empties.join('\n'));
