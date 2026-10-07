import fs from 'fs';

let header = fs.readFileSync('src/components/site-header.tsx', 'utf8');
header = header.replace(/document\.dispatchEvent\(new KeyboardEvent\('keydown', \{ key: 'k', metaKey: true \}\)\)/g, "window.dispatchEvent(new CustomEvent('open-command-palette'))");
fs.writeFileSync('src/components/site-header.tsx', header);

let homeSearch = fs.readFileSync('src/components/home-search.tsx', 'utf8');
homeSearch = homeSearch.replace(/document\.dispatchEvent\(new KeyboardEvent\('keydown', \{ key: 'k', metaKey: true \}\)\)/g, "window.dispatchEvent(new CustomEvent('open-command-palette'))");
fs.writeFileSync('src/components/home-search.tsx', homeSearch);
