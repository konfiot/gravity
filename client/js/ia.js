function checkplay(state, x,y){
	'use strict';
	var tries = [0,0,0,0];
	if (state[x][y] != 0){
		return false;
	}

	if (x==0 || y==0 || x==state.length-1 || y==state.length-1){
		return true;
	}

	for (var i in state){
		for (var j in state[i]){
			if (x == i && y!= j && state[i][j] <= 0){
				tries[Math.floor(y > j)] = 1;
			} else if (x != i && y == j && state[i][j] <= 0){
				tries[2+Math.floor(x > i)] = 1;
			}
		}
	}
	if (tries.indexOf(0) != -1){
		return true;
	} else {
		return false;
	}
};

function playable_cells(state){
	var list = [];
	for (var i = 0; i < state.length; i += 1){
		for (var j = 0; j < state.length; j += 1){
			if(checkplay(state, i, j)){
				list.push([i, j])
			}
		}
	}
	return list;
}

function segment(state, plays){
	var count = [[],[],[],[]],
		segments = [];

	for (var i = 0; i< state.length; i += 1){
		for (var j = 0; j< state[i].length; j += 1){
			var played = [];
			for (var m = 0; m < plays.length; m += 1){
				for (var n = 0; n < plays[m][0].length; n += 1){
					if (plays[m][0][n][0] === i && plays[m][0][n][1] === j){
						played.push(plays[m][1]);
					}
				}
			}
			for(var k  = 0; k < count.length; k += 1){
				var l = 0;
				switch(k){
					case 0:
						l = i;
					break;
					case 1:
						l = j;
					break;
					case 2:
						l = i+j;
					break;
					case 3:
						l = i-j+this.size;
					break;
				}
				if (state[i][j] === 0 || count[k][l] === undefined || count[k][l][0] !== this.state[i][j]){
					segments.push(count[k][l]);
					count[k][l] = [state[i][j], [[i,j]]];
				} else if (played.indexOf(k) !== -1){
					count[k][l] = undefined;
				} else if (count[k][l][0] === this.state[i][j] || (this.isFinished() && this.state[i][j] === -1)){
					count[k][l][1].push([i,j]);
				}
			}
		}
	}
	return segments;
}

function iaplay(state, scores, played){
	var cells = playable_cells(state),
		segments = segment(state, played),
		risk_map = init_array(state.length),

	for (var i = 0; i < segments.length; i += 1){
		for (var j = 0; j < segment[i].length; j += 1){
			if (free(state, end[j]) && dof + segment[i][1].length == 4){ // TODO: coder la fonction
				risk_map[ends[j][0]][ends[j][1]].def += 1;
			} else if (!free(state, end[j]){
				
			}
		}
	}
}
