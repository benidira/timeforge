import { TOOLS } from './src/content/tools';

let emptyCount = 0;
TOOLS.forEach(tool => {
  if (tool.sections.length === 0) {
    console.log(`Tool ${tool.slug} has NO sections.`);
    emptyCount++;
  } else if (tool.sections[0].paragraphs.length === 0 || tool.sections[0].paragraphs[0].trim() === '') {
    console.log(`Tool ${tool.slug} has EMPTY sections.`);
    emptyCount++;
  }
  
  if (tool.howTo.length === 0 || tool.howTo[0].trim() === '') {
    console.log(`Tool ${tool.slug} has EMPTY howTo.`);
  }
  
  if (tool.faq.length === 0) {
    console.log(`Tool ${tool.slug} has NO faq.`);
  }
});

console.log(`Total tools with empty sections: ${emptyCount}`);
