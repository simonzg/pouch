#!/usr/bin/env node
const { selectNetworkAsync } = require('../utils');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const num = await provider.getBlockNumber();
  console.log(`BlockNumber: ${num}`);
})();
