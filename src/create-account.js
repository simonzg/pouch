const wallet = require('ethereumjs-wallet').default;
const myWallet = wallet.generate();

console.log(`Address: ${myWallet.getAddressString()}`);
console.log(`Private Key: ${myWallet.getPrivateKeyString()}`);
