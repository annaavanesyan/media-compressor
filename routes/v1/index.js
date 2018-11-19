'use strict';

const Router = require('koa-router');

const compressorRoute = require('./compressor');

const router = new Router({});

router.use(compressorRoute.routes());

module.exports = router;
