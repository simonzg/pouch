#!/usr/bin/env node
const axios = require('axios');

if (process.argv.length < 3) {
  console.log(`[Usage] netversion http://...eth-json-rpc-endpoint`);
  process.exit(-1);
}

(async () => {
  const res = await axios.post(process.argv[2], { jsonrpc: '2.0', method: 'net_version', id: 1 });
  console.log('Response:', res.data);
})();
