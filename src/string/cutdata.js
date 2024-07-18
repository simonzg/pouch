#!/usr/bin/env node

if (process.argv.length < 3) {
  console.log(`[Usage] cutdat 0x...`);
  process.exit(-1);
}

const argv = process.argv[2].replace('0x', '');
const selector = argv.slice(0, 8);
let tail = argv.slice(8);
let i = 0;
console.log(`selector: ${selector}`);
while (tail.length >= 64) {
  const row = tail.slice(0, 64);
  console.log(`${i + 1}: ${row}`);
  tail = tail.slice(64);
  i++;
}
if (tail) {
  console.log(`${i + 1}: ${tail}`);
}
