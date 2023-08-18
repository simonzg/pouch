const fs = require('fs');
const path = require('path');
const Web3 = require('web3');
const axios = require('axios');
const { default: BigNumber } = require('bignumber.js');
const { ScriptEngine, Transaction, cry, PredefinedAddress } = require('@meterio/devkit');
const { privateKeyToAddress } = require('../utils');
const meterify = require('meterify').meterify;
const TestnetChainTag = 101;
const MainnetChainTag = 82;
const MTR = 0;
const MTRG = 1;
const getBase = () => {
  return path.join(__dirname, '..');
};

class NativeTransfer {
  constructor(to, mtrAmount, mtrgAmount) {
    if (!cry.isAddress(to)) {
      throw new Error(`invalid to address: ${to}`);
    }
    this.to = to;
    this.mtrAmount = new BigNumber(mtrAmount);
    this.mtrgAmount = new BigNumber(mtrgAmount);
  }
}

class LockedTransfer {
  constructor(from, to, lockEpoch, releaseEpoch, mtrAmount, mtrgAmount, memo) {
    if (!cry.isAddress(from)) {
      throw new Error('invalid from address');
    }
    if (!cry.isAddress(to)) {
      throw new Error('invalid to address');
    }
    this.to = to;
    this.lockEpoch = lockEpoch;
    this.releaseEpoch = releaseEpoch;
    this.mtrAmount = new BigNumber(mtrAmount);
    this.mtrgAmount = new BigNumber(mtrgAmount);
    this.memo = memo;
    const encoded = ScriptEngine.getLockedTransferData(
      lockEpoch,
      releaseEpoch,
      from,
      to,
      this.mtrAmount.toFixed(),
      this.mtrgAmount.toFixed(),
      memo
    );
    this.data = '0x' + encoded.toString('hex');
  }
}

const loadAbi = (name) => {
  let abi = fs.readFileSync(path.join(getBase(), 'compiled', `${name}.abi`)).toString();
  return JSON.parse(abi);
};

const loadByteCode = (name) => {
  let bytecode = fs.readFileSync(path.join(getBase(), 'compiled', `${name}.bin`)).toString();
  return '0x' + bytecode;
};

let getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

let getRandomInt64 = () => {
  return getRandomInt(9007199254740992);
};

class MeterAgent {
  constructor(network, pk) {
    let rpcUrl = '';
    let restUrl = '';
    if (network === 'metermain') {
      rpcUrl = 'https://rpc.meter.io';
      restUrl = 'https://mainnet.meter.io';
    } else if (network === 'metertest') {
      rpcUrl = 'https://rpctest.meter.io';
      restUrl = 'http://testnet.meter.io';
    } else {
      throw new Error('could not recognize network: ' + network);
    }
    console.log('rpcUrl: ', rpcUrl);
    const address = privateKeyToAddress(pk);
    const addr = '0x' + address.toString('hex'); // address
    this.addr = addr;
    this.network = network;
    // web3 is a standard web3 client on rpcUrl
    this.web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    this.web3.eth.accounts.wallet.add(pk);

    let chainTag = TestnetChainTag; // chainTag for testnet
    if (this.network === 'metermain') {
      chainTag = MainnetChainTag;
    }
    this.chainTag = chainTag;
    console.log(`network: ${network}, chainTag: ${chainTag}`);
    // mweb3 is a meterified web3 client on restUrl
    this.mweb3 = meterify(new Web3(), restUrl);
    this.mweb3.eth.accounts.wallet.add(pk);
    this.pk = pk;
  }

  getTokenData(token) {
    if (token == MTR) {
      // 0000000000 for MTR(meter token)
      return '0000000000';
    } else if (token == MTRG) {
      // 0000000001 for MTRG(meter governance token)
      return '0000000001';
    } else {
      throw new Error(`could not translate token ${token}`);
    }
  }

  async getBest() {
    const num = await this.web3.eth.getBlockNumber();
    const best = await this.web3.eth.getBlock(num);
    console.log(best);
    return best;
  }

  async getLockProfiles() {
    return axios.get(`${this.meterifyUrl}/accountlock/profiles`);
  }

  async getBucketInfo(bucketID) {
    return axios.get(`${this.meterifyUrl}/staking/buckets/${bucketID}`);
  }

  async getCandidates() {
    return axios.get(`${this.meterifyUrl}/staking/candidates`);
  }

  async getInjail() {
    return axios.get(`${this.meterifyUrl}/slashing/injail`);
  }

  async lockedTransfer(lockEpoch, releaseEpoch, to, mtrVal, mtrgVal, memo = '') {
    console.log('from: ', this.addr);
    console.log('to:', to);
    const encoded = ScriptEngine.getLockedTransferData(lockEpoch, releaseEpoch, this.addr, to, mtrVal, mtrgVal, memo);
    const data = '0x' + encoded.toString('hex');
    return this.web3.eth.sendTransaction({
      from: this.addr,
      to: PredefinedAddress.AccountLock,
      value: '0',
      data,
    });
  }

