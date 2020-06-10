ENV node -v 10.6.3

## Step 1: create folders at root directory
`/image`  -- folder to put origin/raw images there
`/dist` -- folder of images which has been processed

## Step 2: put images into `/images` folder(NO SUBFILERS)

## Step 3: edit /config/index.js to connect redis

## Step 4: RUN `npm start`
script will process images from /image to /dist

step 1: the image will be categorized by width & height in associated folder named `width_height`

step 2: the image will be processed to 72 dpi & put into subfolder named `72`

this script is served to prepare batch process for photoshop only