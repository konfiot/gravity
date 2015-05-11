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
	console.log(checkplay(state,0,0))
	return [parseInt(Math.random() * state.length), parseInt(Math.random() * state.length)];
}
