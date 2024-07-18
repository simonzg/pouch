#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl, selectNetworkAsync } = require('../utils');

(async () => {
  const { rpcUrl } = await selectNetworkAsync();
  const data = { jsonrpc: '2.0', method: 'web3_clientVersion', id: 1 };
  const res = await axios.post(rpcUrl, data);
  console.log('ClientVersion:', res.data);
})();
