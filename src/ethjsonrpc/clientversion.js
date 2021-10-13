#!/usr/bin/env node
const axios = require('axios');

if (process.argv.length < 3) {
  console.log(`[Usage] clientversion http://...eth-json-rpc-endpoint`);
  process.exit(-1);
}

(async () => {
  const res = await axios.post(process.argv[2], { jsonrpc: '2.0', method: 'web3_clientVersion', id: 1 });
  console.log('Response:', res.data);
})();
