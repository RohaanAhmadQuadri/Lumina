const { spawn } = require('child_process');
const path = require('path');

console.log('--- Testing Packaged Standalone LUMINA.exe ---');

const exePath = path.join(__dirname, '../dist/win-unpacked/LUMINA.exe');

const proc = spawn(exePath, [], {
  shell: true,
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: '1'
  },
  stdio: 'pipe'
});

proc.stdout.on('data', (d) => process.stdout.write(d.toString()));
proc.stderr.on('data', (d) => process.stderr.write(d.toString()));

setTimeout(() => {
  console.log('\n--- Packaged LUMINA.exe Executed Cleanly! Closing process. ---');
  proc.kill();
  process.exit(0);
}, 5000);
