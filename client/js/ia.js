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

function out_of_bonds(c, size){
	return (c[0] < 0 || c[0] >= size || c[1] < 0 || c[1] >= size);
}

function array_equals(arr1, arr2){
	if (arr1.length !== arr2.length){
		return false;
	}
	for (var i = 0; i < arr1.length; i += 1){
		if (arr1[i] !== arr2[i]){
			return false;
		}
	}
	return true;
}

function push_not_visited(from, to, size, arr1, arr2){
	arr = Array();
	Array.prototype.push.apply(arr, arr1);
	Array.prototype.push.apply(arr, arr2);

	for (var i = 0; i < arr.length; i += 1){
		for (var j = 0; j < arr[i].length; j += 1){
			for (var k = 0; k < from.length; k += 1) {
				if (array_equals(from[k], arr[i][j]) || out_of_bonds(from[k], size)){
					console.log("Deleted " + JSON.stringify(from[k]));
					from.splice(k, 1);
				}
			}
		}
	}
	console.log("Pushed " + JSON.stringify(from));
	Array.prototype.push.apply(to, from);
}

function discoverFrom(segments, state, i, j, p){
	var to_visit_try = [[i,j+1,1],[i,j-1,1],[i+1,j+1,3],[i+1,j,2],[i+1,j-1,0],[i-1,j,2],[i-1,j+1,0],[i-1,j-1,3]],
		to_visit = [],
		c,
		next,
		count = [0, 0, 0, 0],
		to_del = [],
		directions = [[[i,j,0]], [[i,j,1]], [[i,j,2]], [[i,j,3]]];
	
	for (var k = 0; k < to_visit_try.length; k += 1){
		if (!out_of_bonds(to_visit_try[k], state.length)){
			to_visit.push(to_visit_try[k]);
		}
	}

	console.log(to_visit);
	while (to_visit.length > 0) {
		c = to_visit.pop();

		if (state[c[0]][c[1]] === 0) {
			count[c[2]] += 1;
			if (count[c[2]] === 4){
				continue;
			}
			directions[c[2]].push(c);
		} else if (state[c[0]][c[1]] === p) {
			if (count[c[2]] > 0){
				continue;
			}
			directions[c[2]].push(c);
		} else {
			continue;
		}

		switch(c[2]) {
			case 0:
				next = [[i+1, j-1, 0],[i-1, j+1, 0]];
			break;
			case 1:
				next = [[i, j-1, 1],[i, j+1, 1]];
			break;
			case 2:
				next = [[i+1, j, 2],[i-1, j, 2]];
			break;
			case 3:
				next = [[i+1, j+1, 3],[i-1, j-1, 3]];
			break;
		}
		push_not_visited(next, to_visit, state.length, segments, directions);
	}
	Array.prototype.push.apply(segments, directions);
}

function segment(state, plays){
	var segments = [];

	for (var i = 0; i < state.length; i += 1){
		for (var j = 0; j < state[i].length; j += 1){
			if (state[i][j] === 1) {
				discoverFrom(segments, state, i, j, state[i][j]);
			}
		}
	}

	return segments;
}

function free(state, p){
	return state[p[0]][p[1]] == 0;
}

function nearest(segment, i, state){
	var c = segment[i];
	segment.sort(function(a,b){
		if (state[a[0]][a[1]] === 0){
			return 1;
		} else if (state[b[0]][b[1]] === 0){
			return -1;
		} else {
			return Math.abs(a[0]-c[0]) + Math.abs(a[1]-c[1]) - Math.abs(b[0]-c[0]) + Math.abs(b[1]-c[1])
		}
	});
	return Math.max(Math.abs(segment[0][0]-c[0]), Math.abs(segment[0][1]-c[1]));
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
				console.log(segments[i].length, nearest(segments[i], j, state) , occupied(segments[i], state));
				risk_map[segments[i][j][0]][segments[i][j][1]] += segments[i].length - nearest(segments[i], j, state) + 2*occupied(segments[i], state);
			} 
		}
	}

	console.log(JSON.stringify(risk_map));
	cells.sort(function (a,b){
		return risk_map[b[0]][b[1]] - risk_map[a[0]][a[1]];
	});
	return cells[0];
}
