const fs = require('fs');
let code = fs.readFileSync('src/app/sitemap.ts', 'utf-8');

const additional = `
  AI_TOOLS.forEach((tool) => {
    sitemapEntries.push({
      url: \`\${baseUrl}/ai/\${tool.slug}\`,
      lastModified: getLastMod('src/lib/ai-tools.ts'),
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  });

  GUIDES.forEach((guide) => {
    sitemapEntries.push({
      url: \`\${baseUrl}/guides/\${guide.slug}\`,
      lastModified: getLastMod('src/content/guides.ts'),
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  });
`;

if (!code.includes('AI_TOOLS.forEach')) {
  code = code.replace(
    /return sitemapEntries;\n}$/,
    additional + '\n  return sitemapEntries;\n}'
  );
  
  if (!code.includes("url: `${baseUrl}/developer`")) {
      code = code.replace(
        "    { url: `${baseUrl}/guides`, lastModified: getLastMod('src/app/guides/page.tsx'), changeFrequency: 'weekly', priority: 0.8 },",
        "    { url: `${baseUrl}/guides`, lastModified: getLastMod('src/app/guides/page.tsx'), changeFrequency: 'weekly', priority: 0.8 },\n    { url: `${baseUrl}/developer`, lastModified: getLastMod('src/app/developer/page.tsx'), changeFrequency: 'weekly', priority: 0.8 },"
      );
  }

  fs.writeFileSync('src/app/sitemap.ts', code);
}
