const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const allFiles = walk('src');
const fileNames = new Set(allFiles.map(f => f.replace(/\\/g, '/')));

let errors = [];

allFiles.forEach(file => {
  const normalizedFile = file.replace(/\\/g, '/');
  const content = fs.readFileSync(file, 'utf-8');
  // Match both static imports and dynamic imports
  const importRegex = /(?:from\s+|import\()(['"])([^'"]+)\1/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[2];
    
    let base = null;
    if (importPath.startsWith('@/')) {
      base = importPath.replace('@/', 'src/');
    } else if (importPath.startsWith('.')) {
      // Resolve relative to current file dir
      const dir = path.dirname(normalizedFile);
      base = path.join(dir, importPath).replace(/\\/g, '/');
    }

    if (base) {
      const possibleExtensions = ['.tsx', '.ts', '.js', '.jsx', '/index.tsx', '/index.ts', ''];
      
      let foundExact = false;
      let foundMismatch = null;

      for (const actual of fileNames) {
        for (const ext of possibleExtensions) {
          const testPath = base + ext;
          if (actual === testPath) {
            foundExact = true;
          } else if (actual.toLowerCase() === testPath.toLowerCase()) {
            foundMismatch = actual;
          }
        }
      }

      // If we didn't find exact but did find mismatch
      if (!foundExact && foundMismatch) {
        errors.push(`File: ${normalizedFile}\nImport: ${importPath}\nActual: ${foundMismatch}\n`);
      }
    }
  }
});

console.log('Errors:', errors.length ? errors.join('\n') : 'None found in imports');
