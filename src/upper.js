#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log('[Usage] upper string');
  process.exit(-1);
}
console.log(process.argv[2].toUpperCase());
