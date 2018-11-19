'use strict';

const uuid = require('uuid/v4');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const _trim = require('lodash/trim');
const randomString = require('randomstring');

class Security {
    /**
     * @param options
     */
    static generateRandomString(options = 32) {
        return randomString.generate(options);
    }

    /**
     * @return {*}
     */
    static generateRandomKey(options = 16) {
        return crypto.randomBytes(options).toString('hex');
    }

    /**
     * @param password
     * @param options
     * @return {Promise<*>}
     */
    static generatePasswordHash(password, options = 10) {
        return bcrypt.hash(password, options);
    }

    /**
     * @param password
     * @param hash
     * @return {Promise<*>}
     */
    static validatePassword(password, hash) {
        return hash && bcrypt.compare(password, hash);
    }

    /**
     * @param password
     * @return {*}
     */
    static cleanPassword(password) {
        return _trim(password).replace(/ /g, '');
    }

    /**
     * @return {*}
     */
    static generateUuid() {
        return uuid();
    }
}

module.exports = Security;
