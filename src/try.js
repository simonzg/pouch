const { JsonRpcProvider } = require('ethers');
const fs = require('fs');

let rows = [];
(async function () {
  for (const addr of ['0xe59B0Fd9b4D3E449f6E4B76A0872EAAC041042B6', '0x4A74C4110726Ac162558062250c671B2BdB17c07']) {
    rows.push(`Checking Address ${addr}`);
    const provider = new JsonRpcProvider('http://localhost:8545');
    const pos = 0;
    const count = 500;
    for (let i = 0; i < Number(count); i++) {
      const value = await provider.getStorage(addr, Number(pos) + i, (blockTag = 62995079));
      rows.push(`Slot ${Number(pos) + i}: ${value}`);
    }
    rows.push('');
  }

  fs.writeFileSync('out.txt', rows.join('\n'));
  console.log('DONE.');
})();
