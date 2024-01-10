#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 3) {
  console.log(`[Usage] netversion [network|rpcurl]`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[2]);
  const data = { jsonrpc: '2.0', method: 'net_version', id: 1 };
  console.log(`curl -d '${JSON.stringify(data)}' `, url);
  const res = await axios.post(url, data);
  console.log('Response:', res.data);
})();
