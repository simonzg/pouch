const fs = require('fs');
const ethers = require('ethers');

const loadProviderMap = () => {
  if (!process.env.PROVIDERS_CONFIG) {
    throw new Error('providers not found, please config PROVIDERS_CONFIG in .env');
  }
  console.log(process.env.PROVIDERS_CONFIG);

  if (!fs.existsSync(process.env.PROVIDERS_CONFIG)) {
    throw new Error('path configured in PROVIDERS_CONFIG doesnt exist');
  }

  const providers = JSON.parse(fs.readFileSync(process.env.PROVIDERS_CONFIG).toString());
  let providerMap = {};
  for (const name in providers) {
    const p = providers[name];
    providerMap[name] = p.meterified ? p.rpcUrl : p.url;
    if (p.alias) {
      for (const a of p.alias) {
        providerMap[a] = p.meterified ? p.rpcUrl : p.url;
      }
    }
  }
  return providerMap;
};

const loadRpcUrl = (nameOrUrl) => {
  const pmap = loadProviderMap();
  if (nameOrUrl in pmap) {
    return pmap[nameOrUrl];
  }
  if (!nameOrUrl.startsWith('http://') && !nameOrUrl.startsWith('https://')) {
    nameOrUrl = 'http://' + nameOrUrl;
  }
  return nameOrUrl;
};

const privateKeyToAddress = (pk) => {
  const wallet = new ethers.Wallet(pk);
  return wallet.address.toLowerCase();
};

module.exports = { loadRpcUrl, privateKeyToAddress };
