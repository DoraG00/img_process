const _ = require('lodash')

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