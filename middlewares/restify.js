'use strict';

const _get = require('lodash/get');
const respond = require('koa-respond');
const compose = require('koa-compose');

const errorHandler = require('./errorHandler');
const serializer = require('./serializer');
const negotation = require('./negotation');

module.exports = params =>
    compose([
        respond({
            statusMethods: {
                ok: 200,
                created: 201,
                accepted: 202,
                noContent: 204,
                movedPermanently: 301,
                movedTemporarily: 302,
                notModified: 304,
                unauthorized: 401,
                unsupportedMediaType: 415,
                unprocessableEntity: 422
            }
        }),
        errorHandler(),
        negotation(),
        serializer(_get(params, 'serializer'))
    ]);
