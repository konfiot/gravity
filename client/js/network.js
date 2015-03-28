function GameClient(game, player){
	this.game = game;
	this.socket = io();
	this.socket.on('e', this.update);
	this.player = player;
}

GameClient.prototype.list = function(cb){
	this.socket.emit("list", cb);
};

GameClient.prototype.create = function(cb){
	this.socket.emit("create", cb);
};

GameClient.prototype.enter = function(id, cb){
	this.socket.emit("enter", {id: id}, cb);
};

GameClient.prototype.play = function(x,y){
	if(this.game.play(this.player, x,y)){ 
		this.socket.emit("play", {x: x, y: y});
	}
};

GameClient.prototype.update = function(e){
	switch(e.action){
		case "play":
			this.game.play(e.player, e.x, e.y);
		break;
		case "update":
			this.game.update(e.state);
		break;
	}
};
