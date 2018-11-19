'use strict';

const fs = require('fs')
const path = require('path')
const sharp = require('sharp');
const emptyDir = require('empty-dir')
const ffmpeg = require('fluent-ffmpeg');

const { _toString } = require('./lodash');
const FileSaver = require('./FileSaver');
const Security = require('./Security');

const OUTPUT_PATH = '/files/out';

class FileCompressor {
    static async compressImage(image, dimensions) {
        try {
            const finalImage = await sharp(image.path)
                .png({ compressionlevel: 9, force: false })
                .jpeg({ compressionlevel: 9, force: false })
                .tiff({ compressionlevel: 9, force: false })
                .toFile(image.path);

            if (dimensions) {
                finalImage = finalImage
                    .resize(dimensions[0], dimensions[1])
                    .max();
            }

            return(FileSaver.saveFile(finalImage))
        } catch (error) {
            return(FileSaver.saveFile(image))
        }     
    }

    static async compressVideo(video, dimensions) {

        const accessKey = Security.generateRandomString(10)
        const mediaPath = path.join(__dirname, `..${OUTPUT_PATH}`, accessKey)

        try {

            fs.mkdirSync(mediaPath)
           
            const finalVideo = await ffmpeg(video.path)
                .screenshots({ count: 3, filename: 'screenshot.png', folder: mediaPath })
                .videoCodec('libx264')
                .save(`${mediaPath}/video.${video.ext}`)
                
            if (dimensions) {
                finalVideo = finalVideo.size(_toString(`${dimensions[0]}x${dimensions[1]}`)).save(OUTPUT_PATH + video.name)
            }

        } catch (error) {
            emptyDir.sync(mediaPath)
            fs.copyFileSync(video.path, `${mediaPath}/video.${video.ext}`)
        }

        return accessKey
    }
}

module.exports = FileCompressor;
