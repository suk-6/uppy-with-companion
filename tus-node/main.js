const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const { Server } = require('@tus/server');
const { FileStore } = require('@tus/file-store');
const fs = require('fs');

const uploadFolder = './files';

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

fastify.register(cors, { origin: ['https://tus.wsuk.dev', 'https://companion.wsuk.dev'], methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', credentials: true })

const tusServer = new Server({
    path: '/files',
    respectForwardedHeaders: true,
    datastore: new FileStore({ directory: './files' })
})

fastify.addContentTypeParser(
    'application/offset+octet-stream', (request, payload, done) => done(null)
);

fastify.all('/files', (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://tus.wsuk.dev");
    res.header("Access-Control-Allow-Credentials", "true");
    tusServer.handle(req.raw, res.raw);
});

fastify.all('/files/*', (req, res) => {
    res.header("Access-Control-Allow-Origin", "https://tus.wsuk.dev");
    res.header("Access-Control-Allow-Credentials", "true");
    tusServer.handle(req.raw, res.raw);
});

fastify.listen({ host: "0.0.0.0", port: 30001 }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});