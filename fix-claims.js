const fs = require('fs');

// 1. Remove blanket 'Runs Locally' badge from AI tools template
let aiPageCode = fs.readFileSync('src/app/ai/[slug]/page.tsx', 'utf-8');
aiPageCode = aiPageCode.replace(
  /<div className="flex items-center gap-2 mb-4">[\s\S]*?<\/div>/,
  ''
);
fs.writeFileSync('src/app/ai/[slug]/page.tsx', aiPageCode);

// 2. Soften the Zero-Knowledge Encryption claim in Privacy
let privacyCode = fs.readFileSync('src/app/privacy/page.tsx', 'utf-8');
privacyCode = privacyCode.replace(
  /Zero-Knowledge Encryption.*We cannot read your secrets\./,
  'industry-standard encryption in transit and at rest. Your sensitive payload is encrypted before storage.'
);
fs.writeFileSync('src/app/privacy/page.tsx', privacyCode);

// 3. Remove unverified social links in Contact page
let contactCode = fs.readFileSync('src/app/contact/page.tsx', 'utf-8');
contactCode = contactCode.replace(
  /<li><strong>X \(Twitter\):<\/strong>.*?<\/li>/,
  ''
);
fs.writeFileSync('src/app/contact/page.tsx', contactCode);
