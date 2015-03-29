/*jslint node: true*/

var sio = require('socket.io'),
	uuid = require('node-uuid'),
	http = require('http'),
	fs = require('fs'),
	zlib = require("zlib"),
	Game = require("../common/game.js").Game;

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

var 	games_pending = {},
	running_games = {};

/* ---------------------------- Listening sockets ---------------------------- */

io.sockets.on('connection', function (socket) {
	'use strict';
	socket.on("list", function (data, cb) {
		'use strict';
		cb(games_pending);
	});
	socket.on("create", function (data, cb) {
		'use strict';
		var id = uuid.v4();
		socket.player = 1;
		socket.id = id;
		games_pending[id] = {name: data.name, size: data.size, cb: function () {
			cb({id: id, player: socket.player});
		}};
	});
	socket.on("enter", function (data, cb) {
		'use strict';
		running_games[data.id] = {name: games_pending[data.id].name, game: new Game(games_pending[data.id].size, function(){})};
		games_pending[data.id].cb.call(this);
		socket.player = 2;
		cb({player: socket.player, size: games_pending[data.id].size});
		delete games_pending[data.id];
	});
	socket.on("play", function (data, cb) {
		'use strict';
		if (running_games[data.id].game.play(socket.player, data.x, data.y)){
			socket.broadcast.emit("e", {action: "play", player: socket.player, id: data.id, x: data.x, y: data.y});
			cb(true);
		} else {
			cb(false);
		}
		if (running_games[data.id].game.isFinished()){
			delete running_games[data.id];
		}
	});
	socket.on("disconnect", function () {
		delete running_games[socket.id];
		delete games_pending[socket.id];
	});
});

