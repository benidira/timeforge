const urls = [
  'https://castov.com/',
  'https://castov.com/tools',
  'https://castov.com/ai',
  'https://castov.com/ai/prompts',
  'https://castov.com/developer',
  'https://castov.com/pricing',
  'https://castov.com/canvas',
  'https://castov.com/env-vault/team',
  'https://castov.com/json-viewer', 
  'https://castov.com/p2p-ghost-tunnel'
];

async function testSite() {
  console.log('🔍 Starting QA Test on Castov.com...\n');
  let passed = 0;
  
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`[PASS] 200 OK: ${url}`);
        passed++;
      } else {
        console.log(`[FAIL] ${res.status}: ${url}`);
      }
    } catch (e) {
      console.log(`[ERROR]: ${url} - ${e.message}`);
    }
  }
  
  console.log(`\n📊 Results: ${passed}/${urls.length} routes passed.`);
}
testSite();
