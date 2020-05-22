const _ = require('lodash')
const chalk = require('chalk')
const { createCanvas, loadImage } = require('canvas')
const { changeDpiDataUrl, changeDpiBlob } = require('changedpi')
// const streamSaver = require('streamsaver')
const config = require('config')
const log = console.log

// const srcToBlob = (src, width, height, dpi) => {
//   const canvas = createCanvas(width, height);
//   const context = canvas.getContext('2d');
//   loadImage(src).then(image => {
//     context.drawImage(image, 0, 0, width, height);
//     context.toBlob(blob => {
//       changeDpiBlob(blob, dpi).then(bblob => {
//         // streamSaver.createWriteStream()
//       })
//     })
//   }).catch(err => {
//     log(chalk.red('=== IMG LOAD FAILED ===', JSON.stringify(err)))
//   })
// }

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
  getFile,
  ensureDir,
  isImage
}