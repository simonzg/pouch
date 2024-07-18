const { isAddress, isHexString, isBytesLike } = require('ethers');
const { confirm, input, select, password } = require('@inquirer/prompts');
const { getRPCEndpoint, getProvider, RPCS } = require('./network');
const { getAllABIs } = require('./abi');

const loadRpcUrl = (network) => {
  return getRPCEndpoint(network);
};

const privateKeyToAddress = (pk) => {
  const wallet = new ethers.Wallet(pk);
  return wallet.address.toLowerCase();
};

const inputAddressAsync = async (name, defaultVal) => {
  let knownAddress = defaultVal;
  try {
    if (defaultVal) {
      knownAddress = getKnownAddress(selectedNetwork, defaultVal);
    }
  } catch (e) {}
  const address = await input({
    message: `输入${name}地址:`,
    default: knownAddress,
    validate: (value = '') => isAddress(value) || 'Pass a valid address value',
  });
  return address;
};

const inputAddressArrayAsync = async (name, defaultVal) => {
  const list = await input({
    message: `输入${name}地址列表(使用逗号分隔):`,
    default: defaultVal,
    validate: (value = '') => value.split(',').every(isAddress) || 'Pass a valid address array',
  });
  return list.split(',').filter((v) => !!v);
};

const inputArgsArrayAsync = async (name, length, defaultVal) => {
  if (length <= 0) {
    return [];
  }
  const list = await input({
    message: `输入${name} ${length} Args(使用逗号分隔):`,
    default: defaultVal,
    validate: (value = '') => value.split(',').length == length || 'Pass a valid address array',
  });
  return list.split(',');
};

const inputStrAsync = async (name, defaultVal) => {
  const address = await input({
    message: `输入${name}:`,
    default: defaultVal,
    validate: (value = '') => value.length > 0 || 'Pass a valid value',
  });
  return address;
};

const inputHexAsync = async (name, defaultVal) => {
  const hex = await input({
    message: `输入${name}:`,
    default: defaultVal,
    validate: (value = '') => (value.length > 0 && isBytesLike(value)) || 'Pass a valid value',
  });
  return hex;
};

const inputBytes32Async = async (name, defaultVal) => {
  const address = await input({
    message: `输入${name}:`,
    default: defaultVal,
    validate: (value = '') => (value.length == 66 && isBytesLike(value)) || 'Pass a valid bytes32',
  });
  return address;
};

const selectAsync = async (name, choices) => {
  return await select({ message: `选择${name}:`, choices });
};

const inputNumberAsync = async (name, defaultVal) => {
  const num = await input({
    message: `输入${name}数量:`,
    default: defaultVal,
    validate: (value = '') => !isNaN(Number(value)) || 'Pass a valid number',
  });
  return num;
};

const inputPasswordAsync = async (name) => {
  const passphrase = await password({
    message: `输入${green(name)}的Passphrase:`,
    validate: (value = '') => value.length > 0 || 'Pass a valid passphrase value',
    mask: '*',
  });
  return passphrase;
};

const inputPrivateKeyAsync = async (network) => {
  const privateKey = await password({
    message: `输入网络${green(network)}的Private Key:`,
    validate: (value = '') => isBytesLike(value) || 'Pass a valid Private Key value',
    mask: '*',
  });
  return privateKey;
};

const selectNetworkAsync = async () => {
  const network = await select({
    message: `选择网络:`,
    choices: Object.keys(RPCS).map((k) => ({
      name: `${k} (${RPCS[k]})`,
      value: k,
    })),
  });
  selectedNetwork = network;

  const provider = getProvider(network);
  if (!provider) {
    console.log(`不支持网络 ${network}`);
  }
  selectedProvider = provider;
  return {
    network,
    rpcUrl: RPCS[network],
    provider,
  };
};

module.exports = {
  RPCS,
  loadRpcUrl,
  privateKeyToAddress,
  inputAddressAsync,
  inputAddressArrayAsync,
  inputArgsArrayAsync,
  inputStrAsync,
  inputPasswordAsync,
  inputBytes32Async,
  inputPrivateKeyAsync,
  selectNetworkAsync,
  selectAsync,
  inputNumberAsync,
  inputHexAsync,

  getAllABIs,
};
