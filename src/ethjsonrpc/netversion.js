#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl, selectNetworkAsync } = require('../utils');

(async () => {
  const { rpcUrl } = await selectNetworkAsync();
  const data = { jsonrpc: '2.0', method: 'net_version', id: 1 };
  console.log(`curl -d '${JSON.stringify(data)}' `, rpcUrl);
  const res = await axios.post(rpcUrl, data);
  console.log('NetVersion:', res.data);
})();
