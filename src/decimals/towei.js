#!/usr/bin/env node

const ethers = require('ethers');

if (process.argv.length < 3) {
  console.log('[Usage] towei num');
  process.exit(-1);
}
if (process.argv.length == 3) {
  console.log(ethers.parseEther(process.argv[2]).toString());
}

if (process.argv.length == 4) {
  console.log(ethers.parseUnits(process.argv[2], Number(process.argv[3])).toString());
}
