var size = 3;

function toggle_div(name, show){
	document.getElementById(name).style.display = (show) ? "block" : "none";
}

function update(state, score, finished)
{
	var cells = document.getElementsByTagName("td");
	for (var i = 0; i < cells.length; i += 1){
		cells[i].className = "p" + state[cells[i].parentElement.rowIndex][cells[i].cellIndex];
	}
	document.getElementById("score").innerHTML = "<span class='t1'>" + score[0] + "</span> - <span class='t2'>"+ score[1] + "</span></table>";
	if (finished){
		if(score[0] == score[1]){
			document.getElementById("winner").innerHTML = "Tie";
		} else {
			document.getElementById("winner").innerHTML = "Player " + score.indexOf(Math.max.apply(this, score)) + " wins";
		}
		toggle_div("finish", true);
	}
}

function init_game(size, cb){
	var str = "<table>";
	for(var i = 0; i < size; i += 1){
		str += "<tr>";
		for(var j = 0; j < size; j += 1){
			str += "<td></td>";
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
	var game = new Game(size,update);
	var i = 0;
	toggle_div("menu", false);
	init_game(size, function (x,y) {
		if (game.play(i%2+1,x,y)){
			i += 1;
		}
	});
});

document.getElementById("multi").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("list", true);
	var game = new Game(size,update);
	var network = new GameClient(game);
	
	network.list(function (list) {
		var str = "<ul>";
		for (var i in list) {
			str+="<li><a id='"+ i +"'>"+list[i].name+"</a></li>";
		}
		str += "</ul>";
		document.getElementById("games").innerHTML = str;
		for (i in list) {
			document.getElementById(i).addEventListener("click", function (e) {
				toggle_div("list", false);
				toggle_div("connecting", true);
				network.enter(e.target.id, function (data) {
					toggle_div("connecting", false);
					init_game(size, function (x,y) {
						console.log("Tried to play");
						network.play(x,y);
					});
	
				});
			});
		}
	});
	
	document.getElementById("create").addEventListener("click", function (e) {
		toggle_div("waiting", true);
		toggle_div("list", false);
		network.create(document.getElementById("name").value, function (data) {
			init_game(size, function (x,y) {
				network.play(x,y);
			});
		});
	});
});

document.getElementById("restart").addEventListener("click", function (e) {
	toggle_div("finish", false);
	toggle_div("menu", true);
});