/*jslint node: true*/

var sio = require('socket.io'),
	uuid = require('node-uuid'),
	http = require('http'),
	fs = require('fs'),
	zlib = require("zlib"),
	Game = require("../common/game.js").Game,
	scoring = require("./scoring.js");

var server = http.createServer(function (request, response) {
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
	socket.on("list", function (data, cb) {
		socket.join("list");
		cb(games_pending);
	});
	socket.on("create", function (data, cb) {
		
		var id = uuid.v4();
		socket.player = 1;
		socket.game_id = id;
		socket.leave("list");
		socket.join(id);
		games_pending[id] = {name: data.name, size: data.size, nplayers: data.nplayers, connected_players: 1, pseudos: [data.pseudo]};
		io.sockets.to("list").emit("e", {action: "update_list", data: games_pending});
		cb.call(this, {
			id: id,
			player: socket.player
		});
	});
	socket.on("enter", function (data, cb) {
		
		games_pending[data.id].connected_players += 1;
		games_pending[data.id].pseudos.push(data.pseudo);
		socket.player = games_pending[data.id].connected_players;
		socket.leave("list");
		socket.join(data.id);
		
		cb.call(cb, {player: socket.player, size: games_pending[data.id].size, nplayers: games_pending[data.id].nplayers});
		
		if (games_pending[data.id].connected_players === games_pending[data.id].nplayers) {
			running_games[data.id] = {name: games_pending[data.id].name, pseudos: games_pending[data.id].pseudos, game: new Game(games_pending[data.id].size, function() {}, games_pending[data.id].nplayers), config: {size: games_pending[data.id].size, nplayers: games_pending[data.id].nplayers}};
			io.sockets.to(data.id).emit("e", {action: "begin", data: games_pending[data.id].pseudos});
			
			
			delete games_pending[data.id];
		}
		io.sockets.to("list").emit("e", {action: "update_list", data: games_pending});
	});
	socket.on("play", function (data, cb) {
		
		if (running_games[data.id].game.play(socket.player, data.x, data.y)) {
			socket.to(data.id).emit("e", {action: "play", player: socket.player, id: data.id, x: data.x, y: data.y});
			cb(true);
		} else {
			cb(false);
		}
		if (running_games[data.id].game.isFinished()) {
			scoring.push_scores(running_games[data.id].pseudos, running_games[data.id].game.scores(), running_games[data.id].config);
			delete running_games[data.id];
		}
	});
	socket.on("scores", function(data, cb) {
		scoring.get_scores(cb);
	});
	socket.on("disconnect", function () {
		delete running_games[socket.game_id];
		delete games_pending[socket.game_id];
		io.sockets.to("list").emit("e", {action: "update_list", data: games_pending});
	});
});

