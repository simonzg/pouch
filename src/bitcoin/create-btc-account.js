#!/usr/bin/env node

const bitcoin = require('bitcoinjs-lib');
const { networks } = require('bitcoinjs-lib');
const { randomBytes } = require('crypto');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const { selectAsync } = require('../utils');

function createAddress(network) {
  // Define network parameters
  const ECPair = ECPairFactory(ecc);

  // Generate a random 32-byte private key
  const keyPair = ECPair.makeRandom({ rng: () => randomBytes(32), network });

  // Get the private key in WIF format
  const privateKeyWIF = keyPair.toWIF();

  // Generate a P2WPKH (Pay-to-Witness-Public-Key-Hash) address
  const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });

  // Generate a P2PKH (Pay-to-Public-Key-Hash) address
  const legacy = bitcoin.payments.p2pkh({ pubkey: keyPair.publicKey, network });

  return {
    address,
    legacyAddress: legacy.address,
    privateKeyWIF,
  };
}

(async () => {
  const netName = await selectAsync('Bitcoin network', [
    { value: 'regtest' },
    { value: 'testnet' },
    { value: 'mainnet' },
  ]);
  let network;
  switch (netName) {
    case 'regtest':
      network = networks.regtest;
      break;
    case 'testnet':
      network = networks.testnet;
      break;
    case 'mainnet':
      network = networks.bitcoin;
      break;
    default:
      console.log('not supported network');
      return;
  }

  const account = createAddress(network);
  console.log(`Network: ${netName}`);
  console.log(`Bech32 Address:`, account.address);
  console.log('Legacy Address:', account.legacyAddress);
  console.log('Private Key (WIF):', account.privateKeyWIF);
})();
