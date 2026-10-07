const urls = [
  'https://castov.com/',
  'https://castov.com/tools',
  'https://castov.com/ai',
  'https://castov.com/developer',
  'https://castov.com/pricing',
  'https://castov.com/canvas',
  'https://castov.com/json-viewer', 
  'https://castov.com/p2p-ghost-tunnel',
  'https://castov.com/sqlite-fiddle',
  'https://castov.com/ai/vercel-ai-sdk-generator', // to test redirect
  'https://castov.com/sitemap-unix.xml'
];

async function fetchWithTimeout(url, timeout = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function testSite() {
  console.log('🚀 Starting Bounded QA Test on Castov.com...\n');
  let passed = 0;
  
  for (const url of urls) {
    try {
      const res = await fetchWithTimeout(url, 5000);
      if (res.ok) {
        console.log(`[PASS] 200 OK: ${url}`);
        passed++;
      } else {
        console.log(`[FAIL] ${res.status}: ${url}`);
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log(`[TIMEOUT]: ${url}`);
      } else {
        console.log(`[ERROR]: ${url} - ${e.message}`);
      }
    }
  }
  
  console.log(`\n✅ Results: ${passed}/${urls.length} routes passed.`);
}
testSite();
