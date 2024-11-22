#!/usr/bin/env node
const { inputHexAsync, inputStrAsync, inputNumberAsync, inputBytes32Async } = require('../utils');
const { ZeroAddress } = require('ethers');
const { FunctionFragment } = require('ethers');
const { Interface } = require('ethers');

(async () => {
  const data = await inputHexAsync('data', '');
  const dataBuf = Buffer.from(data.replace('0x', ''), 'hex');

  const selector = dataBuf.subarray(0, 4);
  console.log(`Selector: 0x${selector.toString('hex')}\n`);
  let rest = dataBuf.subarray(4);
  let index = 0;
  for (; rest.length > 0; ) {
    let row = rest.subarray(0, 32);
    console.log(`${index}: 0x${row.toString('hex')}`);
    index++;
    rest = rest.subarray(32);
  }
})();
