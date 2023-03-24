const ethers = require('ethers');
const wallet = ethers.Wallet.createRandom();
console.log(`Address: ${wallet.address}`);
console.log(`Lower Address: ${wallet.address.toLowerCase()}`);
console.log(`Private Key: ${wallet.privateKey}`);
