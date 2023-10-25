#!/usr/bin/env node

const { utils } = require('ethers');

if (process.argv.length < 3) {
  console.log(`[Usage] k256 'Func(address,uint256)'`);
  process.exit(-1);
}

console.log(utils.id(Buffer.from(process.argv[2].replace('0x', ''), 'hex').toString()));
