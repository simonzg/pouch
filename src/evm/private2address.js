#!/usr/bin/env node
const ethers = require('ethers');

if (process.argv.length < 3) {
  console.log(`[Usage] p2addr '0x1234...'`);
  process.exit(-1);
}

const wallet = new ethers.Wallet(process.argv[2]);
console.log(`Address: ${wallet.address}`);
console.log(`Lower Address: ${wallet.address.toLowerCase()}`);
console.log(`Private Key: ${wallet.privateKey}`);
