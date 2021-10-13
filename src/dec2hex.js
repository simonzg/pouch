#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log(`[Usage] dec2hex 256`);
  process.exit(-1);
}

console.log('0x' + Number(process.argv[2]).toString(16));
