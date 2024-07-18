#!/usr/bin/env node
const { selectNetworkAsync } = require('../utils');

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const { chainId } = await provider.getNetwork();
  console.log(`ChainId: `, chainId);
})();
