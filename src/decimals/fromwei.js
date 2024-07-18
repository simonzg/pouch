#!/usr/bin/env node

const ethers = require('ethers');

if (process.argv.length < 3) {
  console.log('[Usage] fromwei num');
  process.exit(-1);
}
if (process.argv.length == 3) {
  console.log(ethers.formatEther(process.argv[2]).toString());
}

if (process.argv.length == 4) {
  console.log(ethers.formatUnits(process.argv[2], Number(process.argv[3])).toString());
}
