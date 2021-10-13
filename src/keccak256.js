#!/usr/bin/env node

const { utils } = require('ethers');

console.log(process.argv);
if (process.argv.length < 3) {
  console.log(`node keccak256.js 'Func(address,uint256)'`);
  process.exit(-1);
}

console.log(utils.id(process.argv[2]));
