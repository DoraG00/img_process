`/image`  -- folder to put origin/raw images there
`/dist` -- folder of images which has been processed
## RUN `npm start`

script will process images from /image to /dist

step 1: the image will be categorized by width & height in associated folder named `width_height`

step 2: the image will be processed to 72 dpi & put into subfolder named `72`

this script is served to prepare batch process for photoshop only