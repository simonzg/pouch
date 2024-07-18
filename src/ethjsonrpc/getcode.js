#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync } = require('../utils');
const { ZeroAddress } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const address = await inputAddressAsync('address', ZeroAddress);

  const code = await provider.getCode(address);
  console.log(`Code: `, code);
})();
