#!/usr/bin/env node
// Wrapper to make Vite dev accept legacy `--root <dir>` as well as positional root.
import { execa } from 'execa';
import path from 'node:path';

const rawArgs = process.argv.slice(2);
const args = [...rawArgs];

let rootArg = null;
const idx = args.indexOf('--root');
if (idx !== -1) {
  // Extract value after --root
  const val = args[idx + 1];
  if (val && !val.startsWith('-')) {
    rootArg = val;
    args.splice(idx, 2); // remove --root and its value
  } else {
    // malformed usage like `--root` without a value; ignore and let Vite error later
    args.splice(idx, 1);
  }
}

// Support short form `-r <dir>` just in case
const shortIdx = args.indexOf('-r');
if (!rootArg && shortIdx !== -1) {
  const val = args[shortIdx + 1];
  if (val && !val.startsWith('-')) {
    rootArg = val;
    args.splice(shortIdx, 2);
  } else {
    args.splice(shortIdx, 1);
  }
}

// If the first non-flag argument is present and no rootArg detected, keep it as positional root.
// If rootArg is detected, prepend it as the positional root.
const finalArgs = [];
if (rootArg) {
  finalArgs.push(rootArg);
}
finalArgs.push(...args);

// Normalize Windows backslashes in root (Vite accepts both, but for consistency)
if (finalArgs.length > 0 && finalArgs[0] && !finalArgs[0].startsWith('-')) {
  finalArgs[0] = finalArgs[0].split(path.sep).join('/');
}

// Execute vite with inherited stdio so dev server behaves normally
const child = execa('npx', ['vite', ...finalArgs], { stdio: 'inherit' });
child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => {
  console.error(err);
  process.exit(1);
});
