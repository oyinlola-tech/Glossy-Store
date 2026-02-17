const { spawn } = require('child_process');
const http = require('http');
const https = require('https');

const backendTarget = process.env.VITE_BACKEND_PROXY_TARGET || 'http://127.0.0.1:5000';
const backendHealthUrl = `${backendTarget.replace(/\/+$/, '')}/api/health`;
const backendBootTimeoutMs = Number(process.env.BACKEND_BOOT_TIMEOUT_MS || 30000);
const backendPollIntervalMs = Number(process.env.BACKEND_POLL_INTERVAL_MS || 500);

const run = (name, command, args) => {
  const child = spawn(command, args, {
    shell: true,
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
      process.exit(code || 1);
    }
  });

  return child;
};

const backend = run('backend', 'npm', ['run', 'start:backend']);
let frontend = null;

const ping = (url) => new Promise((resolve) => {
  try {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;
    const req = client.request(
      {
        method: 'GET',
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname,
        timeout: 2000,
      },
      (res) => {
        res.resume();
        resolve(res.statusCode >= 200 && res.statusCode < 500);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  } catch {
    resolve(false);
  }
});

const waitForBackend = async () => {
  const start = Date.now();
  while (Date.now() - start < backendBootTimeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    const ready = await ping(backendHealthUrl);
    if (ready) return true;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, backendPollIntervalMs));
  }
  return false;
};

const startFrontendWhenReady = async () => {
  const ready = await waitForBackend();
  if (!ready) {
    console.warn(`[start-all] Backend did not become healthy within ${backendBootTimeoutMs}ms. Starting frontend anyway.`);
  }
  frontend = run('frontend', 'npm', ['run', 'start:frontend']);
};

void startFrontendWhenReady();

const shutdown = () => {
  if (frontend) frontend.kill();
  backend.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
