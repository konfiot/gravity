var size = 3;
var view = new GameView(size, ["grey", "white", "blue", "red"]);
var game = new Game(size,update);

function update(state, score, finished)
{
	view.update_game(state);
	view.update_score(score);
	if (finished){
		if(score[0] == score[1]){
			view.finish(-1);
		} else {
			view.finish(score.indexOf(Math.max.apply(this, score) + 1));
		}
	}
}

var i = 0;


function play(x,y){
	if (game.play(i%2+1,x,y)){
		i += 1;
	}
}
