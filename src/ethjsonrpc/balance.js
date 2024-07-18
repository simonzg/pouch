#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync } = require('../utils');
const { ZeroAddress } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const address = inputAddressAsync('address', ZeroAddress);
  const num = await provider.getBalance(address);
  console.log(`Balance: ${num}`);
})();
