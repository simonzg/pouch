const ethers = require('ethers');
const providers = require('./providers.json');

const loadProviderMap = () => {
  let providerMap = {};
  for (const name in providers) {
    const p = providers[name];
    providerMap[name] = p;
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
