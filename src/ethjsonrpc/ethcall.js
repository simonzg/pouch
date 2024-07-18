#!/usr/bin/env node
const axios = require('axios');
const {
  selectNetworkAsync,
  inputAddressAsync,
  inputStrAsync,
  inputNumberAsync,
  inputHexAsync,
  inputBytes32Async,
} = require('../utils');
const { ZeroAddress } = require('ethers');
const { FunctionFragment } = require('ethers');
const { zeroAddress } = require('ethereumjs-util');
const { Interface } = require('ethers');

(async () => {
  const { network, provider } = await selectNetworkAsync();
  const from = await inputAddressAsync('from', ZeroAddress);
  const to = await inputAddressAsync('to', ZeroAddress);
  const value = await inputNumberAsync('value', '0');
  const abi = await inputStrAsync('abi', '');

  let data = '';
  try {
    const funcABI = FunctionFragment.from(abi);
    let args = [];
    for (let i = 0; i < funcABI.inputs.length; i++) {
      const inp = funcABI.inputs[i];
      switch (inp.type) {
        case 'uint256':
        case 'uint32':
        case 'uint8':
        case 'uint64':
          args.push(await inputNumberAsync(inp.name || 'Input<number>', '0'));
          break;
        case 'address':
          args.push(await inputAddressAsync(inp.name || 'Input<address>', ZeroAddress));
          break;
        case 'bytes32':
          args.push(await inputBytes32Async(inp.name || 'Input<bytes32>', ''));
          break;
      }
    }

    const iface = new Interface([funcABI]);
    data = iface.encodeFunctionData(funcABI.name, args);
  } catch (e) {
    console.log(e);
  }
  if (!data) {
    data = await inputHexAsync('data', '');
  }
  const tx = {
    from: from == ZeroAddress ? undefined : from,
    to: to == ZeroAddress ? undefined : to,
    value,
    data,
  };
  const res = await provider.call(tx);
  console.log(res);
})();
