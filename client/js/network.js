function GameClient(socket, begin_cb){
	'use strict';

	this.player = -1;
	this.begin_cb = begin_cb;
	
	parent = this;
	this.socket = socket;
	this.socket.on('e', function (data) {
		parent.update(data);
	});
}

GameClient.prototype.list = function(cb){
	this.list_cb = cb;
	this.socket.emit("list", {}, cb);
};

GameClient.prototype.create = function(name, size, nplayers, pseudo, cb){
	parent = this;
	console.log(pseudo);
	this.socket.emit("create", {name: name, size: size, nplayers: nplayers, pseudo: pseudo}, function (data) {
		parent.id = data.id;
		parent.player = data.player;
		cb(data);
	});
};

GameClient.prototype.setGame = function (game) {
	this.game = game;
};

GameClient.prototype.enter = function(id, pseudo, cb){
	parent = this;
	this.id = id;
	this.socket.emit("enter", {id: id, pseudo: pseudo}, function (data) {
		parent.player = data.player;
		cb(data);
	});
};

GameClient.prototype.play = function(x,y){
	if(this.game.play(this.player, x,y)){ 
		this.socket.emit("play", {id: this.id, x: x, y: y}, function (worked) {
			
		});
	}
};

GameClient.prototype.update = function (e){
	console.log("Got sthg");
	switch(e.action){
		case "play":
			if (e.id === this.id){
				this.game.play(e.player, e.x, e.y, true);
			}
		break;
		case "update":
			this.game.update(e.state);
		break;
		case "begin":
			this.begin_cb.call(this, e.data);
		break;
		case "update_list":
			this.list_cb.call(this, e.data)
		break;
	}
};
