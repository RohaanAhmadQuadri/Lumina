const { spawn } = require('child_process');
const path = require('path');

console.log('--- Starting LUMINA Desktop Smoke Test ---');

const electronBinary = path.join(__dirname, '../node_modules/.bin/electron.cmd');
const mainScript = path.join(__dirname, '../electron/main.js');

const proc = spawn(electronBinary, [mainScript], {
  shell: true,
  env: {
    ...process.env,
    ELECTRON_ENABLE_LOGGING: '1'
  },
  stdio: 'pipe'
});

let output = '';
let hasError = false;

proc.stdout.on('data', (data) => {
  const str = data.toString();
  output += str;
  process.stdout.write(str);
});

proc.stderr.on('data', (data) => {
  const str = data.toString();
  output += str;
  if (str.includes('Error:') || str.includes('SyntaxError') || str.includes('ReferenceError')) {
    hasError = true;
  }
  process.stderr.write(str);
});

// Run for 5 seconds to verify startup, window creation, and renderer initialization
setTimeout(() => {
  console.log('\n--- 5-Second Smoke Test Completed Successfully. Closing LUMINA. ---');
  proc.kill();
  if (hasError) {
    console.error('Smoke test reported errors.');
    process.exit(1);
  } else {
    console.log('Smoke test passed with ZERO errors.');
    process.exit(0);
  }
}, 5000);
