function GameClient(){
	'use strict';

	this.player = -1;
	parent = this;
	this.socket = io("@@URL_SOCKETIO_SERVER");
	this.socket.on('e', function (data) {
		parent.update(data);
	});
}

GameClient.prototype.list = function(cb){
	this.socket.emit("list", {}, cb);
};

GameClient.prototype.create = function(name, size, cb){
	parent = this;
	this.socket.emit("create", {name: name, size: size}, function (data) {
		parent.id = data.id;
		parent.player = data.player;
		cb(data);
	});
};

GameClient.prototype.setGame = function (game) {
	this.game = game;
};

GameClient.prototype.enter = function(id, cb){
	parent = this;
	this.id = id;
	this.socket.emit("enter", {id: id}, function (data) {
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
	switch(e.action){
		case "play":
			if (e.id === this.id){
				this.game.play(e.player, e.x, e.y, true);
			}
		break;
		case "update":
			this.game.update(e.state);
		break;
	}
};