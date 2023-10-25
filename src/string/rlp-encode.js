#!/usr/bin/env node

var rlp = require('rlp');
const { arrToBufArr, bufArrToArr } = require('ethereumjs-util');

if (process.argv.length < 3) {
  console.log(`[Usage] rlp-encode 'hex' dec`);
  process.exit(-1);
}

const text = process.argv[2].replace('0x', '');
const num = process.argv[3].replace('0x', '');
const input = [Buffer.from(text, 'hex'), Buffer.from(num, 'hex')];

const encoded = rlp.encode(bufArrToArr(input));
console.log('encoded: ', Buffer.from(encoded).toString('hex'));
