'use strict';

const fileType = require('file-type');
const readChunk = require('read-chunk');

const { _get, _isArray, _isObject } = require('../components/lodash');

const basicFile = {
    minimumBytes: 4100
};

async function validateFile(file) {
    const fileInfo =
        fileType(readChunk.sync(file.path, 0, basicFile.minimumBytes)) || {};

    return {
        mime: fileInfo.mime ? fileInfo.mime : '',
        ext: fileInfo.ext ? fileInfo.ext : '',
        path: file.path ? file.path : '',
        size: file.size ? file.size : '',
        name: file.name ? file.name : '',
    };
}

async function normalizeFile(ctx, next) {
    if (ctx.request.type === 'multipart/form-data') {
        for (let key of Object.keys(ctx.request.files)) {
            const value = _get(ctx.request.files, key);
            if (_isArray(value)) {
                ctx.request.files[key]= []

                for (let item of value) {
                    ctx.request.files[key].push(await validateFile(item));
                }
            } else if (_isObject(value)) {
                ctx.request.files[key] = await validateFile(value);
            }
        }
    }

    await next();
}

module.exports = normalizeFile;
