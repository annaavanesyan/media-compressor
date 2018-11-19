'use strict';

const Koa = require('koa');
const app = new Koa();
const koaBody = require('koa-body');

const config = require('./config');

/**
 * ############## MIDDLEWARES ##############
 */
app.use(require('@koa/cors')());
app.use(require('koa-static')('public'));
app.use(
    koaBody({
        multipart: true,
        formidable: {
            maxFileSize: config.get('params:validation:maxFileSize')
        }
    })
);
app.use(
    require('./middlewares/restify')({
        serializer: {
            options: {
                userId: 'state.user.id'
            }
        }
    })
);

/**
 * ############## ROUTES ##############
 */
const v1Routes = require('./routes/v1');

app.use(v1Routes.routes());
app.use(v1Routes.allowedMethods());

/**
 * ############## SERVER CONFIGURATION ##############
 */
const port = config.get('server:port');
const server = require('http').createServer(app.callback());

server.listen(port, () => {
    console.info(`Server is running on port : ${port}`);
});
