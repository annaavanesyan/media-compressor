'use strict';

const path = require('path')
const sharp = require('sharp');

const Security = require('./Security');

const OUTPUT_PATH = path.join(__dirname, '../files/out')

class FileCompressor {
    static async saveFile(file) {
        const accessKey = Security.generateRandomString(10);

        await sharp(file.path).toFile(`${OUTPUT_PATH}/${Security.generateRandomString(6)}.${file.ext}`);

        return accessKey;
    }
}

module.exports = FileCompressor;
