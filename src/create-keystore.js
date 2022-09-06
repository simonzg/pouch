#!/usr/bin/env node
const { cry } = require('@meterio/devkit');
const prompts = require('prompts');
const fs = require('fs');

(async () => {
  const response = await prompts([
    {
      type: 'text',
      name: 'privkey',
      message: 'What is the private key (hex format)?',
      validate: (privkey) => true,
    },
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase to protect the privkey:',
    },
    {
      type: 'text',
      name: 'keyname',
      message: 'What file should I save it to (.keystore will be appended automatically)? ',
    },
  ]);

  const { passphrase, privkey, keyname } = response;

  const encrypted = await cry.Keystore.encrypt(Buffer.from(privkey.replace('0x', ''), 'hex'), passphrase);

  console.log(encrypted);

  fs.writeFileSync(`./${keyname}.keystore`, JSON.stringify(encrypted, null, 2));
})();
