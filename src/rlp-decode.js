#!/usr/bin/env node

var rlp = require('rlp');

if (process.argv.length < 3) {
  console.log(`[Usage] b2b 'hex'`);
  process.exit(-1);
}

const text = process.argv[2].replace('0x', '');
const input = Buffer.from(text, 'hex');
const decoded = rlp.decode(input);
for (const [i, d] of decoded.entries()) {
  console.log(`#${i}: ${d.toString('hex')}`);
}