#!/usr/bin/env node
var blake2b = require('blake2b');

if (process.argv.length < 3) {
  console.log(`[Usage] str2hex 'text'`);
  process.exit(-1);
}

const input = Buffer.from(process.argv[2], 'binary');
const hex = input.toString('hex');
const address = '0x' + hex.slice(-40).padStart(40, '0');
const key = '0x' + blake2b(32).update(input).digest('hex');

console.log('HEX:', hex, ', len:', hex.length);
console.log('Address: ', address);
console.log('Key: ', key);
