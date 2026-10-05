const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

code = code.replace(
  /The Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Developer Toolkit<\/span>/g,
  'A Growing Collection of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Free Developer Tools</span>'
);

code = code.replace(/href="\/tools\/sqlite-fiddle"/g, 'href="/sqlite-fiddle"');
code = code.replace(/href="\/tools\/docker-visualizer"/g, 'href="/docker-visualizer"');
code = code.replace(/href="\/tools\/secret-scanner"/g, 'href="/secret-scanner"');

fs.writeFileSync('src/app/page.tsx', code);
