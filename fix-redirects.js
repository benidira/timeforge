const fs = require('fs');
let code = fs.readFileSync('next.config.ts', 'utf-8');

// Replace the hardcoded regex with a generic one
code = code.replace(
  /source:\s*['"]\/tools\/:tool\([^)]+\)['"]/g,
  "source: '/tools/:tool'"
);

if (!code.includes('/timezones/:tz')) {
  code = code.replace(
    'return [',
    "return [\n      { source: '/timezones/:tz', destination: '/timezones', permanent: true },"
  );
}

fs.writeFileSync('next.config.ts', code);
