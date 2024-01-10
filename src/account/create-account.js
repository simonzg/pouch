#!/usr/bin/env node
const ethers = require('ethers');

const createAcct = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

if (process.argv.length == 3) {
  const prefix = '0x' + process.argv[2].replace('0x', '');
  const re = new RegExp('0x[0-9a-zA-Z]', 'i');
  if (re.test(prefix)) {
    const trials = 10000;
    for (let i = 0; i < trials; i++) {
      const wallet = createAcct();
      if (wallet.address.toLowerCase().startsWith(prefix.toLowerCase())) {
        console.log(`Address: ${wallet.address}`);
        console.log(`Lower Address: ${wallet.address.toLowerCase()}`);
        console.log(`Private Key: ${wallet.privateKey}`);
        return;
      }
    }
    console.log(`can't find an address starts with ${prefix} after ${trials} trials`);
  } else {
    console.log(`[Usage] create-account '0x1234' // the '0x1234' is the desired prefix`);
    return;
  }
} else {
  const wallet = createAcct();
  console.log(`Address: ${wallet.address}`);
  console.log(`Lower Address: ${wallet.address.toLowerCase()}`);
  console.log(`Private Key: ${wallet.privateKey}`);
}
