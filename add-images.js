const fs = require('fs');
let code = fs.readFileSync('src/app/page.tsx', 'utf-8');

if (!code.includes('import Image from')) {
  code = code.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport Image from "next/image";'
  );
}

const heroGraphic = `
            <div className="bg-gray-100 flex flex-col items-center justify-center min-h-[300px] overflow-hidden relative">
               <Image 
                  src="/hero-dashboard.jpg" 
                  alt="Castov SaaS Developer Dashboard" 
                  width={1200} 
                  height={800} 
                  className="object-cover w-full h-auto scale-[1.02] hover:scale-105 transition-transform duration-700" 
                  priority
               />
            </div>
`;

code = code.replace(
  /<div className="p-8 bg-gray-50 flex flex-col md:flex-row gap-8 items-center justify-center min-h-\[300px\]">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section>/m,
  heroGraphic + '\n          </div>\n        </div>\n      </section>'
);

const canvasFeatureImg = `<div className="mb-6 rounded-xl overflow-hidden shadow-sm border border-gray-100 h-40 relative">
                <Image src="/canvas-workflow.jpg" alt="Workflow Canvas" fill className="object-cover" />
              </div>`;

code = code.replace(
  /<div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-600 rounded-xl flex items-center justify-center mb-6 transition-colors">[\s\S]*?<\/div>/m,
  canvasFeatureImg
);

fs.writeFileSync('src/app/page.tsx', code);
