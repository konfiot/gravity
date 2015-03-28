function GameView(size, colors){
    this.size = size;
    this.colors = colors;
}

GameView.prototype.update_game = function(state){
	var str = "<table>";
	for(var i = 0; i < this.size; i += 1){
		str += "<tr>";
		for(var j = 0; j < this.size; j += 1){
			str += "<td onclick='play("+i+","+j+")' style='background-color:"+this.colors[state[i][j]+1]+"'> </td>";
		}
		str += "</tr>";
	}
	document.getElementById("game").innerHTML = str;
};

GameView.prototype.update_score= function(score){
	document.getElementById("score").innerHTML = "<span style='color: " + this.colors[2] + "'>" + score[0] + "</span> - <span style='color: " + this.colors[3] + "'>"+ score[1] + "</span></table>";
};

GameView.prototype.finish = function () {
   
};