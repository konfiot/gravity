function Game(size){
	this.state = new Array(size);
	this.state.fill(new Array(size));
	this.state[int(size/2)][int(size/2)] = -1

	this.size = size;
}

Game.prototype.checkplay = function (x,y){
	var tries = new Array(4)
	if (this.state[x][y] != 0){
		return false
	}

	for (var i in state){
		for (var j in state[i]){
			if (x == i && y!= j && state[i][j] == 0){
				tries[y > j] = 1
			} else if (x != i && y == j && state[i][j] == 0){
				tries[x > i] = 1
			}
		}
	}
	if (tries.indexOf(0) == -1){
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

