#!/usr/bin/env node
const { selectNetworkAsync, inputAddressAsync, inputNumberAsync } = require('../utils');
const { ZeroAddress, isHexString } = require('ethers');

(async () => {
  const { provider } = await selectNetworkAsync();
  const addr = await inputAddressAsync('address', ZeroAddress);
  const pos = await inputNumberAsync('起始位置');
  const count = await inputNumberAsync('数量');
  for (let i = 0; i < Number(count); i++) {
    const value = await provider.getStorage(addr, Number(pos) + i);
    if (isHexString(value)) {
      console.log(`Slot ${Number(pos) + i}: ${value} - Decoded: `, parseInt(value, 16));
    } else {
      console.log(`Slot ${Number(pos) + i}: ${value}`);
    }
  }
})();
