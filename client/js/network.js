function GameClient (socket, begin_cb, end_cb) {
	this.player = -1;
	this.begin_cb = begin_cb;
	this.end_cb = end_cb;

	that = this;
	this.socket = socket;
	this.socket.on("e", function (data) {
		that.update(data);
	});
	this.socket.on("disconnect", function () {
		alert("You have been disconnected, trying to reconnect");
	});
	this.socket.on("reconnect", function () {
		alert("Reconnection - OK - Resyncing");
		socket.emit("resync", {player: that.player, id: that.id});
	});
}

GameClient.prototype.list = function (cb) {
	this.list_cb = cb;
	this.socket.emit("list", {}, cb);
};

GameClient.prototype.create = function (size, nplayers, pseudo, cb) {
	that = this;
	console.log(pseudo);
	this.socket.emit("create", {name: pseudo, size: size, nplayers: nplayers, pseudo: pseudo}, function (data) {
		that.id = data.id;
		that.player = data.player;
		cb(data);
	});
};

GameClient.prototype.setGame = function (game) {
	this.game = game;
};

GameClient.prototype.enter = function (id, pseudo, cb) {
	that = this;
	this.id = id;

	if (pseudo === "") {
		cb(false);
	}

	this.socket.emit("enter", {id: id, pseudo: pseudo}, function (data) {
		that.player = data.player;
		cb(data);
	});
};

GameClient.prototype.play = function (x, y) {
	if (this.game.play(this.player, x, y)) {
		this.socket.emit("play", {id: this.id, x: x, y: y}, function (worked) {});
	}
};

GameClient.prototype.update = function (e) {
	console.log("Got sthg");

	switch (e.action) {
		case "play":
			if (e.id === this.id) {
				this.game.play(e.player, e.x, e.y, true);
			}
		break;

		case "update":
			this.game.import(e.data);
			this.game.update();
			alert("Resynced");
		break;

		case "begin":
			this.begin_cb.call(this, e.data, this.game);
		break;

		case "update_list":
			this.list_cb.call(this, e.data);
		break;

		case "end_scores":
			console.log("End_score");
			this.end_cb.call(this, e.data);
		break;
	}
};
