const _ = require('lodash')
const chalk = require('chalk')
const { createCanvas, loadImage } = require('canvas')
const { changeDpiDataUrl, changeDpiBlob } = require('changedpi')
const config = require('config')
const log = console.log

const toCanvas = (src, width, height) => {
  const canvas = createCanvas(width, height)
  loadImage(src).then(image => {

  }).catch(err => {
    log(chalk.red('=== IMG LOAD FAILED ===', JSON.stringify(err)))
  })
}

function getFile(filename) {
  return fs.readFileAsync(filename, 'utf8');
}

function isImage(src) {
  let type = _.get(src.split('.'), '1', '')
  if(!src || !type) {
    return false;
  }
  type = type.toLowerCase()
  return type === 'jpg' || type === 'jpeg' || type === 'png'
}

function ensureDir(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDir(dirname);
  fs.mkdirSync(dirname);
}

module.exports = {
  toCanvas,
  getFile,
  ensureDir,
  isImage
}