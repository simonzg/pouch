#!/usr/bin/env node

const { id, isHexString } = require('ethers');

if (process.argv.length < 3) {
  console.log(`[Usage] k256 'Func(address,uint256)'`);
  process.exit(-1);
}

if (isHexString(process.argv[2])) {
  console.log('hey');
  console.log(id(Buffer.from(process.argv[2].replace('0x', ''), 'hex').toString()));
} else {
  console.log('yo');
  console.log(id(process.argv[2]));
}
