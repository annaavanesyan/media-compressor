'use strict';

const path = require('path');
const config = require('nconf');

const defaults = {
    NODE_ENV: 'development'
};

config.argv().env();

let appMode = config.get('NODE_ENV') || defaults.NODE_ENV;

config.file({ file: path.join(__dirname, appMode, 'main.json') });
config.add('common', { type: 'file', file: path.join(__dirname, 'common', 'main.json') });

config.set('params', {
    ...require(path.join(__dirname, 'common', 'params')),
    ...require(path.join(__dirname, appMode, 'params'))
});

config.defaults(defaults);

module.exports = config;
