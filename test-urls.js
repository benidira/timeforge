const fs = require('fs');
const https = require('https');

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: 500, error: e.message });
    });
  });
}

async function run() {
  const fileContent = fs.readFileSync('src/content/tools.ts', 'utf8');
  const regex = /id:\s*['"]([^'"]+)['"]/g;
  let match;
  const tools = [];
  while ((match = regex.exec(fileContent)) !== null) {
    tools.push(match[1]);
  }
  
  console.log('Found ' + tools.length + ' tools. Testing...');
  
  let errors = 0;
  for (const tool of tools) {
    const res = await checkUrl('https://castov.com/' + tool);
    if (res.status !== 200) {
      console.log('ERROR [' + res.status + '] /' + tool);
      errors++;
    } else {
      console.log('OK [' + res.status + '] /' + tool);
    }
  }
  
  console.log('Tool scan complete. Errors: ' + errors);
}

run();
