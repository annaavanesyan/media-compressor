'use strict';

const _extend = require('lodash/extend');
const _isString = require('lodash/isString');
const HttpStatus = require('http-status-codes');

module.exports = () => async (ctx, next) => {
    await next();

    if (_isString(ctx.body)) {
        ctx.body = {
            message: ctx.body
        };
    }

    ctx.status = ctx.status || HttpStatus.NOT_FOUND;

    ctx.body = _extend(
        {},
        {
            statusName: HttpStatus.getStatusText(ctx.status),
            statusCode: ctx.status
        },
        ctx.body
    );
};
