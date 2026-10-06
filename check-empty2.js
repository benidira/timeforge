const fs = require('fs');
const txt = fs.readFileSync('src/content/tools.ts', 'utf8');
const blocks = txt.split('slug:').slice(1);
blocks.forEach(b => {
  const slugMatch = b.match(/^\s*['"](.*?)['"]/);
  if (slugMatch && (b.includes('sections: []') || b.includes('howTo: []') || b.includes('faq: []'))) {
    console.log(slugMatch[1]);
  }
});
