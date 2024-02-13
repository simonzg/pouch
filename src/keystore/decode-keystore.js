#!/usr/bin/env node
const { cry } = require('@meterio/devkit');
const prompts = require('prompts');
const fs = require('fs');
const { Wallet } = require('ethers');
if (process.argv.length < 3) {
  console.log(`[Usage] decode-keystore test.keystore`);
  process.exit(-1);
}

(async () => {
  const response = await prompts([
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase:',
    },
  ]);

  const { passphrase } = response;

  const content = fs.readFileSync(process.argv[2]);
  const j = JSON.parse(content);
  const encrypted = await cry.Keystore.decrypt(j, passphrase);
  const wallet = new Wallet('0x' + encrypted.toString('hex'));
  console.log(`Decoded private key:`, '0x' + encrypted.toString('hex'));
  console.log(`Lower private key:`, '0x' + encrypted.toString('hex').toLowerCase());
  console.log(`Decoded account:`, wallet.address);
  console.log(`Lower account:`, wallet.address.toLowerCase());
})();
