const debug = require('debug')('app:config')

const dbSettings = {
  url: "http://192.168.100.142:27017",
  opts: {},
}

const redisSetting = {
  host: process.env.REDIS_HOST || "192.168.100.179",
  port: process.env.REDIS_PORT || 6379,
}

const imgSetting = {
  categorize: true,
  dpiProcess: false,
  dpi: 72,
  thresh: 100
}

const appSetting = {
  port: process.env.PORT || 5000,
}

const config = Object.assign(
  {},
  { db: dbSettings },
  { img: imgSetting },
  { redis: redisSetting },
  { app: appSetting }
)

debug(config)

module.exports = config