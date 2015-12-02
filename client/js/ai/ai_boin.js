function checkplay (state, x, y) {
	var tries = [0, 0, 0, 0];

	if (state[x][y] !== 0) {
		return false;
	}

	if (x === 0 || y === 0 || x === state.length - 1 || y === state.length - 1) {
		return true;
	}

	for (var i = 0; i < state.length; i += 1) {
		for (var j = 0; j < state[i].length; j += 1) {
			if (x === i && y !== j && state[i][j] <= 0) {
				tries[Math.floor(y > j)] = 1;
			} else if (x !== i && y === j && state[i][j] <= 0) {
				tries[2 + Math.floor(x > i)] = 1;
			}
		}
	}

	if (tries.indexOf(0) !== -1) {
		return true;
	} else {
		return false;
	}
}

function playable_cells (state) {
	var list = [];

	for (var i = 0; i < state.length; i += 1) {
		for (var j = 0; j < state.length; j += 1) {
			if (checkplay(state, i, j)) {
				list.push([i, j]);
			}
		}
	}

	return list;
}

function out_of_bonds (c, size) {
	return (c[0] < 0 || c[0] >= size || c[1] < 0 || c[1] >= size);
}

function array_equals (arr1, arr2) {
	for (var i = 0; i < Math.min(arr1.length, arr2.length); i += 1) {
		if (arr1[i] !== arr2[i]) {
			return false;
		}
	}

	return true;
}

function not_visited (to_test, arr, size) {
	for (var i = 0; i < arr.length; i += 1) {
		for (var j = 0; j < arr[i].length; j += 1) {
			if (array_equals(to_test, arr[i][j]) || out_of_bonds(to_test, size)) {
				return false;
			}
		}
	}

	return true;
}

function push_not_visited (from, to, size, arr1, arr2) {
	var arr = Array();

	Array.prototype.push.apply(arr, arr1);
	Array.prototype.push.apply(arr, arr2);

	for (var k = 0; k < from.length; k += 1) {
		if (not_visited(from[k], arr, size)) {
			to.push(from[k]);
		}
	}
}

function trim_ends (segments, state) {
	var	to_del = [],
		occ = 0;

	for (var i = 0; i < segments.length; i += 1) {
		occ = occupied(segments[i], state);
		to_del = [];

		for (var j = 0; j < segments[i].length; j += 1) {
			if (free(state, segments[i][j])) {
				if (nearest(segments[i], j, state) > (4 - occ)) {
					to_del.unshift(j);
				}
			}
		}

		for (var k = 0; k < to_del.length; k += 1) {
			segments[i].splice(to_del[k], 1);
		}
	}
}

function already_played (c, plays, state) {
	for (var i = 0; i < plays.length; i += 1) {
		for (var j = 0; j < plays[i][0].length; j += 1) {
			if (plays[i][0][j][0] === c[0] && plays[i][0][j][1] === c[1] && plays[i][1] === c[2]) {
				return true;
			}
		}
	}

	return false;
}

function discoverFrom (segments, state, i, j, p, plays) {
	var	to_visit_try = [[i, j + 1, 0, 3], [i, j - 1, 0, 3], [i + 1, j + 1, 3, 3], [i + 1, j, 1, 3], [i + 1, j - 1, 2, 3], [i - 1, j, 1, 3], [i - 1, j + 1, 2, 3], [i - 1, j - 1, 3, 3]],
		to_visit = [],
		c,
		next,
		free = 3,
		directions = [[[i, j, 0]], [[i, j, 1]], [[i, j, 2]], [[i, j, 3]]];

	for (var k = 0; k < to_visit_try.length; k += 1) {
		if (not_visited(to_visit_try[k], segments, state.length) && !(out_of_bonds(to_visit_try[k], state.length))) {
			to_visit.push(to_visit_try[k]);
		}
	}


	while (to_visit.length > 0) {
		c = to_visit.shift();

		if((Math.random() * 100) + 1 >= 50) {
			if (state[c[0]][c[1]] === 0) {
				if (c[3] <= 0) {
					continue;
				}
				free = c[3] - 1;
				c.pop();
				directions[c[2]].push(c);
	
			} else if (state[c[0]][c[1]] === p) {
				if (already_played(c, plays, state)) {
					continue;
				}
				c.pop();
				directions[c[2]].push(c);
				free = 4 - occupied(directions[c[2]], state);
	
			} else {
				continue;
			}
	
			switch (c[2]) {
				case 0:
					next = [[c[0], c[1] - 1, 0, free], [c[0], c[1] + 1, 0, free]];
				break;
	
				case 1:
					next = [[c[0] + 1, c[1], 1, free], [c[0] - 1, c[1], 1, free]];
				break;
	
				case 2:
					next = [[c[0] + 1, c[1] - 1, 2, free], [c[0] - 1, c[1] + 1, 2, free]];
				break;
	
				case 3:
					next = [[c[0] + 1, c[1] + 1, 3, free], [c[0] - 1, c[1] - 1, 3, free]];
				break;
			}
			push_not_visited(next, to_visit, state.length, segments, directions);
		}
	}

	for (var l = 0; l < directions.length; l += 1) {
		if (directions[l].length >= 4) {
			segments.push(directions[l]);
		}
	}
}

