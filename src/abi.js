const fs = require('fs');
const path = require('path');
require('dotenv').config();

const getABI = (name, app) => {
  const abiDir = path.join(__dirname, '..', '..');
  const paths = [];
  if (app) {
    paths.push({ base: path.join(abiDir, 'abi'), name: app });
  } else {
    paths.push({ base: abiDir, name: 'abi' });
  }
  while (paths.length > 0) {
    const p = paths.shift();

    if (!p) {
      break;
    }
    const filepath = path.join(p.base, p.name);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(filepath);
      paths.push(...files.map((f) => ({ base: filepath, name: f })));
    } else if (stat.isFile() && filepath.endsWith('.json')) {
      const j = JSON.parse(fs.readFileSync(filepath).toString());
      if ('contractName' in j && 'abi' in j) {
        if (name === j['contractName']) {
          // console.log(`found ABI definition in ${filepath}`);
          return j['abi'];
        }
      }
    }
  }
  throw new Error(`无法找到ABI文件: ${name}`);
};

const getAllABIs = () => {
  const abiMap = getABIMapInApp('');
  return Object.values(abiMap);
};

const getABIMapInApp = (app) => {
  const results = {};
  const abiDir = process.env.ABI_DIR;
  const paths = [];
  if (app) {
    paths.push({ base: path.join(abiDir, 'abi'), name: app });
  } else {
    paths.push({ base: abiDir, name: 'abi' });
  }
  while (paths.length > 0) {
    const p = paths.shift();

    if (!p) {
      break;
    }
    const filepath = path.join(p.base, p.name);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      const files = fs.readdirSync(filepath);
      paths.push(...files.map((f) => ({ base: filepath, name: f })));
    } else if (stat.isFile() && filepath.endsWith('.json')) {
      const j = JSON.parse(fs.readFileSync(filepath).toString());
      if ('contractName' in j && 'abi' in j) {
        results[j['contractName'].toString()] = j['abi'];
      }
    }
  }
  return results;
};

module.exports = {
  getAllABIs,
};
