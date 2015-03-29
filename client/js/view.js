function GameView(size, colors, callbacks){
	this.size = size;
	this.colors = colors;
	this.menu = function(show) {
		document.getElementById("menu").style.display = (show) ? "block" : "none";
	};
	this.menu(true);
	var parent = this;
	document.getElementById("solo").addEventListener("click", function (e) {
		parent.menu(false);
		parent.playcallback = callbacks["solo"]();
	});
	document.getElementById("multi").addEventListener("click", function (e) {
		parent.menu(false);
		callbacks["multi"].call();
	});
	document.getElementById("restart").addEventListener("click", function (e) {
		parent.finish(false);
		callbacks["restart"].call();
		parent.menu(true);
	});
}

GameView.prototype.update_game = function(state){
	var str = "<table>";
	var parent = this;
	for(var i = 0; i < this.size; i += 1){
		str += "<tr>";
		for(var j = 0; j < this.size; j += 1){
			str += "<td id='"+i+","+j+"' style='background-color:"+this.colors[state[i][j]+1]+"'> </td>";
		}
		str += "</tr>";
	}
	str += "</table>";
	document.getElementById("game").innerHTML = str;
	for(i = 0; i < this.size; i += 1){
		for(j = 0; j < this.size; j += 1){
			document.getElementById(i+","+j).addEventListener("click", function (e) {
				parent.playcallback(i,j);
			});
		}
	}	
};

GameView.prototype.update_score= function(score){
	document.getElementById("score").innerHTML = "<span style='color: " + this.colors[2] + "'>" + score[0] + "</span> - <span style='color: " + this.colors[3] + "'>"+ score[1] + "</span></table>";
};

GameView.prototype.finish = function (show, win) {
	if(win !== undefined){
		if(win <= 0){
			document.getElementById("winner").innerHTML = "Tie";
		} else {
			document.getElementById("winner").innerHTML = "Player " + win + " wins";
		}
	}
	document.getElementById("finish").style.display = (show) ? "block" : "none";
};

