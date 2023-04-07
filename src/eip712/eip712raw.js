const ethers = require('ethers');
const prompts = require('prompts');
const fs = require('fs');
const { cry } = require('@meterio/devkit');

(async () => {
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
  const response = await prompts([
    {
      type: 'password',
      name: 'passphrase',
      message: 'Enter the passphrase:',
    },
  ]);

  const abiCoder = new ethers.utils.AbiCoder();
  const domainHex = abiCoder.encode(
    ['string', 'string', 'uint256', 'address'],
    [domain.name, domain.version, domain.chainId, domain.verifyingContract]
  );
  const valueHex = abiCoder.encode(['address', 'address', 'string'], [value.from, value.to, value.contents]);

  const domainSeparator = ethers.utils.id(Buffer.from(domainHex, 'hex'));
  const hashStruct = ethers.utils.id(Buffer.from(valueHex, 'hex'));

  const signhash = '0x1901' + domainSeparator.toString('hex') + hashStruct.toString('hex');

  const { passphrase } = response;
  console.log(process.argv[2]);
  const content = fs.readFileSync(process.argv[2]);
  const j = JSON.parse(content);
  const encrypted = await cry.Keystore.decrypt(j, passphrase);
  console.log(encrypted);
  const signer = new ethers.Wallet('0x' + encrypted.toString('hex'));
  const signature = await signer.signMessage(Buffer.from(signhash, 'hex'));
  console.log(signature);
})();
