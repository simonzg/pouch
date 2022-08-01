#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 3) {
  console.log(`[Usage] blocknumber http://...eth-json-rpc-endpoint`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[2]);
  console.log(`Eth rpc call to: `, url);
  const res = await axios.post(url, { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 });
  console.log('Response:', res.data);
})();
