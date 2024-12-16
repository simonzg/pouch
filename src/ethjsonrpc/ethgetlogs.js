#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync, inputBytes32Async } = require('../utils');
const { toBeHex, ZeroAddress } = require('ethers');
const { confirm } = require('@inquirer/prompts');

(async () => {
  const { provider } = await selectNetworkAsync();
  const address = await inputAddressAsync('address', ZeroAddress);
  let hasTopics0 = await confirm({ message: '是否有topics0', default: false });
  let topics0 = '';
  if (hasTopics0) {
    topics0 = await inputBytes32Async('topics0');
  }
  const fromBlock = await inputNumberAsync('fromBlock');
  const toBlock = await inputNumberAsync('toBlock');

  const params = {
    fromBlock: toBeHex(fromBlock),
    toBlock: toBeHex(toBlock),
    topics: topics0 == '' ? [] : [topics0],
    address,
  };
  console.log('Params:', params);
  console.log(
    `Cmd: \ncurl  -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "method": "eth_getLogs", "params": [${JSON.stringify(
      params
    )}], "id": 1}'`
  );

  const res = await provider.getLogs(params);
  console.log('Result:', res);
})();
