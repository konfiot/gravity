function Game (size, update, nplayers) {
	this.state = [];
	this.size = Math.floor(size || 9);
	this.nplayers = Math.floor(nplayers || 2);
	this.whosturn = 0;

	this.plays = [];

	for (var i = 0; i < size; i += 1) {
		this.state[i] = new Array(size);

		for (var j = 0; j < size; j += 1) {
			this.state[i][j] = 0;
		}
	}

	this.state[Math.floor(size / 2)][Math.floor(size / 2)] = -1;

	this.score = new Array(this.nplayers);

	for (var h = 0; h < this.score.length; h += 1) {
		this.score[h] = 0;
	}

	this.update_cb = update;
}

Game.prototype.checkplay = function (x, y) {
	var tries = [0, 0, 0, 0];

	if (this.state[x][y] !== 0) {
		return false;
	}

	if (x === 0 || y === 0 || x === this.size - 1 || y === this.size - 1) {
		return true;
	}

	for (var i = 0; i < this.state.length; i += 1) {
		for (var j = 0; j < this.state[i].length; j += 1) {
			if (x === i && y !== j && this.state[i][j] <= 0) {
				tries[Math.floor(y > j)] = 1;
			} else if (x !== i && y === j && this.state[i][j] <= 0) {
				tries[2 + Math.floor(x > i)] = 1;
			}
		}
	}

	if (tries.indexOf(0) !== -1) {
		return true;
	} else {
		return false;
	}
};

Game.prototype.play = function (player, x, y, overwrite) {
	if (player > this.nplayers || player < 1) {
		return false;
	}

	if (player - 1 != this.whosturn && !overwrite) {
		return false;
	}

	if (this.checkplay(x, y)) {
		this.state[x][y] = player;
		this.whosturn += 1;
		this.whosturn %= this.nplayers;
		this.update_cb.call(this, this, this.state, this.scores(), this.isFinished(), this.whosturn, this.plays, [x, y]);

		return true;
	} else {
		return false;
	}
};

Game.prototype.isFinished = function () {
	for (var i in this.state) {
		if (this.state[i].indexOf(0) != -1) {
			return false;
		}
	}

	return true;
};

function cross_the_middle(state, segment) {
	for (var i = 0; i < segment.length; i += 1) {
		if (state[segment[i][0]][segment[i][1]] === -1) {
			return true;
		}
	}

	return false;
}

Game.prototype.scores = function () {
	this.compute_score(false);

	return this.compute_score(true);
};

Game.prototype.compute_score = function (middle) {
	var	count = [[], [], [], []],
		middle_score = new Array(this.nplayers);

	for (var h = 0; h < this.score.length; h += 1) {
		middle_score[h] = 0;
	}

	for (var i = 0; i < this.state.length; i += 1) {
		for (var j = 0; j < this.state[i].length; j += 1) {
			var played = [];

			for (var m = 0; m < this.plays.length; m += 1) {
				for (var n = 0; n < this.plays[m][0].length; n += 1) {
					if (this.plays[m][0][n][0] === i && this.plays[m][0][n][1] === j) {
						played.push(this.plays[m][1]);
					}
				}
			}

			for (var k  = 0; k < count.length; k += 1) {
				var l = 0;

				switch (k) {
					case 0:
						l = i;
					break;

					case 1:
						l = j;
					break;

					case 2:
						l = i + j;
					break;

					case 3:
						l = i - j + this.size;
					break;
				}

				if (this.state[i][j] === 0 || count[k][l] === undefined) {
					count[k][l] = [this.state[i][j], 1, [[i, j]]];

				} else if (played.indexOf(k) !== -1) {
					count[k][l] = undefined;

				} else if (count[k][l][0] === this.state[i][j] || (this.state[i][j] === -1 && middle)) {
					count[k][l][1] += 1;
					count[k][l][2].push([i, j]);

					if (count[k][l][1] >= 4) {
						if (!cross_the_middle(this.state, count[k][l][2])) {
							this.score[count[k][l][0] - 1] += 1;
							this.plays.push([count[k][l][2], k]);
						} else {
							middle_score[count[k][l][0] - 1] += 1;
						}

						count[k][l] = undefined;
					}

				} else {
					count[k][l] = [this.state[i][j], 1, [[i, j]]];
				}
			}
		}
	}

	return [this.score, middle_score];
};

Game.prototype.getState = function () {
	return this.state;
};

Game.prototype.getPlays = function () {
	return this.plays;
};

Game.prototype.update = function () {
	this.update_cb.call(this, this, this.state, this.scores(), this.isFinished(), this.whosturn, this.plays);
};

Game.prototype.export = function () {
	return [this.state, this.score, this.plays, this.whosturn];
};

Game.prototype.import = function (data) {
	this.state = data[0];
	this.score = data[1];
	this.plays = data[2];
	this.whosturn = data[3];
};

try {
	module.exports.Game = Game;
} catch (ignore) {}
