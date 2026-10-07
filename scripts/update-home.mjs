import fs from 'fs';

const code = fs.readFileSync('src/app/page.tsx', 'utf8');

// Find the boundaries
const startIdx = code.indexOf('{/* --- PRODUCT SHOWCASE / IMAGES --- */}');
const endIdx = code.indexOf('{/* --- TOOLS CATEGORIES SECTION --- */}');

if (startIdx === -1 || endIdx === -1) {
  console.log('Boundaries not found');
  process.exit(1);
}

const newShowcase = `      {/* --- THE ECOSYSTEM SHOWCASE --- */}
      <section className="py-24 border-b border-line bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 text-fg">A complete ecosystem, not just a website.</h2>
            <p className="text-muted text-lg lg:text-xl max-w-3xl mx-auto">
              Castov integrates directly into your workflow. From the browser to the terminal, and right inside your IDE.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Cmd+K */}
            <div className="bg-bg border border-line p-8 rounded-3xl hover:border-accent/50 transition-colors shadow-sm group">
              <div className="w-14 h-14 rounded-2xl bg-field flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Command className="text-fg w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-fg">Global Command Center</h3>
              <p className="text-muted leading-relaxed">
                Press <kbd className="px-2 py-0.5 bg-field rounded border border-line mx-1 font-mono text-sm">Cmd+K</kbd> anywhere. Inline-compute UUIDs, format dates, and navigate instantly without leaving your keyboard.
              </p>
            </div>

            {/* SDK & CLI */}
            <div className="bg-bg border border-line p-8 rounded-3xl hover:border-primary/50 transition-colors shadow-sm group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Terminal className="text-primary w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-fg">@castov/sdk & CLI</h3>
              <p className="text-muted leading-relaxed">
                Bring zero-server utilities directly to your CI/CD pipelines and backend code. Generate secure hashes and process data locally via NPM.
              </p>
            </div>

            {/* VS Code */}
            <div className="bg-bg border border-line p-8 rounded-3xl hover:border-[#007ACC]/50 transition-colors shadow-sm group md:col-span-2 lg:col-span-1">
              <div className="w-14 h-14 rounded-2xl bg-[#007ACC]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code className="text-[#007ACC] w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-fg">VS Code Extension</h3>
              <p className="text-muted leading-relaxed">
                Never context-switch again. Highlight text in your editor to instantly decode Base64, parse JWTs, or format complex JSON blocks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FLAGSHIP FEATURES --- */}
      <section className="py-24 border-b border-line bg-bg relative overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div>
                <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 text-fg">Enterprise-Grade Capabilities</h2>
                <p className="text-muted text-lg">
                  We didn't just build formatters. We built the architecture required by modern engineering teams.
                </p>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-success/10 text-success shrink-0">
                  <Workflow size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-success transition-colors text-fg">P2P Multiplayer Canvas</h3>
                  <p className="text-muted leading-relaxed">
                    A visual node-editor for building data pipelines. Connects your team in real-time using WebRTC and CRDTs (Yjs) without backend servers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-accent/10 text-accent shrink-0">
                  <Database size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors text-fg">Global AI Prompts Vault</h3>
                  <p className="text-muted leading-relaxed">
                    An infinitely scrolling, indexed database of professional AI prompts for Cursor, Claude, and Gemini. Powered by Postgres Trigram search.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-5 group">
                <div className="p-4 rounded-2xl bg-warning/10 text-warning shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-warning transition-colors text-fg">Team Steganography Vaults</h3>
                  <p className="text-muted leading-relaxed">
                    End-to-end encrypted environment variables. We hide your secure AES keys inside standard image pixels (Steganography) for invisible sharing.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-line p-8 rounded-3xl shadow-xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <Zap className="text-primary" size={20} />
                    <span className="font-bold text-fg">API Mocker (Service Worker)</span>
                  </div>
                  <span className="text-xs font-mono bg-field px-2 py-1 rounded text-muted border border-line">Intercepting</span>
                </div>
                <div className="font-mono text-sm space-y-3">
                  <div className="flex text-muted">
                    <span className="text-success mr-2">GET</span> /api/v1/users
                  </div>
                  <div className="bg-bg p-4 rounded-xl border border-line text-xs overflow-x-auto text-fg">
                    {\`{
  "status": 200,
  "data": [
    { "id": "usr_91x", "role": "admin" }
  ]
}\`}
                  </div>
                  <p className="text-muted text-xs leading-relaxed mt-4">
                    Test your frontend without a backend. Our Local API Mocker runs entirely in your browser's Service Worker to simulate payloads globally.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

`;

const finalCode = code.slice(0, startIdx) + newShowcase + code.slice(endIdx);
fs.writeFileSync('src/app/page.tsx', finalCode);
console.log('Homepage updated successfully!');
