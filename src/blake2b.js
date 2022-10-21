#!/usr/bin/env node

var blake2b = require('blake2b');

if (process.argv.length < 3) {
  console.log(`[Usage] b2b 'hex'`);
  process.exit(-1);
}

const text = process.argv[2].replace('0x', '');
const input = Buffer.from(text, 'hex');
const digest = blake2b(32).update(input).digest('hex');
console.log(digest);
