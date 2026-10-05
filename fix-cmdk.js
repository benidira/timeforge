const fs = require('fs');
let code = fs.readFileSync('src/components/CommandPalette.tsx', 'utf-8');

if (!code.includes('import { TOOLS }')) {
  code = code.replace(
    'import { AI_TOOLS, AI_CATEGORIES } from "@/lib/ai-tools";',
    'import { AI_TOOLS, AI_CATEGORIES } from "@/lib/ai-tools";\nimport { TOOLS } from "@/content/tools";'
  );
}

const toolsGroup = `
          <Command.Group heading="Developer Tools" className="text-xs font-medium text-muted/60 px-2 py-1 mt-2">
            {TOOLS.map((tool) => (
              <Command.Item
                key={tool.slug}
                value={tool.name + ' ' + tool.category}
                onSelect={() => runCommand(() => router.push(\`/\${tool.slug}\`))}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-fg cursor-pointer aria-selected:bg-hover aria-selected:text-accent transition-colors mt-1"
              >
                <div className="flex flex-col pointer-events-none">
                  <span className="font-semibold">{tool.name}</span>
                  <span className="text-xs text-muted font-normal capitalize">{tool.category.replace('-', ' ')}</span>
                </div>
              </Command.Item>
            ))}
          </Command.Group>
`;

if (!code.includes('heading="Developer Tools"')) {
  code = code.replace(
    /<Command\.Group heading="AI Tools"/m,
    toolsGroup + '\n\n          <Command.Group heading="AI Tools"'
  );
}

fs.writeFileSync('src/components/CommandPalette.tsx', code);
