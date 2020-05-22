require('app-module-path').addPath(__dirname);

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const sizeOf = require('image-size');
// const db = require('server/service/db')
const { isImage, getFile } = require('server/utils/utils')
const { changeDpiDataUrl } = require('server/utils/dpi')
const chalk = require('chalk')
const moveFile = require('move-file');
const Canvas = require('canvas')
const base64ToImage = require('base64-to-image')
// const { changeDpiDataUrl, changeDpiBlob } = require('changedpi')
// const { saveAs } = require('file-saver')
const gm = require('gm')
const log = console.log

let filenames = fs.readdirSync('./image');

filenames = _.filter(filenames, isImage)

const fileInfos = _.map(filenames, name => {
  const { width, height } = sizeOf(`./image/${name}`)
  return { name, width, height }
})
const imageGrouped = _.groupBy(fileInfos, ele => `${ele.width}_${ele.height}`);
log(chalk.blueBright('GROUPED INTO ', Object.keys(imageGrouped).length, ' CATEGORIES'))

let count = 0
_.map(Object.keys(imageGrouped), folderName => {
  const folderImages = _.get(imageGrouped, folderName, []);
  _.map(folderImages, async (image, index) => {
    const imgMoved = `./dist/${folderName}/${image.name}`;
    await moveFile(`./image/${image.name}`, imgMoved);
    const { width, height } = image;
    fs.readFile(path.join(__dirname, 'dist', `${folderName}`, `${image.name}`), (err, data) => {
      if(err) {
        throw err
      };
      count += 1;
      const img = new Canvas.Image;
      img.src = data;
      const canvas = Canvas.createCanvas(width, height);
      const context = canvas.getContext('2d');
      context.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/png')
      log(chalk.yellow('PROCESSING ... ', folderName, index, image.name, count))

      const img72 = changeDpiDataUrl(dataUrl, 72);
      const filename = image.name.substring(0, image.name.length - 4)
      const dir = path.join(__dirname, 'dist', `${folderName}`, '72');
      if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
      }
      base64ToImage(
        img72,
        path.join(dir, '/'),
        {'fileName': `72_${filename}`, 'type':'png'}
      );
      // moveFile(imgMoved, `./image/${image.name}`)
    })
  })
})