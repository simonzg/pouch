#!/usr/bin/env node

const fs = require('fs');
const { program } = require('commander');
const { MeterAgent, NativeTransfer } = require('./meterAgent');
const prompts = require('prompts');
const { cry } = require('@meterio/devkit');
const BigNumber = require('bignumber.js');

const ADDR_PATTERN = RegExp('^(0x|)[0-9a-fA-F]{40}$');
const runBatchTransfer = async (csvfile, options) => {
  console.log(options.network);
  const pk = await loadKeystore(options.keystore);
  const agent = new MeterAgent(options.network, pk);
  let natives = [];
  const content = fs.readFileSync(csvfile).toString();
  const rows = content.split('\n');
  for (const row of rows) {
    const items = row.split(',');
    if (items.length < 3) {
      continue;
    }
    const addr = items[0];
    if (!addr.match(ADDR_PATTERN)) {
      continue;
    }
    const mtr = new BigNumber(items[1]);
    const mtrg = new BigNumber(items[2]);
    natives.push(new NativeTransfer(addr, mtr, mtrg));
  }
  for (const tr of natives) {
    console.log(`To:${tr.to}, MTR:${tr.mtrAmount.toFixed(0)}, MTRG: ${tr.mtrgAmount.toFixed(0)}`);
  }
  const receipt = await agent.batchNativeTransfer(natives);
  console.log(receipt);
};

const loadKeystore = async (keystorePath) => {
  const response = await prompts([
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase:',
    },
  ]);

  const { passphrase } = response;

  const content = fs.readFileSync(keystorePath);
  const j = JSON.parse(content);
  const encrypted = await cry.Keystore.decrypt(j, passphrase);
  return encrypted.toString('hex');
};

const parseNetwork = (value) => {
  let network = '';
  switch (value) {
    case 'main':
    case 'metermain':
      network = 'metermain';
      break;
    case 'test':
    case 'metertest':
      network = 'metertest';
      break;
    default:
      throw new commander.InvalidArgumentError('Not a valid network');
  }
  return network;
};

// this cmd will transfer funds from given account to the
program
  .command('batch-transfer')
  .argument('csvfile', 'csvfile for batch transfer')
  .requiredOption('-n, --network <network>', 'Network to use', parseNetwork)
  .requiredOption('-k, --keystore <keystore>', 'Keystore to use')
  .action(runBatchTransfer);

(async () => {
  await program.parseAsync(process.argv);
})();
