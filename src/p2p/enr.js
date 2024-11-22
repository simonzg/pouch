#!/usr/bin/env node
const { ENR } = require('@ethereumjs/devp2p');

if (process.argv.length < 3) {
  console.log(`[Usage] enr 'enr-string'`);
  process.exit(-1);
}

const enrString = process.argv[2];
console.log(`input is string: ${enrString}`);

// Decode the ENR
const enr = ENR.parseAndVerifyRecord(enrString);

// Extract information
const nodeId = enr.id;
const ip = enr.address;
const udpPort = enr.udpPort;
const tcpPort = enr.tcpPort;

console.log('Node ID:', nodeId);
console.log('IP:', ip);
console.log('UDP Port:', udpPort);
console.log('TCP Port:', tcpPort);
