#!/usr/bin/env node
const ethers = require('ethers');
const { connectDB, disconnectDB } = require('../db');
const { Account } = require('../model/account');
require('dotenv').config();

const createAcct = () => {
  const wallet = ethers.Wallet.createRandom();
  return wallet;
};

(async () => {
  await connectDB('rtxdb');
  if (process.argv.length == 3) {
    const prefix = '0x' + process.argv[2].replace('0x', '');
    const account = await Account.findOne({ address: { $regex: prefix + '.+' } });
    if (!account) {
      console.log(`Found Existed Account in DB:`);
      console.log(`Address: ${account.address}`);
      console.log(`Lower Address: ${account.address.toLowerCase()}`);
      console.log(`Private Key: ${account.privkey}`);
      const wallet = new ethers.Wallet(account.privkey);
      console.log(`Mnemonic: ${wallet.mnemonic}`);

      await disconnectDB();
      return;
    }
    const re = new RegExp('0x[0-9a-zA-Z]', 'i');
    if (re.test(prefix)) {
      const trials = 100000;
      for (let i = 0; i < trials; i++) {
        const wallet = createAcct();
        const acct = new Account({ privkey: wallet.privateKey.toLowerCase(), address: wallet.address.toLowerCase() });
        await acct.save();
        if (wallet.address.toLowerCase().startsWith(prefix.toLowerCase())) {
          console.log(`Created Account:`);
          console.log(`Address: ${wallet.address}`);
          console.log(`Lower Address: ${wallet.address.toLowerCase()}`);
          console.log(`Private Key: ${wallet.privateKey}`);
          console.log(`xMnemonic: ${JSON.stringify(wallet.mnemonic)}`);
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
})();
