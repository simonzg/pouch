#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync } = require('../utils');
const { ZeroAddress } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const num = await inputNumberAsync('number', '0');

  const block = await provider.getBlock(Number(num));
  console.log(`Block: `, block);
})();
