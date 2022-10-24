#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log(`[Usage] str2hex 'text'`);
  process.exit(-1);
}

console.log(process.argv[2]);
const input = Buffer.from(process.argv[2], 'binary');
const hex = input.toString('hex');
console.log('0x' + hex.slice(-40));
