var view = new GameView(9, ["grey", "white", "blue", "red"]);

function update(state, score, finished)
{
	view.update_game(state);
	view.update_score(score);
	if (finished){
		view.finish();
	}
}

var i = 0;
var game = new Game(9,update);


function play(x,y){
	if (game.play(i%2+1,x,y)){
		i += 1;
	}
}
