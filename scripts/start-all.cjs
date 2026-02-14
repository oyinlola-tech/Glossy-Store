const { spawn } = require('child_process');

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

const frontend = run('frontend', 'npm', ['run', 'start:frontend']);
const backend = run('backend', 'npm', ['run', 'start:backend']);

const shutdown = () => {
  frontend.kill();
  backend.kill();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
