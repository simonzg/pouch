const ethers = require('ethers');
const prompts = require('prompts');
const fs = require('fs');
const { cry } = require('@meterio/devkit');

const domain = {
  name: 'MeterGov',
  version: 'v1.0',
  chainId: 82,
  verifyingContract: '0x228ebBeE999c6a7ad74A6130E81b12f9Fe237Ba3',
};

const types = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' },
  ],
};

const value = {
  value: '0x2386f26fc10000',
  deadline: 1673907550,
  nonce: 5,
  owner: '0xbf85ef4216340eb5cd3c57b550aae7a2712d48d2',
  spender: '0x201bd6df90c2b06674c492a29ebeabb5a4f5cd4e',
};

const signTypedDataWithEthers = async (privKey) => {
  const signer = new ethers.Wallet(privKey);
  const signature = await signer._signTypedData(domain, types, value);
  return signature;
};

const signTypedDataRaw = async (privKey) => {
  const abiCoder = new ethers.utils.AbiCoder();
  const EIP712_TYPEHASH = ethers.utils.id(
    'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
  );
  const domainHex = abiCoder.encode(
    ['bytes32', 'string', 'string', 'uint256', 'address'],
    [
      EIP712_TYPEHASH,
      ethers.utils.id(domain.name),
      ethers.utils.id(domain.version),
      domain.chainId,
      domain.verifyingContract,
    ]
  );
  const domainSeparator = ethers.utils.id(domainHex);

  const PERMIT_TYPEHASH = ethers.utils.id(
    'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'
  );
  const valueHex = abiCoder.encode(['bytes32'].concat(types.Permit.map((p) => p.type)), [
    PERMIT_TYPEHASH,
    value.owner,
    value.spender,
    value.value,
    value.nonce,
    value.deadline,
  ]);

  const hashStruct = ethers.utils.id(valueHex);

  const signhash =
    '0x1901' + domainSeparator.toString('hex').replace('0x', '') + hashStruct.toString('hex').replace('0x', '');
  console.log('sign hash: ', signhash);

  const signer = new ethers.Wallet(privKey);
  const signature = await signer.signMessage(signhash);
  return signature;
};

(async () => {
  const response = await prompts([
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase:',
    },
  ]);

  const { passphrase } = response;
  console.log(process.argv[2]);
  const content = fs.readFileSync(process.argv[2]);
  const j = JSON.parse(content);
  const encrypted = await cry.Keystore.decrypt(j, passphrase);
  const privKey = '0x' + encrypted.toString('hex');

  console.log('private key:', privKey);

  const sig1 = await signTypedDataWithEthers(privKey);
  const sig2 = await signTypedDataRaw(privKey);
  if (sig1 === sig2) {
    console.log('EXCACT match');
  } else {
    console.log('SIGNATURE mismatch');
    console.log('sig1: ', sig1);
    console.log('sig2: ', sig2);
  }
})();
