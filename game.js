function Game(size, update){
	this.state = []
	for(var i = 0; i < size; i += 1){
		this.state[i] = Array(size).fill(0)
	}
	this.state[Math.floor(size/2)][Math.floor(size/2)] = -1

	this.update_cb = update

	this.size = size;
}

Game.prototype.checkplay = function (x,y){
	var tries = Array(4).fill(0)
	if (this.state[x][y] != 0){
		return false
	}

	if (x==0 || y==0 || x==this.size-1 || y==this.size-1){
		return true
	}

	for (var i in this.state){
		for (var j in this.state[i]){
			if (x == i && y!= j && this.state[i][j] == 0){
				tries[Math.floor(y > j)] = 1
			} else if (x != i && y == j && this.state[i][j] == 0){
				tries[2+Math.floor(x > i)] = 1
			}
		}
	}
	if (tries.indexOf(0) != -1){
		return true
	} else {
		return false
	}
}

Game.prototype.play = function (player, x,y){
	if (player > 2 || player < 1){
		return false
	}
	if (this.checkplay(x,y)){
		this.state[x][y] = player
		this.update_cb.call(this, this.state)
		return true
	} else {
		return false
	}
}

Game.prototype.isFinished = function(){
	for (i in this.state){
		if (state[i].indexOf(0) != -1){
			return false
		}
	}
	return true
}

Game.prototype.scores = function(){
	
}

