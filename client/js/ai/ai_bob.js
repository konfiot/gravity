/** 	Fonction appelée pour faire jouer l'IA
	retourne un couple de coordonnées, dans un tableau
	Arguments :
		- state : L'etat courant de la map, une matrice de taille*taille, chaque case vaut :
			* 0 : case vide
			* -1 : milieu
			* 1..4 : case prise par le joueur 1..4
		- scores : un tableau des scores, l'indice i contient le score du joueur i
		- played : la liste des segments déjà joués, sous la forme [cases, direction], avec cases la liste des cases contenues dans le segment, et direction la direction du segment :
			- 0 : ligne
			- 1 : colonne
			- 2 : diagonale Strasbourg Bordeaux
			- 3 : diagonale Brest Marseille
*/

function iaplay_bob (state, scores, played, no_ia) {
	// Weight map
	var P_list = playable_cells (state);
	var weight_list = [];

	for (var i = 0 ; i < P_list.length ; i++) {
		weight_list[i] = weight(P_list[i][0], P_list[i][1], state, played, P_list, no_ia);
	}

	// Maximum weight
	var m = 0;

	for (var j = 0 ; j < weight_list.length ; j++) {
		if (weight_list[j] > weight_list[m]) {
			m = j;
		}
	}
	console.log(weight_list[m], JSON.stringify(played));

	return P_list[m];
}

function zoom_matrix (x, y, state) {
	var M = init_array(9);

	for (var i = 0 ; i < 9 ; i++) {
		for (var j = 0 ; j < 9 ; j++) {
			if (!out_of_bonds([x + i - 4, y + j - 4], state.length)) {
				M[i][j] = state[x + i - 4][y + j - 4];
			} else {
				M[i][j] = null;
			}
		}
	}

	return M;
}

function evaluate_situation (state, played, matrix, x, y, virtual, no_ia) {
	var W = 0,
		res,
		check_double = [[0, 0, 0, 0], [0, 0, 0, 0]];

	for (var r = 0 ; r < 4 ; r++) {
		for (var k = 0 ; k < 2 ; k++) { // Nb players !
			res = situations(state, played, matrix, x, y, r, k + 1, virtual);

			if (k + 1 === no_ia) {
				W += 5 * res[0];
			} else {
				W += 4 * res[0];
			}
			check_double[k][(2 * r) % 4] += res[1];
			check_double[k][(2 * r + 1) % 4] += res[2];
		}
		matrix = rot90(matrix, 9);
	}

	return [W, check_double[0], check_double[1]];
}

function weight (x, y, state, played, playable, no_ia) {
	var W = 0;

	// Evaluate at center
	var local_matrix = zoom_matrix(x, y, state),
		check_double = [[0, 0, 0, 0], [0, 0, 0, 0]],
		res;

	res = evaluate_situation(state, played, local_matrix, x, y, false, no_ia);
	W += res[0];
	var d = 0;

	for (var i = 1 ; i < 3 ; i++) {
		for (var j = 0 ; j < 4 ; j++) {
			d += res[i][j];
		}
	}

	if (d >= 1) {
		W += 100 * (d - 1);
	}

	// Evaluate in each direction

	var flag = cells_revealed([x, y], state, playable),
		state_copy = init_array(state.length);

	for (var i0 = 1 ; i0 < state.length ; i0++) {
		for (var j0 = 0 ; j0 < state.length ; j0++) {
			state_copy[i0][j0] = state[i0][j0];
		}
	}
	state_copy[x][y] = no_ia;
	var x0, y0;
	
		if (x===6 && y ===0){
		console.log(W)
	}

	if (flag.length !== 0) {
		for (var k = 0 ; k < flag.length ; k++) {
			x0 = flag[k][0];
			y0 = flag[k][1];
			local_matrix = zoom_matrix(x0, y0, state_copy);
			res = evaluate_situation(state_copy, played, local_matrix, x0, y0, true, no_ia);
			W -= 0.8 * res[0];

			d = 0;
			for (var i0 = 1 ; i0 < 3 ; i0++) {
				for (var j0 = 0 ; j0 < 4 ; j0++) {
					d += res[i0][j0];
				}
			}

			if (d >= 1) {
				W -= 50 * (d - 1);
			}
		}
	}

		if (x===6 && y ===0){
		console.log(W)
	}
	
	return W;
}

function rot90 (matrix, size) {
	var f = Math.floor(size / 2),
		c = Math.ceil(size / 2);

	for (var x = 0 ; x < f ; x++) {
		for (var y = 0 ; y < c ; y++) {
			temp = matrix[x][y];
			matrix[x][y] = matrix[y][size - 1 - x];
			matrix[y][size - 1 - x] = matrix[size - 1 - x][size - 1 - y];
			matrix[size - 1 - x][size - 1 - y] = matrix[size - 1 - y][x];
			matrix[size - 1 - y][x] = temp;
		}
	}

	return matrix;
}

function global_cell_pos (x, y, X, Y, r) {
	switch (r) {
		case 0:
			if (!out_of_bonds(X, Y)) {
				return [X, Y];
			} else { return false; }
		break;

		case 1:
			if (!out_of_bonds(x + Y - y, y - X + x)) {
				return [x + Y - y , y - X + x];
			} else { return false; }
		break;

		case 2:
			if (!out_of_bonds(2 * x - X, 2 * y - Y)) {
				return [2 * x - X, 2 * y - Y];
			} else { return false; }
		break;

		case 3:
			if (!out_of_bonds(x - Y + y, y + X - x)) {
				return [x - Y + y, y + X - x];
			} else { return false; }
		break;
	}
}

