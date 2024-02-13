const mongoose = require('mongoose');

const connectDB = async (dbName) => {
  const { MONGO_PATH, MONGO_USER, MONGO_PWD, MONGO_SSL_CA } = process.env;

  console.log(`connect to DB path: ${MONGO_PATH}/${dbName}`);
  let url = `mongodb://${MONGO_USER}:${MONGO_PWD}@${MONGO_PATH}/${dbName}`;
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    sslValidate: false,
    sslCA: undefined,
  };
  let query = {};
  query['retryWrites'] = 'false';
  if (MONGO_SSL_CA != '') {
    query['ssl'] = 'true';
    query['replicaSet'] = 'rs0';
    query['readPreference'] = 'secondaryPreferred';
    // url += '?ssl=true&replicaSet=rs0&readPreference=secondaryPreferred';
    options = {
      ...options,
      sslValidate: true,
      sslCA: MONGO_SSL_CA,
    };
  }
  let queries = [];
  for (const key in query) {
    queries.push(`${key}=${query[key]}`);
  }
  let queryStr = queries.join('&');
  await mongoose.connect(queryStr ? url + '?' + queryStr : url, options);
  // mongoose.set('debug', true);
};

const disconnectDB = async () => {
  return mongoose.disconnect();
};

module.exports = {
  disconnectDB,
  connectDB,
};
