const mongoose = require('mongoose');
const chalk = require('chalk');
const config = require('config');
const schemas = require('../schemas');
const log = console.log;

mongoose.connect(config.db.url, config.db.opts);

mongoose.connection.on('connect', () => {
  log(chalk.greenBright('==============  DB CONNECTTED ==============='))
})

mongoose.connection.on('error', err => {
  log(chalk.redBright('============= DB CONNECTION ERROR ==============='))
  if(err.name === 'MongoNetworkError' || err.name === 'MongoTimeoutError') {
    process.exit(-1);
  }
})

mongoose.connection.on('reconnectFailed', err => {
  log(chalk.red('============= DB RECONNECT FAILED ================='))
  process.exit(-1)
})

const models = {};

for(const key in schemas) {
  models[key.toLowerCase()] = mongoose.model(key, schemas[key])
}

module.exports = models;