'use strict';

const _get = require('lodash/get');
const _forOwn = require('lodash/forOwn');
const _isArray = require('lodash/isArray');
const _isObject = require('lodash/isObject');
const _isFunction = require('lodash/isFunction');


const { Sequelize, sequelize } = require('../data/models');

let options = {};

async function serializeModel(model) {
    if (model instanceof Sequelize.Model) {
        if (_isFunction(model.fields)) {
            model = await model.fields(sequelize.models, options);
        }

        if (_isFunction(model.get)) {
            model = model.get();
        }
    }

    for (let value in model) {
        if (model.hasOwnProperty(value)) {
            let field = model[value];

            if (_isArray(field)) {
                model[value] = await serializeModels(field);
            } else if (_isObject(field)) {
                model[value] = await serializeModel(field);
            }
        }
    }

    return model;
}

async function serializeModels(models) {
    for (let index in models) {
        if (models.hasOwnProperty(index)) {
            let field = models[index];

            if (_isArray(field)) {
                models[index] = await serializeModels(field);
            } else if (_isObject(field)) {
                models[index] = await serializeModel(field);
            }
        }
    }

    return models;
}

async function serialize(data) {
    if (_isArray(data)) {
        data = await serializeModels(data);
    } else if (_isObject(data)) {
        data = await serializeModel(data);
    }

    return data;
}

module.exports = params => {
    return async function(ctx, next) {
        await next();

        if (ctx.method === 'HEAD') {
            ctx.body = undefined;
        } else if (ctx.body) {
            _forOwn(_get(params, 'options'), (value, key) => {
                options[key] = _get(ctx, value);
            });

            // TODO: fields = _words(ctx.request.query.fields, /[^, ]+/g);
            ctx.body = await serialize(ctx.body);
        }
    };
};

module.exports.serializeModel = serializeModel;
