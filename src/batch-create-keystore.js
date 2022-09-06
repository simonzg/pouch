#!/usr/bin/env node
const { cry } = require('@meterio/devkit');
const prompts = require('prompts');
const fs = require('fs');
process.argv[2];

if (process.argv.length < 3) {
  console.log(`[Usage] dec2hex 256`);
  process.exit(-1);
}

(async () => {
  const response = await prompts([
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase to protect these privkey:',
    },
  ]);

  const content = fs.readFileSync(process.argv[2]);
  const j = JSON.parse(content);

  const { passphrase } = response;

  for (const keyname in j) {
    const privkey = j[keyname];
    const encrypted = await cry.Keystore.encrypt(Buffer.from(privkey.replace('0x', ''), 'hex'), passphrase);
    fs.writeFileSync(`./main-keystores/${keyname}.keystore`, JSON.stringify(encrypted, null, 2));
  }
})();
