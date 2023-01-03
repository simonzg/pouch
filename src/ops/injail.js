#!/usr/bin/env node

const axios = require('axios');
const { REST_BASE } = require('./config');
const { writeOutputJSON, writeOutputFile } = require('../utils');

let revision = 0;
revision = Number(process.argv[2]) || 0;

(async () => {
  if (revision === 0) {
    const best = await axios.get(`${REST_BASE}/blocks/best`);
    revision = best.data.number;
  }

  console.log(`Get injail at revision ${revision}`);
  const injailRes = await axios.get(`${REST_BASE}/slashing/injail?revision=${revision}`);

  const cansRes = await axios.get(`${REST_BASE}/staking/candidates?revision=${revision}`);
  let canMap = {};
  cansRes.data.map((c) => {
    canMap[c.pubKey] = c;
  });

  const statsRes = await axios.get(`${REST_BASE}/slashing/statistics?revision=${revision}`);
  let statMap = {};
  statsRes.data.map((s) => {
    statMap[s.pubKey] = s;
  });

  let injailCandidates = [];
  for (const c of injailRes.data) {
    const { pubKey, jailedTime, totalPoints } = c;
    let can = canMap[pubKey] || {};
    can.jailedTime = jailedTime;
    can.totalPoints = totalPoints;
    can.infractions = [];
    const stat = statMap[pubKey];
    if (stat) {
      const i = stat.infractions;
      can.infractions = can.infractions.concat(i.missingLeader.info.map((inf) => ({ ...inf, type: 'missingLeader' })));
      can.infractions = can.infractions.concat(
        i.missingProposer.info.map((inf) => ({ ...inf, type: 'missingProposer' }))
      );
      can.infractions = can.infractions.concat(i.missingVoter.info.map((inf) => ({ ...inf, type: 'missingVoter' })));
      can.infractions = can.infractions.concat(i.DoubleSigner.info.map((inf) => ({ ...inf, type: 'doubleSigner' })));
    }
    injailCandidates.push(can);
  }
  for (const c of injailCandidates) {
    console.log('---------------------------------------------------');
    console.log(`${c.name} [${c.ipAddr}] (totalPoints: ${c.totalPoints})`);
    console.log(c.pubKey);
    console.log(`jailed at: ${new Date(Number(c.jailedTime) * 1000)}`);
    console.log('');
    console.log('Infractions:');
    for (const i of c.infractions) {
      console.log(` - ${i.type} epoch:${i.epoch} height:${i.height}`);
    }
  }
})();
