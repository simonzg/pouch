#!/usr/bin/env node
const { selectNetworkAsync, inputBytes32Async } = require('../utils');
const { ZeroAddress } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const txhash = await inputBytes32Async('txhash', '');

  const txinfo = await provider.getTransaction(txhash);
  console.log(`Tx: `, txinfo);
})();
