import { spawn } from 'child_process';
import http from 'http';
import { execSync } from 'child_process';

const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], { stdio: 'ignore' });

function checkReady() {
  http.get('http://localhost:3000/', (res) => {
    if (res.statusCode === 200) {
      console.log('Server is ready. Running verify.mjs...');
      try {
        const output = execSync('node verify.mjs').toString();
        console.log(output);
      } catch (e) {
        console.error('Verification failed:', e.stdout ? e.stdout.toString() : e.message);
      } finally {
        server.kill();
        process.exit(0);
      }
    }
  }).on('error', () => {
    setTimeout(checkReady, 500);
  });
}

checkReady();
