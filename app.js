require('app-module-path').addPath(__dirname);

const fs = require('fs')
const _ = require('lodash')
const sizeOf = require('image-size');
// const db = require('server/service/db')
const { isImage, getFile } = require('server/utils/utils')
const chalk = require('chalk')
const moveFile = require('move-file');
const log = console.log

let filenames = fs.readdirSync('./image');

filenames = _.filter(filenames, isImage)

const fileInfos = _.map(filenames, name => {
  const { width, height } = sizeOf(`./image/${name}`)
  return { name, width, height }
})
const imageGrouped = _.groupBy(fileInfos, ele => `${ele.width}_${ele.height}`);
log(chalk.blueBright('GROUPED INTO ', Object.keys(imageGrouped).length, ' CATEGORIES'))

_.map(Object.keys(imageGrouped), folderName => {
  const folderImages = _.map(imageGrouped[folderName], 'name');
  _.map(folderImages, async imageName => {
    await moveFile(`./image/${imageName}`, `./dist/${folderName}/${imageName}`);
  })
})