#!/usr/bin/env node
const { getAddress } = require('ethers');

if (process.argv.length < 3) {
  console.log(`[Usage] format-addr '0x1234...'`);
  process.exit(-1);
}

const addr = getAddress(process.argv[2]);
console.log(`Address: ${addr}`);