  async batchLockedTransfer(transfers) {
    if (!Array.isArray(transfers)) {
      console.log('invalid transfers, must be LockedTransfer[');
      return;
    }

    let clauses = [];
    let gas = 5000;
    for (const t of transfers) {
      if (t instanceof LockedTransfer) {
        if (t.mtrAmount.isGreaterThan(0) || t.mtrgAmount.isGreaterThan(0)) {
          clauses.push({ to: PredefinedAddress.AccountLock, value: '0', token: 0, data: t.data });
          gas += 16000 + ((t.data.length - 2) * 68) / 2;
        }
      }
    }

    const best = await this.getBest();
    const blockRef = best.hash.substr(0, 18);

    let txObj = {
      chainTag: this.chainTag,
      blockRef, // the first 8 bytes of latest block
      expiration: 48, // blockRefHeight + expiration is the height for tx expire
      clauses,
      gasPriceCoef: 0,
      gas: gas,
      dependsOn: null,
      nonce: getRandomInt(Number.MAX_SAFE_INTEGER), // random number
    };
    let tx = new Transaction(txObj);

    // sign the tx
    const pkBuffer = Buffer.from(this.pk.replace('0x', ''), 'hex');
    const signingHash = cry.blake2b256(tx.encode());
    tx.signature = cry.secp256k1.sign(signingHash, pkBuffer);

    const raw = tx.encode();
    const rawTx = '0x' + raw.toString('hex');
    const receipt = await this.web3.eth.sendSignedTransaction(rawTx);
    console.log(receipt);
    return {
      clauseCount: clauses.length,
      receipt: receipt,
    };
  }

  async transfer(to, value, token) {
    const data = this.getTokenData(token);
    const toAddr = await this.formalizeAddr(to);
    return this.web3.eth.sendTransaction({
      from: this.addr, // meter address 0x....
      to: toAddr, // meter address 0x....
      value, // amount in Wei
      data, // token
    });
  }

  async batchNativeTransfer(transfers) {
    if (!Array.isArray(transfers)) {
      console.log('invalid transfers, must be NativeTransfer[');
      return;
    }
    let clauses = [];
    for (const t of transfers) {
      if (t instanceof NativeTransfer) {
        if (t.mtrAmount.isGreaterThan(0)) {
          clauses.push({ to: t.to, value: t.mtrAmount.toFixed(), token: 0, data: '0x' });
        }
        if (t.mtrgAmount.isGreaterThan(0)) {
          clauses.push({ to: t.to, value: t.mtrgAmount.toFixed(), token: 1, data: '0x' });
        }
      }
    }

    const best = await this.getBest();
    const blockRef = best.hash.substr(0, 18);

    let txObj = {
      chainTag: this.chainTag,
      blockRef, // the first 8 bytes of latest block
      expiration: 48, // blockRefHeight + expiration is the height for tx expire
      clauses,
      gasPriceCoef: 0,
      gas: 5000 + clauses.length * 16000, // fixed value
      dependsOn: null,
      nonce: getRandomInt(Number.MAX_SAFE_INTEGER), // random number
    };
    console.log(txObj);
    let tx = new Transaction(txObj);

    // sign the tx
    const pkBuffer = Buffer.from(this.pk.replace('0x', ''), 'hex');
    const signingHash = cry.blake2b256(tx.encode());
    tx.signature = cry.secp256k1.sign(signingHash, pkBuffer);

    console.log('signature:', tx.signature);
    const raw = tx.encode();
    const rawTx = '0x' + raw.toString('hex');
    console.log(rawTx);
    const receipt = await this.mweb3.eth.sendSignedTransaction(rawTx);
    console.log(receipt);
    return {
      clauseCount: clauses.length,
      receipt: receipt,
    };
  }

  async scriptCall(data) {
    return this.web3.eth.sendTransaction({
      from: this.addr,
      to: this.addr,
      value: '0',
      data,
    });
  }

  async call(to, data) {
    const toAddr = await this.formalizeAddr(to);
    return this.web3.eth.sendTransaction({
      from: this.addr,
      to: toAddr,
      value: '0',
      gasPriceCoef: 0,
      gasLimit: 470000,
      data,
    });
  }

  async formalizeAddr(nameOrAddr) {
    if (cry.isAddress(nameOrAddr)) {
      return nameOrAddr;
    }
    if (!nameOrAddr.startsWith('0x') && cry.isAddress('0x' + nameOrAddr)) {
      return '0x' + nameOrAddr;
    }
    throw new Error('not recognize address');
  }

