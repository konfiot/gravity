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

function iaplay_bob (state, scores, played) {
	// Weight map
	var P_list = playable_cells (state);
	var weight_list = [];

	for (var i = 0 ; i < P_list.length ; i++) {
		weight_list[i] = weight(P_list[i][0], P_list[i][1], state, played);
	}

	// Maximum weight
	var m = 0;

	for (var j = 0 ; j < weight_list.length ; j++) {
		if (weight_list[j] > m) {
			m = j;
		}
	}
	console.log(P_list[m], weight_list[m]);

	return P_list[m];
}

function zoom_matrix (x, y, state) {
	var M = init_array(9);

	for (var i = 0 ; i < 9 ; i++) {
		for (var j = 0 ; j < 9 ; j++) {
			if (!out_of_bonds([x + i - 4, y + j - 4], state.length)) {
				M[i][j] = state[x + i - 4][y + j - 4];
			}
		}
	}

	return M;
}

function weight (x, y, state, played) {
	var W = 0;

	// Evaluate at center
	var local_matrix = zoom_matrix(x, y, state);

	for (var r = 0 ; r < 4 ; r++) {

	}

	return x * y;
}

function situations (matrix, x, y, r, id, virtual) { // Master Piece of art
	var W = 0;
	var double = [0, 0];

	// Linear
	/* L
	if (matrix[4][5] === id) {
		W += 4;
		if (matrix[4][6] === id && checkCellScore(x,y,x,y+1,r,id,val=r%2)==0:# oAA
			W+= 10
			if M[4,3]==id: 										# AoAA --
				W+= 97
				double[0]=1
			if M[4,7]==id and double[0]==0: 					# oAAA --
				if virtual:
					W += 100
					double[0]=1
				elif not virtual and M[4,8]!=id:
					W += 100
					double[0]=1
			if M[4,3]==0 and checkCellGravity(x,y,x,y-1,r) :
				if M[4,7]==0 :
					if checkCellGravity(x,y,x,y+3,r) : 			# OoAAO --
						W += 80
					else: 										# OoAAX --
						W += 20
				elif M[4,7] != id and M[4,6] == id :			# OoAAB --
					W += 30
			if M[4,3]!=id and M[4,7]!=id:						# BoAAB
				W -= 5
		elif M[4,6] == 0 :
			if checkCellGravity(x,y,x,y+2,r) : 					# oAO --
				W += 15
				if M[4,7] == 0 and checkCellGravity(x,y,x,y+3,r) : # oAOO --
					W += 5
				elif M[4,7] == id: 								# oAOA
					W += 30
			else : 												# oAX --
				W += 5
				if M[4,7] == id:
					W+= 30
		elif M[4,6] != id and M[4,6] != 0 : 					# oAB --
			W += 3
	elif M[4,5]==0 and M[4,6]==id and M[4,7]==id:
		if checkCellGravity(x,y,x,y+1,r):  						# oOAA --
			W += 40
		else: 													# oXAA --
			W += 30
	}
	*/
}
