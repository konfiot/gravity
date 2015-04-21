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
						l = i-j+state.length;
					break;
				}

				if (count[k][l] === undefined) {
					count[k][l] = [state[i][j], [[i,j]]];

				} else if (played.indexOf(k) !== -1){
					segments.push(count[k][l][1]);
					count[k][l] = undefined;

				} else if (count[k][l][0] === state[i][j]){
					count[k][l][1].push([i,j]);

				} else if (count[k][l][0] === 0){
					count[k][l][0] = state[i][j];
					count[k][l][1].push([i,j]);
				
				} else if (state[i][j] === 0){
					count[k][l][1].push([i,j]);

				} else {
					segments.push(count[k][l][1]);
					count[k][l] = [state[i][j], [[i,j]]];
				}
			}
		}
	}
	return segments;
}

function free(state, p){
	return state[p[0]][p[1]] == 0;
}

function nearest(segment, i, state){
	segment.sort(function(a,b){
		if (state[a[0]][a[1]] === 0){
			return 1;
		} else if (state[b[0]][b[1]] === 0){
			return -1;
		} else {
			return Math.abs(a[0]-i[0]) + Math.abs(a[1]-i[1]) - Math.abs(b[0]-i[0]) + Math.abs(b[1]-i[1])
		}
	});
	return segment[0];
}

function occupied(segment, state){
	var count = 0;
	for (var i = 0; i < segment.length; i += 1){
		if (state[segment[i][0]][segment[i][1]] !== 0){
			count += 1;
		}
	}
	return count;
}

function init_array(len){
	array = Array(len);
	for (var i = 0; i < len; i += 1){
		array[i] = Array(len);
		for (var j = 0; j < len; j += 1){
			array[i][j] = 0;
		}
	}
	return array;
}

function iaplay(state, scores, played){
	var cells = playable_cells(state),
		segments = segment(state, played),
		risk_map = init_array(state.length);
	
	console.log(segments);

	for (var i = 0; i < segments.length; i += 1){
		for (var j = 0; j < segments[i].length; j += 1){
			if (free(state, segments[i][j])){
				risk_map[segments[i][j][0]][segments[i][j][1]].def += segments[i].length - nearest(segments[i], j, state) + 2*occupied(segments[i], state);
			}
		}
	}
	cells.sort(function (a,b){
		return risk_map[b[0]][b[1]] - risk_map[a[0]][a[1]];
	});
	return cells[0];
}
