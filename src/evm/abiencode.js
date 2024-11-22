#!/usr/bin/env node
const { inputAddressAsync, inputStrAsync, inputNumberAsync, inputBytes32Async } = require('../utils');
const { ZeroAddress } = require('ethers');
const { FunctionFragment } = require('ethers');
const { Interface } = require('ethers');

(async () => {
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
    console.log(`abi: ${funcABI}`);
    console.log(`data: ${data}`);
  } catch (e) {
    console.log(e);
  }
})();