  async estimate(to, value, token) {
    const toAddr = await this.formalizeAddr(to);
    const tx = { from: this.addr, to: toAddr, value, data: '0x', token };
    return this.web3.eth.estimateGas(tx);
  }

  async signTransfer(to, value, token) {
    let data = '';
    if (token == MTR) {
      // 0000000000 for MTR(meter token)
      data = '0000000000';
    } else if (token == MTRG) {
      // 0000000001 for MTRG(meter governance token)
      data = '0000000001';
    } else {
      throw new Error(`could not translate token ${token}`);
    }

    const toAddr = await this.formalizeAddr(to);
    const signedTx = await this.web3.eth.accounts.signTransaction({ to: toAddr, value, data }, this.pk);
    return {
      rawTx: signedTx.rawTransaction,
      msgHash: '0x' + signedTx.messageHash.toString('hex'),
    };
  }

  async sendRawTx(rawTx) {
    return this.web3.eth.sendSignedTransaction(rawTx);
  }

  async balance(addr) {
    if (!addr) {
      addr = this.addr;
    }
    const mtrgBalance = await this.web3.eth.getBalance(addr);
    const mtrBalance = await this.web3.eth.getEnergy(addr);
    return {
      mtrg: mtrgBalance,
      mtr: mtrBalance,
      mtrStr: `${parseInt(mtrBalance) / 1e18} MTR`,
      mtrgStr: `${parseInt(mtrgBalance) / 1e18} MTRG`,
    };
  }

  async deployContract(contractName, args) {
    const abi = loadAbi(contractName);
    const bytecode = loadByteCode(contractName);

    let contract = new Web3.eth.Contract(abi);
    contract.options.data = bytecode;

    return contract.deploy({ arguments: args }).send({ from: this.addr, gas: 4700000 });
  }

  getTimestamp() {
    return Math.floor(Date.now() / 1000);
  }

  async candidate(pubKey, ip, name, desc, amount, commission /* 100-1%, 1000-10% */, autobid /* 1-1% 100-100% */) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();

    const data = ScriptEngine.getCandidateData(
      this.addr,
      name,
      desc,
      pubKey,
      ip,
      8670,
      amount,
      commission, // commission 10%
      timestamp, // timestamp
      nonce, // nonce
      autobid // autobid
    );
    return this.scriptCall(data);
  }

  async uncandidate() {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getUncandidateData(this.addr, timestamp, nonce);
    const decoded = ScriptEngine.decodeScriptData(data);
    return this.scriptCall(data);
  }

  async bound(candAddr, amount, autobid) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBoundData(0, this.addr, candAddr, amount, timestamp, nonce, autobid);
    return this.scriptCall(data);
  }

  async bucketSub(holderAddr, bucketID, amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBucketSubData(holderAddr, bucketID, amount, timestamp, nonce);
    return this.scriptCall(data);
  }

  async bucketAdd(holderAddr, bucketID, amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBucketAddData(holderAddr, bucketID, amount, timestamp, nonce);
    return this.scriptCall(data);
  }

  async unbound(bucketID, amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getUnboundData(this.addr, bucketID, amount, timestamp, nonce);
    return this.scriptCall(data);
  }

  async delegate(candAddr, bucketID, amount, autobid) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getDelegateData(this.addr, candAddr, bucketID, amount, timestamp, nonce, autobid);
    return this.scriptCall(data);
  }

  async undelegate(bucketID, amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getUndelegateData(this.addr, bucketID, amount, timestamp, nonce);
    return this.scriptCall(data);
  }

  async bid(amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBidData(this.addr, amount, timestamp, nonce);
    return this.scriptCall(data);
  }

  async bailOut() {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBailOutData(this.addr, timestamp, nonce);
    return this.scriptCall(data);
  }

  async fullCandidateUpdate(name, desc, pubKey, ip, commission, autobid) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getCandidateUpdateData(
      this.addr,
      name,
      desc,
      pubKey,
      ip,
      8670,
      commission,
      timestamp,
      nonce,
      autobid
    );
    return this.scriptCall(data);
  }

  async candidateUpdate(pubKey, ip, name, desc, commission, autobid) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getCandidateUpdateData(
      this.addr,
      name,
      desc,
      pubKey,
      ip,
      8670,
      commission,
      timestamp,
      nonce,
      autobid
    );
    return this.scriptCall(data);
  }

  async auctionBid(amount) {
    const timestamp = this.getTimestamp();
    const nonce = getRandomInt64();
    const data = ScriptEngine.getBidData(this.addr, amount, timestamp, nonce);

    return this.scriptCall(data);
  }

  async explain(args) {
    return axios.post(`${this.meterifyUrl}/accounts/*`, args);
  }
}
module.exports = {
  MeterAgent,
  NativeTransfer,
  LockedTransfer,
};
