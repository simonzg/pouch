#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 3) {
  console.log(`[Usage] getblock 1234 http://...eth-json-rpc-endpoint`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[3]);
  const num = '0x' + Number(process.argv[2]);
  const data = { jsonrpc: '2.0', method: 'eth_getBlockByNumber', params: [num], id: 2 };
  console.log(`curl -d '${JSON.stringify(data)}' `, url);
  const res = await axios.post(url, data);
  console.log('Response:', res.data);
  if (res.data && res.data.result) {
    console.log('Block: ', res.data.result);
  }
})();
