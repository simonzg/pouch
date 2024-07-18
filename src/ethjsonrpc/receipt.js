#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync, inputBytes32Async } = require('../utils');
const { ZeroAddress } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const txhash = await inputBytes32Async('txhash', '');

  const receipt = await provider.getTransactionReceipt(txhash);
  console.log(`Receipt: `, receipt);
})();
