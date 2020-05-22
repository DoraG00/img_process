const fs = require('fs')
const sizeOf = require('image-size');
// const db = require('server/service/db')
const { isImage, getFile } = require('./utils/utils')
const chalk = require('chalk')
const moveFile = require('move-file');
const log = console.log

fs.readdirAsync = function(dirname) {
  return new Promise(function(resolve, reject) {
      fs.readdirSync(dirname, function(err, filenames){
          if (err) 
              reject(err); 
          else 
              resolve(filenames);
      });
  });
};

// make Promise version of fs.readFile()
fs.readFileAsync = function(filename, enc) {
  return new Promise(function(resolve, reject) {
      fs.readFile(filename, enc, function(err, data){
          if (err) 
              reject(err); 
          else
              resolve(data);
      });
  });
};

const categorizeImage = async () => {
  fs.readdirAsync('../image').then((filenames) => {
    filenames = filenames.filter(isImage);
    return Promise.all(_.map(filenames, name => {
      const { width, height } = sizeOf(`../image/${name}`)
      return { name, width, height }
    }))
  }).then(images => {
    const imageGrouped = _.groupBy(images, ele => `${ele.width}_${ele.height}`);
    log(chalk.grey('GROUPED INTO ', Object.keys(imageGrouped).length, ' CATEGORIES'))
  
    _.map(Object.keys(imageGrouped), folderName => {
      const folderImages = _.map(imageGrouped[folderImages], 'name');
      _.map(folderImages, async imageName => {
        await moveFile(`../image/${imageName}`, `../dist/${folderName}/${imageName}`);
      })
    })
  }).catch(err => {
    log(chalk.red('======== BAD JUJO ===========', err))
  })
}
module.exports = { categorizeImage }