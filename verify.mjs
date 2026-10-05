import http from 'http';


async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    }).on('error', reject);
  });
}

async function run() {
  console.log('--- STARTING VERIFICATION ---');
  
  // 1. Check /unix-timestamp-converter (Expect 200)
  const canonicalRes = await fetchUrl('http://localhost:3000/unix-timestamp-converter');
  console.log('/unix-timestamp-converter STATUS:', canonicalRes.status);
  
  if (canonicalRes.status === 200) {
    const html = canonicalRes.data;
    const hasCanonical = html.includes('rel="canonical" href="https://castov.com/unix-timestamp-converter"');
    const hasOg = html.includes('property="og:title"');
    const hasTwitter = html.includes('name="twitter:card"');
    const hasJsonLd = html.includes('type="application/ld+json"');
    console.log(' - Has canonical link:', hasCanonical);
    console.log(' - Has OpenGraph:', hasOg);
    console.log(' - Has Twitter:', hasTwitter);
    console.log(' - Has JSON-LD:', hasJsonLd);
  }

  // 2. Check duplicate /tools/unix-timestamp-converter (Expect 301/308)
  const dupRes = await fetchUrl('http://localhost:3000/tools/unix-timestamp-converter');
  console.log('/tools/unix-timestamp-converter STATUS:', dupRes.status);
  if (dupRes.status === 301 || dupRes.status === 308) {
    console.log(' - Redirect Location:', dupRes.headers.location);
  }

  // 3. Check robots.txt
  const robotsRes = await fetchUrl('http://localhost:3000/robots.txt');
  console.log('/robots.txt STATUS:', robotsRes.status);
  if (robotsRes.status === 200) {
    console.log(' - Sitemap defined:', robotsRes.data.includes('sitemap: https://castov.com/sitemap.xml'));
  }

  // 4. Check sitemap.xml
  const sitemapRes = await fetchUrl('http://localhost:3000/sitemap.xml');
  console.log('/sitemap.xml STATUS:', sitemapRes.status);
  if (sitemapRes.status === 200) {
    console.log(' - Uses short canonical URLs:', sitemapRes.data.includes('<loc>https://castov.com/unix-timestamp-converter</loc>'));
    console.log(' - Contains /tools/unix-timestamp-converter:', sitemapRes.data.includes('<loc>https://castov.com/tools/unix-timestamp-converter</loc>'));
  }
}

run().catch(console.error);
