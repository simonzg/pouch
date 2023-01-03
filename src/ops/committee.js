#!/usr/bin/env node

const axios = require('axios');
const { REST_BASE, API_BASE } = require('./config');

let epoch = 0;
epoch = Number(process.argv[2]) || 0;

(async () => {
  if (epoch === 0) {
    const best = await axios.get(`${REST_BASE}/blocks/best`);
    epoch = Number(best.data.epoch);
  }
  console.log(`Get committee for epoch ${epoch}`);
  const epochRes = await axios.get(`${API_BASE}/api/epochs/${epoch}`);
  const { summary } = epochRes.data;

  const cans = await axios.get(`${REST_BASE}/staking/candidates?revision=${Number(summary.startKBlock) - 1}`);
  const firstMB = await axios.get(`${REST_BASE}/blocks/${Number(summary.startKBlock)}`);
  let canMap = {};
  for (const c of cans.data) {
    const ecdsaPK = c.pubKey.split(':::')[0];
    canMap[ecdsaPK] = c;
  }
  let committee = [];
  for (const m of firstMB.data.committee) {
    if (m.pubKey in canMap) {
      committee.push({ foundCandidate: true, ...canMap[m.pubKey], index: m.index });
    } else {
      console.log(`could not find candidate info for:`, m);
      committee.push({ foundCandidate: false, ...m });
    }
  }

  for (const m of committee) {
    if (m.foundCandidate) {
      console.log(m.index, m.address, ' - ', m.name, m.ipAddr);
    } else {
      console.log(m.index, '!!UNKNOWN', ' - ', m.netAddr, m.pubKey);
    }
  }
})();
