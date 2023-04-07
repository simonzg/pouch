const ethers = require('ethers');
const prompts = require('prompts');
const fs = require('fs');
const { cry } = require('@meterio/devkit');

const domain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
};

// The named list of all type definitions
const types = {
  Mail: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'contents', type: 'string' },
  ],
};

// The data to sign
const value = {
  from: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
  to: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
  contents: 'Hello, Bob!',
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
  console.log('domainHex', domainHex);
  const MAIL_TYPEHASH = ethers.utils.id('Mail(address from,address to,string contents)');
  const valueHex = abiCoder.encode(
    ['bytes32', 'address', 'address', 'string'],
    [MAIL_TYPEHASH, value.from, value.to, ethers.utils.id(value.contents)]
  );

  const domainSeparator = ethers.utils.id(domainHex);

  console.log('domain separator:', domainSeparator);
  const hashStruct = ethers.utils.id(valueHex);
  console.log('hash struct:', hashStruct);

  const signhash = '0x1901' + domainSeparator.toString('hex') + hashStruct.toString('hex');

  const PERMIT_TYPEHASH = ethers.utils.id(
    'Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)'
  );
  console.group(PERMIT_TYPEHASH);
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
