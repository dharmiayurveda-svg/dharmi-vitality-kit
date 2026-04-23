import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const outputDir = path.join(__dirname, '.vercel', 'output');
const functionsDir = path.join(outputDir, 'functions');
const staticDir = path.join(outputDir, 'static');
const funcDir = path.join(functionsDir, 'index.func');
const serverDir = path.join(__dirname, 'dist', 'server');
const clientDir = path.join(__dirname, 'dist', 'client');

console.log('--- Vercel Build Started ---');

// Ensure clean directories
if (fs.existsSync(outputDir)) fs.rmSync(outputDir, { recursive: true });
fs.mkdirSync(funcDir, { recursive: true });
fs.mkdirSync(staticDir, { recursive: true });

// Copy Static Assets (Client build)
if (fs.existsSync(clientDir)) {
  fs.cpSync(clientDir, staticDir, { recursive: true });
  console.log('Static assets copied to:', staticDir);
}

// Bundle Server with esbuild to ensure all dependencies are included
if (fs.existsSync(path.join(serverDir, 'server.js'))) {
  console.log('Bundling server with esbuild...');
  try {
    execSync(`npx esbuild "${path.join(serverDir, 'server.js')}" --bundle --platform=node --target=node20 --format=esm --outfile="${path.join(serverDir, 'server.bundled.js')}" --external:node:* --external:fsevents --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"`, { stdio: 'inherit' });
    console.log('Server bundled successfully.');
  } catch (err) {
    console.error('Esbuild bundling failed:', err);
    process.exit(1);
  }
} else {
  console.error('Server entry not found at', path.join(serverDir, 'server.js'));
  process.exit(1);
}

// Copy Bundled Server to Function Directory
const destServerDir = path.join(funcDir, 'dist/server');
fs.mkdirSync(destServerDir, { recursive: true });
fs.cpSync(path.join(serverDir, 'server.bundled.js'), path.join(destServerDir, 'server.js'));

// Copy assets for the server function
const assetsSrc = path.join(__dirname, 'src', 'assets');
const assetsDest = path.join(funcDir, 'src', 'assets');
if (fs.existsSync(assetsSrc)) {
    console.log('Copying src/assets to function directory...');
    fs.mkdirSync(assetsDest, { recursive: true });
    fs.cpSync(assetsSrc, assetsDest, { recursive: true });
}

// Also copy assets if they exist (though esbuild might have bundled them)
if (fs.existsSync(path.join(serverDir, 'assets'))) {
    fs.cpSync(path.join(serverDir, 'assets'), path.join(destServerDir, 'assets'), { recursive: true });
}
console.log('Server bundle and assets copied to:', destServerDir);

// Write .vc-config.json for the function
fs.writeFileSync(path.join(funcDir, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs20.x',
  handler: 'index.js',
  launcherType: 'Nodejs',
  shouldAddHelpers: true
}, null, 2));

// Write a minimal package.json for the function
fs.writeFileSync(path.join(funcDir, 'package.json'), JSON.stringify({
  type: 'module'
}, null, 2));

// Write Node.js Function entrypoint bridge
const entryPoint = path.join(funcDir, 'index.js');
fs.writeFileSync(entryPoint, `
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverPath = path.join(__dirname, 'dist', 'server', 'server.js');
const serverURL = pathToFileURL(serverPath).href;

let serverModule;

export default async (req, res) => {
  try {
    if (!serverModule) {
      console.log('[BRIDGE] Loading server bundle...');
      serverModule = await import(serverURL);
      console.log('[BRIDGE] Server bundle loaded.');
    }
    
    const server = serverModule.default || serverModule.server || serverModule;
    
    if (!server || typeof server.fetch !== 'function') {
      throw new Error('Invalid server bundle: fetch method not found');
    }
    
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const url = new URL(req.url, \`\${protocol}://\${host}\`);
    
    if (url.pathname === '/api/ping') {
      res.statusCode = 200;
      res.end('pong');
      return;
    }

    console.log(\`[BRIDGE] \${req.method} \${url.pathname}\`);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      init.body = Buffer.concat(chunks);
    }

    const request = new Request(url.toString(), init);
    const response = await server.fetch(request);
    
    res.statusCode = response.status;
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    const arrayBuffer = await response.arrayBuffer();
    res.end(Buffer.from(arrayBuffer));
  } catch (error) {
    console.error('[BRIDGE] CRITICAL ERROR:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Internal Server Error\\n\\n' + error.message + '\\n\\n' + error.stack);
  }
};
`);

console.log('Bridge created successfully.');

// Write Routing config
fs.writeFileSync(path.join(outputDir, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { src: '/assets/(.*)', dest: '/assets/$1', headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
    { handle: 'filesystem' },
    { src: '/(.*)', dest: '/index' }
  ]
}, null, 2));

console.log('Vercel Build Output generated successfully!');
