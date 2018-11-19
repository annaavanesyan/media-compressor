'use strict';

const _isEmpty = require('lodash/isEmpty');
const _snakeCase = require('lodash/snakeCase');
const HttpStatus = require('http-status-codes');

const VALIDATION_ERROR_NAMES = [
    'SequelizeUniqueConstraintError',
    'SequelizeValidationError',
    'SequelizeDatabaseError',
    'ValidationError'
];

module.exports = () => async (ctx, next) => {
    try {
        await next();
    } catch (ex) {
        let exceptions = [];
        if (ex.name === 'AggregateError') {
            for (let err of Array.from(ex)) {
                exceptions.push(...err.errors.errors);
            }
        } else if (VALIDATION_ERROR_NAMES.includes(ex.name)) {
            if (_isEmpty(ex.errors)) {
                exceptions = [ex.original];
            } else {
                exceptions = ex.errors;
            }
        }

        if (!_isEmpty(exceptions)) {
            let errors = [];

            if (ex && !_isEmpty(exceptions)) {
                for (let err of Object.values(exceptions)) {
                    let message;

                    if (err.kind === 'user defined') {
                        message = err.message;
                    } else {
                        message = err.kind || err.message;
                    }

                    errors.push({
                        field: err.path || err.constraint,
                        message: _snakeCase(
                            `err_${message.toLocaleLowerCase()}`
                        )
                    });
                }
            }

            ctx.status = HttpStatus.UNPROCESSABLE_ENTITY;
            return (ctx.body = {
                statusName: HttpStatus.getStatusText(ctx.status),
                statusCode: ctx.status,
                message: 'ValidationError',
                errors
            });
        }

        console.error(ex);

        ctx.status = HttpStatus.INTERNAL_SERVER_ERROR;
        ctx.body = {
            statusName: HttpStatus.getStatusText(ctx.status),
            statusCode: ctx.status
        };
    }
};
