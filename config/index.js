const db = {
  url: 'http://192.168.100.142:27017',
  opts: {}
}

const img = {
  dpi: 72
}

const app = {
  port: process.env.PORT || 5000
}

module.exports = Object.assign({}, db, img);