const mongoose = require('mongoose');

const Account = new mongoose.Schema({
  address: { type: String, lowercase: true, index: true, unique: true }, // address
  privkey: { type: String, required: true },
});

module.exports = {
  Account: mongoose.model('Account', Account),
};
