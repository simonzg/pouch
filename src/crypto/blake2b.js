#!/usr/bin/env node

var blake2b = require('blake2b');

if (process.argv.length < 3) {
  console.log(`[Usage] blake2b 'str'`);
  process.exit(-1);
}

const HEX_PATTERN = RegExp('^(0x|)[0-9a-fA-F]+?$');

const str = process.argv[2];
let input = Buffer.from('');
if (str.match(HEX_PATTERN)) {
  console.log(`input is hex: ${str}`);
  input = Buffer.from(str.replace('0x', ''), 'hex');
} else {
  console.log(`input is string: ${str}`);
  input = Buffer.from(str, 'binary');
}
const digest = blake2b(32).update(input).digest('hex');
console.log(digest);
