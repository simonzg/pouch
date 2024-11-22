#!/usr/bin/env node
const { connectDB, disconnectDB } = require('../db');
const { Account } = require('../model/account');
const { default: PromisePool } = require('@supercharge/promise-pool');
const { default: axios } = require('axios');
require('dotenv').config();
const fs = require('fs');

(async () => {
  await connectDB('rtxdb');
  const count = await Account.count({ scaned: { $exists: false } });
  console.log(`count: ${count}`);
  const limit = 5000;
  for (let i = 0; i < count; i += limit) {
    console.log(`scanning accounts ${i} to ${i + limit}`);
    const skip = i;
    const accounts = await Account.find({ scaned: { $exists: false } })
      .skip(skip)
      .limit(limit);
    await PromisePool.withConcurrency(50)
      .for(accounts)
      .process(async (acct, index, pool) => {
        console.log(`check ${acct.address}`);
        const info = await axios.get(`http://mainnet.meter.io/accounts/${acct.address}`);
        if (info && info.data) {
          const mtr = Number(info.data.energy);
          const mtrg = Number(info.data.balance);
          if (mtr > 0 || mtrg > 0) {
            fs.writeFileSync(`${acct.address}`, JSON.stringify({ mtr, mtrg }, null, 2));
          }
        }
      });
  }
  await disconnectDB();
})();
