var socket = io("@@URL_SOCKETIO_SERVER");

function toggle_div(name, show) {
	document.getElementById(name).style.display = (show) ? "block" : "none";
}

function update(state, score, finished, current, plays, lastplays) {
	var cells = document.getElementById("game").getElementsByTagName("td");
	for (var i = 0; i < cells.length; i += 1) {
		cells[i].className = "p" + state[cells[i].parentElement.rowIndex][cells[i].cellIndex];
		if (lastplays !== undefined && cells[i].parentElement.rowIndex == lastplays[0] && cells[i].cellIndex == lastplays[1]) {
			cells[i].className += " last";
		}
		
		for(var j = 0; j < plays.length; j += 1) {
			for (var k = 0; k < plays[j][0].length; k += 1) {
				if (cells[i].parentElement.rowIndex == plays[j][0][k][0] && cells[i].cellIndex == plays[j][0][k][1]) {
					cells[i].className += " used";
				}
			}
		}
	}

	var str = "";
	for(var j = 0; j < score.length; j += 1) {
		str += "<span class='t"+(j+1)+"'>" + score[j] + "</span>" + ((j == score.length - 1) ?  "" : " - ");
	}
	document.getElementById("score").innerHTML = str;

	document.getElementById("game").className = "c"+((current+1)%score.length+1);

	if (finished) {
		if(score[0] == score[1]) {
			document.getElementById("winner").innerHTML = "Tie";
		} else {
			document.getElementById("winner").innerHTML = "Player " + (score.indexOf(Math.max.apply(this, score))+1) + " wins";
		}
		toggle_div("finish", true);
	}
}

function init_game(size, cb) {
	var str = "<table>";
	for(var i = 0; i < size; i += 1) {
		str += "<tr>";
		for(var j = 0; j < size; j += 1) {
			str += "<td class='p" + ((i == Math.floor(size/2) && j == Math.floor(size/2)) ? "-1" : "0") + "'></td>";
		}
		str += "</tr>";
	}
	str += "</table>";
	document.getElementById("game").innerHTML = str;
	for (var i = 0; i < size*size; i += 1) {
		document.getElementById("game").getElementsByTagName("td")[i].addEventListener("click", function (e) {
			cb(e.target.parentElement.rowIndex, e.target.cellIndex);
		});
	}

}

document.getElementById("solo").addEventListener("click", function (e) {
	var nplayers = 2;//document.getElementById("nplayers_solo").value;
	var size = document.getElementById("size_solo").value;
	var game = new Game(size, update, nplayers);
	var i = 0;
	toggle_div("menu", false);
	document.getElementById("pseudos").innerHTML = "";
	init_game(size, function (x,y) {
		if (game.play(1/*i%nplayers+1*/,x,y)) {
			i += 1;
			var play = iaplay(game.getState(), game.scores(), game.getPlays());
			while(!(game.play(2,play[0], play[1]))) {
				play = iaplay(game.getState(), game.scores());
			}
		}
	});
});

document.getElementById("leaderbord").addEventListener("click", function(e) {
	toggle_div("menu", false);
	toggle_div("loading", true);
	socket.emit("scores", {}, function(data) {
		toggle_div("loading", false);
		var str = "",
			r = 1,
			enumerate = [];

		for(var i in data) {
			if (data.hasOwnProperty(i)) {
				enumerate.push([i, data[i]])
			}
		}

		enumerate.sort(function(a,b) {return b[1].score - a[1].score});

		for(var j  = 0; j < enumerate.length; j += 1) {
			str += "<tr>";
			str += "<td>" + r + "</td><td>" + enumerate[j][0] + "</td><td>"+enumerate[j][1].total+"</td><td>" + parseInt(enumerate[j][1].won/enumerate[j][1].total*100) + " %</td><td>" + enumerate[j][1].score + "</td>";
			str += "</tr>";
			r += 1;
		}
		document.getElementById("scores_table").innerHTML = str;
		toggle_div("scores", true);
	});
});

document.getElementById("multi").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("list", true);
	document.getElementById("pseudo").focus();
	var network = new GameClient(socket, function (pseudos) {
		toggle_div("waiting", false);
		str = "";
		for (var i = 0; i < pseudos.length; i += 1) {
			str += "<span class='margin t"+(i+1)+"'>"+pseudos[i]+"</span> ";
		}
		document.getElementById("pseudos").innerHTML = str;
	});
	
	network.list(function (list) {
		var str = "<table class='list'>";
		for (var i in list) {
			str+="<tr id='"+ i +"'><td>"+list[i].name+"</td><td>"+list[i].connected_players + " / " + list[i].nplayers + "</td><td>"+list[i].size+"</td></tr>";
		}
		str += "</table>";
		document.getElementById("games").innerHTML = str;
		for (i in list) {
			document.getElementById(i).addEventListener("click", function (e) {
				toggle_div("list", false);
				toggle_div("connecting", true);
				network.enter(i, document.getElementById("pseudo").value, function (data) {
					toggle_div("connecting", false);
					toggle_div("waiting", true);
					network.setGame(new Game(data.size, update, data.nplayers));
					init_game(data.size, function (x,y) {
						network.play(x,y);
					});
	
				});
			});
		}
	});
	
	document.getElementById("create").addEventListener("submit", function (e) {
		e.preventDefault();
		toggle_div("waiting", true);
		toggle_div("list", false);
		network.setGame(new Game(parseInt(document.getElementById("size").value), update, parseInt(document.getElementById("nplayers").value)));
		network.create(parseInt(document.getElementById("size").value), parseInt(document.getElementById("nplayers").value), document.getElementById("pseudo").value, function (data) {
			init_game(parseInt(document.getElementById("size").value), function (x,y) {
				network.play(x,y);
			});
		});
		return false;
	});
});
var restart_buttons = document.getElementsByClassName("restart");
for (var i  = 0; i < restart_buttons.length; i += 1) {
	restart_buttons[i].addEventListener("click", function (e) {
		toggle_div("finish", false);
		toggle_div("list", false);
		toggle_div("waiting", false);
		toggle_div("scores", false);
		toggle_div("menu", true);
	});
}


