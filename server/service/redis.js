const config = require("config")
const Redis = require("ioredis")
const chalk = require("chalk")
const log = console.log

const Client = new Redis(config.redis)

const { port, host } = config.redis

Client.connect(() => log(chalk.magenta(`REDIS connected on ${host}:${port}`)))

Client.setValueToRedis = async (key, value) => {
  if (typeof value === "string") {
    Client.set(key, value)
  } else {
    Client.set(key, JSON.stringify(value))
  }
}

Client.getValueFromRedis = async (key) => {
  return Client.get(key)
}

Client.removeKeys = async (keys) => {
  const pipeline = Client.pipeline()
  keys.forEach((key) => {
    pipeline.del(key)
  })
  await pipeline.exec()
}

module.exports = Client
