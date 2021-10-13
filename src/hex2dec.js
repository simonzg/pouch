#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log(`[Usage] hex2dec 0x235`);
  process.exit(-1);
}

console.log(parseInt(process.argv[2], 16));
