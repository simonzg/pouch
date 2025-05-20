#!/usr/bin/env node
const {
  selectNetworkAsync,
  inputAddressAsync,
  inputStrAsync,
  inputNumberAsync,
  inputHexAsync,
  inputBytes32Async,
  inputNumberArrayAsync,
} = require('../utils');
const { ZeroAddress, toBeHex } = require('ethers');
const { FunctionFragment } = require('ethers');
const { Interface } = require('ethers');
const { confirm } = require('@inquirer/prompts');
const { red, green } = require('colors');

(async () => {
  const { provider } = await selectNetworkAsync();
  const from = await inputAddressAsync('from', ZeroAddress);
  const to = await inputAddressAsync('to', ZeroAddress);
  const value = await inputNumberAsync('value', '0');
  const hasABI = await confirm({ message: '是否有ABI' });
  let data = '';
  if (hasABI) {
    const abi = await inputStrAsync('abi', '');

    try {
      const funcABI = FunctionFragment.from(abi);
      let args = [];
      for (let i = 0; i < funcABI.inputs.length; i++) {
        const inp = funcABI.inputs[i];
        switch (inp.type) {
          case 'uint256':
          case 'uint32':
          case 'uint8':
          case 'uint16':
          case 'uint64':
            args.push(await inputNumberAsync(inp.name || 'Input<number>', '0'));
            break;
          case 'address':
            args.push(await inputAddressAsync(inp.name || 'Input<address>', ZeroAddress));
            break;
          case 'bytes32':
            args.push(await inputBytes32Async(inp.name || 'Input<bytes32>', ''));
            break;
          case 'bytes':
            args.push(await inputHexAsync(inp.name || 'Input<hex>', ''));
            break;
          case 'uint256[]':
            args.push(await inputNumberArrayAsync(inp.name || 'Input<number array>', []));
        }
      }

      const iface = new Interface([funcABI]);
      data = iface.encodeFunctionData(funcABI.name, args);
      console.log({ to, data });
    } catch (e) {
      console.log(e);
    }
  } else {
    data = await inputHexAsync('data', '');
  }

  const params = {
    from: from == ZeroAddress ? undefined : from,
    to: to == ZeroAddress ? undefined : to,
    value: toBeHex(value),
    data,
  };
  console.log(green('Params:'), params);
  console.log(
    `${green(
      'Curl cmd:'
    )}\n  curl  -H "Content-Type: application/json" -d '{"jsonrpc": "2.0", "method": "eth_call", "params": [${JSON.stringify(
      params
    )}, "latest"], "id": 1}'`
  );

  const res = await provider.call(params);
  console.log('Result:', res);
})();
