function toggle_div(name, show){
	document.getElementById(name).style.display = (show) ? "block" : "none";
}

function update(state, score, finished)
{
	var cells = document.getElementsByTagName("td");
	for (var i = 0; i < cells.length; i += 1){
		cells[i].className = "p" + state[cells[i].parentElement.rowIndex][cells[i].cellIndex];
	}
	var str = "";
	for(var j = 0; j < score.length; j += 1){
		str += "<span class='t"+(j+1)+"'>" + score[j] + "</span>" + ((j == score.length - 1) ?  "" : " - ");
	}
	document.getElementById("score").innerHTML = str
	if (finished){
		if(score[0] == score[1]){
			document.getElementById("winner").innerHTML = "Tie";
		} else {
			document.getElementById("winner").innerHTML = "Player " + (score.indexOf(Math.max.apply(this, score))+1) + " wins";
		}
		toggle_div("finish", true);
	}
}

function init_game(size, cb){
	var str = "<table>";
	for(var i = 0; i < size; i += 1){
		str += "<tr>";
		for(var j = 0; j < size; j += 1){
			str += "<td class='p" + ((i == Math.floor(size/2) && j == Math.floor(size/2)) ? "-1" : "0") + "'></td>";
		}
		str += "</tr>";
	}
	str += "</table>";
	document.getElementById("game").innerHTML = str;
	for (var i = 0; i < size*size; i += 1){
		document.getElementById("game").getElementsByTagName("td")[i].addEventListener("click", function (e) {
			cb(e.target.parentElement.rowIndex, e.target.cellIndex);
		});
	}

}

document.getElementById("solo").addEventListener("click", function (e) {
	var nplayers = document.getElementById("nplayers_solo").value;
	var size = document.getElementById("size_solo").value;
	var game = new Game(size, update, nplayers);
	var i = 0;
	toggle_div("menu", false);
	init_game(size, function (x,y) {
		if (game.play(i%nplayers+1,x,y)){
			i += 1;
		}
	});
});

document.getElementById("multi").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("list", true);
	var network = new GameClient(function () {
		toggle_div("waiting", false);
	});
	
	network.list(function (list) {
		var str = "<table>";
		for (var i in list) {
			str+="<tr id='"+ i +"'><td>"+list[i].name+"</td><td>"+list[i].connected_players + " / " + list[i].nplayers + "</td><td>"+list[i].size+"</td></tr>";
		}
		str += "</table>";
		document.getElementById("games").innerHTML = str;
		for (i in list) {
			document.getElementById(i).addEventListener("click", function (e) {
				toggle_div("list", false);
				toggle_div("connecting", true);
				network.enter(i, function (data) {
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
	
	document.getElementById("create").addEventListener("click", function (e) {
		toggle_div("waiting", true);
		toggle_div("list", false);
		network.setGame(new Game(parseInt(document.getElementById("size").value), update, parseInt(document.getElementById("nplayers").value)));
		network.create(document.getElementById("name").value, parseInt(document.getElementById("size").value), parseInt(document.getElementById("nplayers").value), function (data) {
			init_game(parseInt(document.getElementById("size").value), function (x,y) {
				network.play(x,y);
			});
		});
	});
});

document.getElementById("restart").addEventListener("click", function (e) {
	toggle_div("finish", false);
	toggle_div("menu", true);
});
