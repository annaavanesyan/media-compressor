'use strict';

const { _get, _compact, _castArray, _includes, _isEmpty } = require('../components/lodash');
const { ErrorMessages, ValidMedia } = require('../constants');
const { Clean, FileCompressor} = require('../components');

class Compressor {
    static async compressFile(ctx) {
        const medias = _compact(_castArray(_get(ctx, 'request.files.media')));
        const dimesions = Clean.validateDimensions(ctx.request.body.dimensions)
        const inputMediaCount = medias.length;
        const mediaKeys = [];

        if (_isEmpty(medias)) {
            return ctx.badRequest(ErrorMessages.MEDIA_REQUIRED);
        }

        medias.filter(
            media =>
                media.path &&
                media.size <= ValidMedia.maxSize &&
                (_includes(ValidMedia.imageExt, media.ext) ||
                    _includes(ValidMedia.videoExt, media.ext))
        );

        if (_isEmpty(medias)) {
            return ctx.badRequest(ErrorMessages.INVALID_MEDIA);
        }

        for (let media of medias) {
            const isVideo = _includes(ValidMedia.videoExt, media.ext);

            const key = isVideo
                ? await FileCompressor.compressVideo(media, dimesions)
                : await FileCompressor.compressImage(media, dimesions);

            mediaKeys.push(key)
        }

        return ctx.created({
            data: {
                totalCompressed: medias.length,
                totalFailed: inputMediaCount - medias.length,
                links: mediaKeys
            }
        });
    }
}

module.exports = Compressor;
