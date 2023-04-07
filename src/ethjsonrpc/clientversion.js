#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 3) {
  console.log(`[Usage] clientversion http://...eth-json-rpc-endpoint`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[2]);
  const data = { jsonrpc: '2.0', method: 'web3_clientVersion', id: 1 };
  const res = await axios.post(url, data);
  console.log('Response:', res.data);
})();
