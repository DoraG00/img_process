require("app-module-path").addPath(__dirname)

const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const sizeOf = require("image-size")
// const db = require('server/service/db')
const redis = require("server/service/redis")
const { isImage, getFile } = require("server/utils/utils")
const { changeDpiDataUrl } = require("server/utils/dpi")
const chalk = require("chalk")
const moveFile = require("move-file")
const Canvas = require("canvas")
const base64ToImage = require("base64-to-image")
const config = require("config")
const debug = require("debug")("app:main")
const log = console.log

let filenames = fs.readdirSync("./image")
let countCategorize = 0
let countDpi = 0

filenames = _.filter(filenames, isImage)

const total = filenames.length
if (total === 0) {
  log(chalk.magentaBright("PLEASE PUT IMAGES INTO /image FOLDER"))
  process.exit(-1)
}

const startProcessImage = async (arr = []) => {
  console.time("PROCESSING START: ")
  const singlePromise = (name) =>
    new Promise((resolve, reject) => {
      try {
        const { width, height } = sizeOf(`./image/${name}`)
        redis.setValueToRedis(`img0$$${name}`, `${width}_${height}_${total}`)
        resolve(name)
      } catch (err) {
        debug("ERROR ENCOURTED: ", err)
        reject(name, err)
      }
    })
  await Promise.all(_.map(arr, singlePromise))
  console.timeEnd(
    chalk.blue(
      "STAGE 1 READING FINISHED: ",
      chalk.yellow(total),
      " IMAGES, ELAPSED: "
    )
  )
  callback && callback()
}

const extractImgInfo = async (imgKeys = []) => {
  const arr = []
  await Promise.all(
    _.map(imgKeys, async (img) => {
      const value = await redis.getValueFromRedis(img)
      const name = img.split("$$")[1]
      if (value) {
        const [width, height, total] = value.split("_")
        arr.push({ name, width, height, total })
      }
    })
  )
  if (imgKeys.length) {
    await redis.removeKeys(imgKeys)
  }
  return arr
}

const blockCategorizeImage = async (fileInfos = []) => {
  const imageGrouped = _.groupBy(
    fileInfos,
    (ele) => `${ele.width}_${ele.height}`
  )

  _.map(Object.keys(imageGrouped), (folderName) => {
    const folderImages = _.get(imageGrouped, folderName, [])
    _.map(folderImages, async (image) => {
      const imgMoved = `./dist/${folderName}/${image.name}`
      try {
        await moveFile(`./image/${image.name}`, imgMoved)
        await redis.setValueToRedis(
          `img1$$${image.name}`,
          `${image.width}_${image.height}_${image.total}`
        )
      } catch (err) {
        debug("MOVING FILE ERROR: ", err)
        log(chalk.red("MOVING FILE ERROR: ", `${folderName}/image.name`, err))
        await redis.setValueToRedis(
          `img0$$${image.name}`,
          `${image.width}_${image.height}_${image.total}`
        )
        throw err
      }
    })
  })
}

const preloadImage = (str) =>
  new Promise((resolve, reject) => {
    const img = new Canvas.Image()
    img.onload = () => {
      resolve(img)
    }
    img.onerror = reject
    img.src = str
  })

const blockDpiImage = async (fileInfos = []) => {
  let count = countDpi * config.img.thresh
  await Promise.all(
    _.map(
      fileInfos,
      (image, index) =>
        new Promise((resolve, reject) => {
          const { width, height, total } = image
          const folderName = `${width}_${height}`

          try {
            const data = fs.readFileSync(
              path.join(__dirname, "dist", `${folderName}`, `${image.name}`)
            )
            count += 1
            preloadImage(data)
              .then((img) => {
                const canvas = Canvas.createCanvas(width, height)
                const context = canvas.getContext("2d")
                context.drawImage(img, 0, 0, width, height)

                const dataUrl = canvas.toDataURL()
                log(
                  chalk.yellow("PROCESSING ... ", count),
                  chalk.blue("FOLDER: ", folderName),
                  chalk.cyan("SUBINDEX", index),
                  chalk.magenta("FILENAME: ", image.name),
                  chalk.yellow("REMAIN: ", total - count)
                )
                const dpiThresh = config.img.dpi
                const img72 = changeDpiDataUrl(dataUrl, dpiThresh)
                const [filename, type] = image.name.split('.')
                const dir = path.join(__dirname, "dist", `${folderName}`, dpiThresh)
                if (!fs.existsSync(dir)) {
                  fs.mkdirSync(dir)
                }
                base64ToImage(img72, path.join(dir, "/"), {
                  fileName: `${dpiThresh}_${filename}`,
                  type,
                })
                resolve(true)
                // moveFile(imgMoved, `./image/${image.name}`)
              })
              .catch((error) => {
                debug("PRELOAD IMG FAILED: ", error)
                reject(error)
              })
          } catch (err) {
            debug("READING FILE ERROR: ", err)
            reject(err)
          }
        })
    )
  )
}

const startCategorize = () => {
  console.time(chalk.green("CATEGORIZING START: "))
  const stream = redis.scanStream({
    match: "*img0$$*",
    count: config.img.thresh,
  })

  stream.on("data", async (resultKeys) => {
    if (_.isEmpty(resultKeys)) return

    stream.pause()
    const blockInfo = await extractImgInfo(resultKeys)
    await blockCategorizeImage(blockInfo)
    countCategorize += 1
    stream.resume()
    log(
      chalk.blue("CATERGORIZING: "),
      chalk.yellow(countCategorize * config.img.thresh)
    )
  })

  stream.on("end", function () {
    console.timeEnd(
      chalk.blue(
        "STAGE 2 CATEGORIZING FINISHED: ",
        countCategorize * config.img.thresh,
        " ELAPSED: "
      )
    )
    if (config.img.dpiProcess) {
      startDpiProcess()
    } else {
      process.exit(0)
    }
  })
}

const startDpiProcess = () => {
  console.time("DPI PROCESS START: ")
  const stream = redis.scanStream({
    match: "*img1$$*",
    count: config.img.thresh,
  })

  stream.on("data", async (resultKeys) => {
    if (_.isEmpty(resultKeys)) return

    stream.pause()
    const blockInfo = await extractImgInfo(resultKeys)
    await blockDpiImage(blockInfo)
    countDpi += 1
    stream.resume()
  })

  stream.on("end", function () {
    console.timeEnd(
      chalk.blue(
        "STAGE 3 DPI PROCESS FINSIHED: ",
        countDpi * config.img.thresh,
        " ELAPSED: "
      )
    )
    process.exit(0)
  })
}

const callback = () => {
  if (config.img.categorize) {
    startCategorize()
  }
}

startProcessImage(filenames, callback)