function check_gravity (state, x, y, X, Y, r) {
	pos = global_cell_pos(x, y, X, Y, r);

	if (pos && !out_of_bonds(pos, state.length)) {
		return checkplay(state, pos[0], pos[1]);
	} else {
		return true;
	}
}

function check_not_played (state, played, x, y, X, Y, r, dir) {
	pos = global_cell_pos(x, y, X, Y, r);

	if (pos && !out_of_bonds(pos, state.length)) {
		return !already_played([pos[0], pos[1], dir], played, state);
	} else {
		return true;
	}
}

function situations (state, played, M, x, y, r, id, virtual) { // Master Piece of art
	var W = 0;
	var double = [0, 0],
		pos;

	// Linear

	if (M[4][5] === id) {
		W += 2;	// oA

		if (M[4][6] === id && check_not_played(state, played, x, y, x, y + 1, r, r % 2)) {
			W += 10;	// oAA

			if (M[4][3] === id) {
				W += 97; // AoAA
				double[0] = 1;
			}

			if (M[4][7] === id && double[0] === 0) { // oAAA

				if (virtual) {
					W += 100;
					double[0] = 1;

				} else if (!virtual && M[4][8] !== id) {
					W += 100;
					double[0] = 1;
				}
			}

			if (M[4][3] !== id && M[4][3] !== 0 && M[4][7] !== id && M[4][7] !== 0) {
				W -= 10;	// BoAAB
			}

			if (M[4][3] === 0 && check_gravity(state, x, y, x, y - 1, r)) {

				if (M[4][7] === 0) {

					if (check_gravity(state, x, y, x, y + 3, r)) {
						W += 80; // OoAAO
					} else {
						W += 20; // OoAAX
					}
				} else if (M[4][7] !== id && M[4][7] !== 0 && M[4][6] === id) {
					W += 30; // OoAAB
				}
			}
		} else if (M[4][6] === 0) {

			if (check_gravity(state, x, y, x, y + 2, r)) {
				W += 15; // oAO

				if (M[4][7] === 0 && check_gravity(state, x, y, x, y + 3, r)) {
					W += 5; // oAOO
				} else if (M[4][7] === id && check_not_played(state, played, x, y, x, y + 3, r, r % 2)) {
					W += 30; // oAOA
				}
			} else {
				W += 5; // oAX

				if (M[4][7] === id) {
					W += 30;
				}
			}
		} else if (M[4][6] !== id && M[4][6] !== 0) {
			W += 2; // oAB
		}
	} else if (M[4][5] === 0 && M[4][6] === id && M[4][7] === id && check_not_played(state, played, x, y, x, y + 2, r, r % 2)) {

		if (check_gravity(state, x, y, x, y + 1, r)) {
			W += 45; // oOAA
		} else {
			W += 35; // oXAA
		}
	}

	// Diagonal

	if (M[3][5] === id) {
		W += 2;	// oA

		if (M[2][6] === id && check_not_played(state, played, x, y, x - 1, y + 1, r, r % 2 + 2)) {
			W += 10;	// oAA

			if (M[5][3] === id) {
				W += 97; // AoAA
				double[1] = 1;
			}

			if (M[1][7] === id && double[1] === 0) { // oAAA

				if (virtual) {
					W += 100;
					double[1] = 1;

				} else if (!virtual && M[0][8] !== id) {
					W += 100;
					double[1] = 1;
				}
			}

			if (M[5][3] !== id && M[5][3] !== 0 && M[1][7] !== id && M[1][7] !== 0) {
				W -= 10;	// BoAAB
			}

			if (M[5][3] === 0 && check_gravity(state, x, y, x + 1, y - 1, r)) {

				if (M[1][7] === 0) {

					if (check_gravity(state, x, y, x - 3, y + 3, r)) {
						W += 80; // OoAAO
					} else {
						W += 20; // OoAAX
					}
				} else if (M[1][7] !== id && M[1][7] !== 0 && M[2][6] === id) {
					W += 30; // OoAAB
				}
			}
		} else if (M[2][6] === 0) {

			if (check_gravity(state, x, y, x, y + 2, r)) {
				W += 15; // oAO

				if (M[1][7] === 0 && check_gravity(state, x, y, x - 3, y + 3, r)) {
					W += 5; // oAOO
				} else if (M[1][7] === id && check_not_played(state, played, x, y, x - 3, y + 3, r, r % 2 + 2)) {
					W += 30; // oAOA
				}
			} else {
				W += 5; // oAX

				if (M[1][7] === id) {
					W += 30;
				}
			}
		} else if (M[2][6] !== id && M[2][6] !== 0) {
			W += 2; // oAB
		}
	} else if (M[3][5] === 0 && M[2][6] === id && M[1][7] === id && check_not_played(state, played, x, y, x - 2, y + 2, r, r % 2 + 2)) {

		if (check_gravity(state, x, y, x - 1, y + 1, r)) {
			W += 45; // oOAA
		} else {
			W += 35; // oXAA
		}
	}
	
	return [W, double[0], double[1]];
}
