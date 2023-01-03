#!/usr/bin/env node

var blake2b = require('blake2b');

if (process.argv.length < 3) {
  console.log(`[Usage] str-blake2 'str'`);
  process.exit(-1);
}

const input = Buffer.from(process.argv[2], 'binary');
const digest = blake2b(32).update(input).digest('hex');
console.log(digest);
