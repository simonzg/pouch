#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync } = require('../utils');
const { ZeroAddress } = require('ethers');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

(async () => {
  const { network, provider } = await selectNetworkAsync();

  const num = await inputNumberAsync('number', '4899545');

  let prev;

  let diffSum = 0;
  let N = 10000;
  let min = 9999999999999;
  let max = 0;
  let counter = 0;
  for (let i = 0; i < N; i++) {
    const block = await provider.getBlock(Number(num) + i);
    if (prev) {
      const diff = block.timestamp - prev.timestamp;
      counter++;
      if (diff < min) {
        min = diff;
      }
      if (diff > max) {
        max = diff;
      }
      diffSum += diff;
    }
    if (counter % 100 == 0) {
      console.log(`Counter: ${counter}`);
      console.log(`Block Interval: `, diffSum / counter);
      console.log(`Max: ${max}`);
      console.log(`Min: ${min}`);
      await sleep(2000);
    }
    prev = block;
  }

  console.log(`Counter: ${counter}`);
  console.log(`Block Interval: `, diffSum / counter);
  console.log(`Max: ${max}`);
  console.log(`Min: ${min}`);
})();