function segment (state, plays, player) {
	var segments = [];

	for (var i = 0; i < state.length; i += 1) {
		for (var j = 0; j < state[i].length; j += 1) {
			if (state[i][j] === player) {
				discoverFrom(segments, state, i, j, player, plays);
			}
		}
	}

	return segments;
}

function free (state, p) {
	return state[p[0]][p[1]] === 0;
}

function nearest (segment, i, state) {
	var c = segment[i];

	return segment.reduce(function (a, b) {
		if (free(state, b)) {
			return a;
		} else {
			return Math.min(a, Math.max(Math.abs(b[0] - c[0]), Math.abs(b[1] - c[1])));
		}
	}, segment.length);
}

function occupied (segment, state) {
	var count = 0;

	for (var i = 0; i < segment.length; i += 1) {
		if (state[segment[i][0]][segment[i][1]] !== 0) {
			count += 1;
		}
	}

	return count;
}

function init_array (len) {
	var array = Array(len);

	for (var i = 0; i < len; i += 1) {
		array[i] = Array(len);

		for (var j = 0; j < len; j += 1) {
			array[i][j] = 0;
		}
	}

	return array;
}

function cells_revealed (c, state, playable) {
	var	out = [],
		next_state = Array(state.length),
		unique = true;

	for (var i = 0; i < next_state.length; i += 1) {
		next_state[i] = new Array(state.length);

		for (var j = 0; j < next_state.length; j += 1) {
			if (i === c[0] && j === c[1]) {
				next_state[i][j] = 1;
			} else {
				next_state[i][j] = state[i][j];
			}
		}
	}

	next_playable = playable_cells(next_state);

	for (var k = 0; k < next_playable.length; k += 1) {
		unique = true;

		for (var l = 0; l < playable.length; l += 1) {
			if (array_equals(next_playable[k], playable[l])) {
				unique = false;
			}
		}

		if (unique) {
			out.push(next_playable[k]);
		}
	}

	return out;
}

function max_score_revealed (c, state, risk_map, playable) {
	var cells = cells_revealed(c, state, playable);

	return cells.reduce(function (a, b) {
		return Math.max(a, risk_map[b[0]][b[1]]);
	}, 0);
}

function iaplay_boin (state, scores, played) {
	var	cells = playable_cells(state),
		segments = [],
		risk_map = init_array(state.length);

	console.log(segments);

	for (var p = 0; p < scores.length; p += 1) {
		segments = segment(state, played, p + 1);

		for (var i = 0; i < segments.length; i += 1) {
			for (var j = 0; j < segments[i].length; j += 1) {
				if (free(state, segments[i][j]) && !already_played(segments[i][j], played, state)) {
					risk_map[segments[i][j][0]][segments[i][j][1]] += segments[i].length - nearest(segments[i], j, state) + Math.pow(4, occupied(segments[i], state));
				}
			}
		}
	}

	console.log(JSON.stringify(risk_map));

	return cells.reduce(function (a, b) {
		if (max_score_revealed(b, state, risk_map, cells) > risk_map[b[0]][b[1]]) {
			return a;
		} else if (risk_map[b[0]][b[1]] > risk_map[a[0]][a[1]]) {
			return b;
		} else {
			return a;
		}
	}, cells[0]);
}
