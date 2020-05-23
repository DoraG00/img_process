const fs = require('fs')
const path = require('path')
const Canvas = require('canvas');
const { changeDpiDataUrl } = require('./server/utils/dpi')
const base64ToImage = require('base64-to-image')

fs.readFile(__dirname + '/902158870009.png', function(err, data) {
        if (err) throw err;
        var img = new Canvas.Image; // Create a new Image
        img.src = data;

        // Initialiaze a new Canvas with the same dimensions
        // as the image, and get a 2D drawing context for it.
        // var canvas = new Canvas(img.width, img.height);
        var canvas = Canvas.createCanvas(img.width, img.height);
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const dataUrl = canvas.toDataURL()
        const img72 = changeDpiDataUrl(dataUrl, 72);
        // console.log(10, img72)
        const dir = path.join(__dirname, 'dist', 'special', '72');
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, {recursive: true});
        }
        base64ToImage(img72, path.join(dir, '/'), {'fileName': '902158870009', 'type':'png'})
    });
