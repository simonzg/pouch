#!/usr/bin/env node
const { cry } = require('@meterio/devkit');
const prompts = require('prompts');
const fs = require('fs');
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

  console.log(`Decoded private key:`, encrypted.toString('hex'));
})();
