const { JsonRpcProvider } = require('ethers');
require('dotenv').config();

const RPCS = {
  metertest: 'http://rpctest.meter.io',
  metermain: 'http://rpc.meter.io',

  // Zklink
  zklink: 'https://rpc.zklink.io',
  zklinksepolia: 'https://sepolia.rpc.zklink.io',

  // Arbitrum
  arbitrum: `https://arbitrum.blockpi.network/v1/rpc/${process.env.BLOCKPI_ARBITRUM_KEY}`,
  arbitrumsepolia: 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia',

  // Ethereum
  sepolia: `https://ethereum-sepolia.blockpi.network/v1/rpc/${process.env.BLOCKPI_SEPOLIA_KEY}`,
  ethereum: `https://ethereum.blockpi.network/v1/rpc/${process.env.BLOCKPI_ETHEREUM_KEY}`,

  // Base
  basetest: 'https://goerli.base.org',
  basemain: 'https://base-mainnet.public.blastapi.io',

  // L2
  optimism: 'https://optimism-mainnet.infura.io/v3/c7a449e81b364f2a831a530cb0458b4c',

  // BSC
  bsc: 'https://bsc-dataseed.binance.org',
  bsctest: 'https://data-seed-prebsc-1-s1.binance.org:8545/',

  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  polygon: 'https://polygon-mainnet.infura.io/v3/c7a449e81b364f2a831a530cb0458b4c',

  // Theta
  // theta: 'https://eth-rpc-api.thetatoken.org/rpc',
};

const getRPCEndpoint = (network) => {
  if (network in RPCS) {
    const rpc = RPCS[network];
    return rpc;
  }
  throw new Error(`rpc中没有配置 network ${network}，请查看${__filename}`);
};

const getProvider = (network) => {
  const url = getRPCEndpoint(network);
  const provider = new JsonRpcProvider(url);
  // console.log(`loaded provider for ${network}: ${url}`);
  return provider;
};

module.exports = { RPCS, getRPCEndpoint, getProvider };
