#!/usr/bin/env node
const axios = require('axios');
const { loadRpcUrl } = require('../utils');
const { BigNumber } = require('bignumber.js');

if (process.argv.length < 4) {
  console.log(`[Usage] balance [network|rpcurl] address`);
  process.exit(-1);
}

(async () => {
  const url = loadRpcUrl(process.argv[3]);
  const data = {
    jsonrpc: '2.0',
    method: 'eth_getBalance',
    params: [process.argv[2], 'latest'],
    id: 1,
  };
  console.log(`curl -d '${JSON.stringify(data)}' `, url);
  const res = await axios.post(url, data);
  if (res.data && res.data.result) {
    console.log('Balance: ', new BigNumber(res.data.result).toFixed(0));
  }
})();
