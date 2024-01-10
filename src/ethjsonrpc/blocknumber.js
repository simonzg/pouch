#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');

if (process.argv.length < 3) {
  console.log(`[Usage] blocknumber [network|rpcurl]`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[2]);
  const data = { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 2 };
  console.log(`curl -d '${JSON.stringify(data)}' `, url);
  const res = await axios.post(url, data);
  if (res.data && res.data.result) {
    console.log('Block number: ', parseInt(res.data.result, 16));
  }
})();
