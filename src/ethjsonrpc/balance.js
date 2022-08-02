#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 4) {
  console.log(`[Usage] balance http://...eth-json-rpc-endpoint 0x...address`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[2]);
  console.log(`Eth rpc call to: `, url);
  const res = await axios.post(url, {
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: [process.argv[3], 'latest'],
    id: 1,
  });
  console.log('Response:', res.data);
  if (res.data && res.data.result) {
    console.log('Balance: ', parseInt(res.data.result, 16));
  }
})();
