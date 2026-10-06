const https = require('https');

async function getSitemapUrls() {
  return new Promise((resolve, reject) => {
    https.get('https://castov.com/sitemap.xml', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        const urls = [];
        while ((match = regex.exec(data)) !== null) {
          urls.push(match[1]);
        }
        resolve(urls);
      });
    }).on('error', reject);
  });
}

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
  const urls = await getSitemapUrls();
  console.log('Found ' + urls.length + ' URLs in sitemap. Testing...');
  
  let errors = 0;
  for (const url of urls) {
    const res = await checkUrl(url);
    if (res.status !== 200 && res.status !== 308) {
      console.log('ERROR [' + res.status + '] ' + url);
      errors++;
    }
  }
  
  console.log('Sitemap scan complete. Errors: ' + errors);
}

run();
