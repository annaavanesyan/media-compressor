'use strict';

const Router = require('koa-router');

const Compressor = require('../../handlers/Compressor');
const normalizeFile = require('../../middlewares/normalizeFile');

const router = new Router({});

router.post('/', normalizeFile, Compressor.compressFile);

module.exports = router;
