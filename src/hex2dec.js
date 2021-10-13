#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log(`node hex2dec.js 0x235`);
  process.exit(-1);
}

console.log(parseInt(process.argv[2], 16));
