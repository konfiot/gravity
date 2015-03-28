/*jslint node: true*/

var sio = require('socket.io'),
    uuid = require('node-uuid'),
    http = require('http'),
    fs = require('fs'),
    zlib = require("zlib");

var server = http.createServer(function (request, response) {
    'use strict';
    var filename = "index.html",
        encoding = "identity",
        acceptEncoding = request.headers['accept-encoding'],
        raw;

    if (!acceptEncoding) {
        acceptEncoding = '';
    }

    /*jslint nomen: true */
    raw = fs.createReadStream(__dirname + '/../client/' + filename);
    /*jslint nomen: false */

    if (acceptEncoding.match(/\bgzip\b/)) {
        encoding =  'gzip';
        raw = raw.pipe(zlib.createGzip());
    } else if (acceptEncoding.match(/\bdeflate\b/)) {
        encoding = "deflate";
        raw = raw.pipe(zlib.createDeflate());
    }

    if (request.url === '/') {
        response.writeHead(200, {
            'Content-Type': 'text/html',
            'Cache-Control': 'max-age=' + 86400000 * 7,
            'content-encoding': encoding
        });
        raw.pipe(response);
    } else {
        response.writeHead(404);
        response.end();
    }
});

server.listen(parseInt(process.env.PORT || 1337, 10));

var io = sio.listen(server);


/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
	'use strict';
});

