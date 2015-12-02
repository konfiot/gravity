var	socket,
	_paq = _paq || [],
	u = "@@URL_PIWIK_SERVER",
	gaming = false;

window.location.hash = "#menu";

function toggle_div(name, show) {
	if (show && ["tuto_view", "scores", "list", "solo_menu", "menu"].indexOf(name) !== -1) {
		location.hash = name;
	}

	if (show) {
		_paq.push(["trackPageView", name]);
	}
	document.getElementById(name).style.display = (show) ? "block" : "none";
}

function update(game, state, score, finished, current, plays, lastplays) {
	var cells = document.getElementById("game").getElementsByTagName("td");

	console.log("Updated", score, current, current % score[0].length);

	for (var i = 0; i < cells.length; i += 1) {
		cells[i].className = "p" + state[cells[i].parentElement.rowIndex][cells[i].cellIndex];

		if (lastplays !== undefined && cells[i].parentElement.rowIndex === lastplays[0] && cells[i].cellIndex === lastplays[1]) {
			cells[i].id = "last";

		} else {
			cells[i].id = "";
		}

		if(cells[i].className == "p0" && !game.checkplay(cells[i].parentElement.rowIndex,cells[i].cellIndex)) {
			cells[i].className = "g";
		}

		for (var j = 0; j < plays.length; j += 1) {
			for (var k = 0; k < plays[j][0].length; k += 1) {
				if (cells[i].parentElement.rowIndex == plays[j][0][k][0] && cells[i].cellIndex == plays[j][0][k][1]) {
					cells[i].className += " used";
				}
			}
		}
	}

	var str = "";

	for (var l = 0; l < score[0].length; l += 1) {
		str += "<span class='t" + (l + 1) + "'>" + score[0][l] + "</span>" + ((l == score[0].length - 1) ?  "" : " - ");
	}

	document.getElementById("score").innerHTML = str;

	document.getElementById("game").className = "c" + ((current % score[0].length) + 1);
	document.getElementById("glob").className = "b" + ((current % score[0].length) + 1);
	document.getElementById("globb").className = "b" + ((current % score[0].length) + 1);

	end_score = Array(score[0].length);

	for (var m = 0; m < end_score.length; m += 1) {
		end_score[m] = score[0][m] + score[1][m];
	}

	if (finished) {
		window.gaming = false;
	}
}

function init_game(size, cb, confirm_quit) {
	window.gaming = true;
	var str = "<table class='game_table'>";

	for (var i = 0; i < size; i += 1) {
		str += "<tr>";

		for (var j = 0; j < size; j += 1) {
			str += "<td class='p" + ((i == Math.floor(size / 2) && j == Math.floor(size / 2)) ? "-1" : "0") + "'></td>";
		}
		str += "</tr>";
	}
	str += "</table>";

	document.getElementById("game").innerHTML = str;

	if (confirm_quit) {
		document.location.hash = "#game";
	}

	var manageEvent = function (e) {
		cb(e.target.parentElement.rowIndex, e.target.cellIndex);
	};

	for (var k = 0; k < size * size; k += 1) {
		document.getElementById("game").getElementsByTagName("td")[k].addEventListener("click", manageEvent);
	}
	_paq.push(["trackPageView", "Game"]);
}

document.getElementById("solo").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("solo_menu", true);
});

document.getElementById("solo_config").addEventListener("submit", function (e) {
	e.preventDefault();

	var	players = [],
		size = document.getElementById("size_solo").value,
		fields = document.getElementsByClassName("player");

	for (var i = 0; i < fields.length; i += 1) {
		if (parseInt(fields[i].value) !== 0) {
			players.push(parseInt(fields[i].value));
		}
	}

	var game = new Game(size, function (tgame, state, score, finished, current, plays, lastplays) {
		update(tgame, state, score, finished, current, plays, lastplays);

		if (players[game.whosturn] >= 2) {
			switch (players[game.whosturn]) {
				case 2:
					iaplay = iaplay_banane;
				break;

				case 3:
					iaplay = iaplay_bob;
				break;
			}
			var play = iaplay(game.getState(), game.scores(), game.getPlays(), game.whosturn + 1);

			while (!(game.play(game.whosturn + 1, play[0], play[1]))) {
				play = iaplay(game.getState(), game.scores(), game.getPlays());
			}
		}

		if (finished) {
			var slots = document.getElementsByClassName("score_card");

			document.getElementById("global_score").innerHTML = templates.end_score.render({scores: players.map(function (val, index) {
				return {
					player: index + 1,
					pseudo: (val >= 2) ? "A.I." : "Human",
					score: score[0][index],
					middle: score[1][index]
				};
			})});

			for (var i = 0; i < slots.length; i += 1) {
				slots[i].style.display = "none";
			}

			toggle_div("finish", true);

			_paq.push(["trackEvent", "Game", "Finished game", "Solo"]);
			_paq.push(["trackGoal", 1]);
		}
	}, players.length);

	document.getElementById("pseudos").innerHTML = "";

	toggle_div("solo_menu", false);
	_paq.push(["trackEvent", "Game", "Initialized new game", "Solo", players.length]);

	init_game(size, function (x, y) {
		if (players[game.whosturn] === 1) {
			game.play(game.whosturn + 1, x, y);
		}
	}, true);
	game.update();

	return false;
});

document.getElementById("leaderbord").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("loading", true);

	socket.emit("scores", {}, function (data) {
		toggle_div("loading", false);

		data.sort(function (a, b) {return b.score - a.score;});

		document.getElementById("scores_table").innerHTML = templates.leaderboard.render({items: data});
		toggle_div("scores", true);
	});
});

document.getElementById("multi").addEventListener("click", function (e) {
	toggle_div("menu", false);
	toggle_div("list", true);
	document.getElementById("pseudo").focus();

	var network = new GameClient(socket, function (pseudos, game) {
		toggle_div("waiting", false);
		str = "";

		for (var i = 0; i < pseudos.length; i += 1) {
			str += "<span class='margin t" + (i + 1) + "'>" + pseudos[i] + "</span> ";
		}

		document.getElementById("pseudos").innerHTML = str;

		init_game(game.size, function (x, y) {
			network.play(x, y);
		}, true);
		game.update();

	}, function (scores) {
		_paq.push(["trackEvent", "Game", "Finished game", "Multi"]);
		_paq.push(["trackGoal", 2]);

		scores = scores.map(function (value, index) {
			return {
				player: index + 1,
				score: value[3],
				pseudo: value[0],
				points_won: value[1],
				points: parseInt(value[2]) + parseInt(value[1])
			};
		});

		scores.sort(function (a, b) {
			return b.score - a.score;
		});

		document.getElementById("global_score").innerHTML = templates.end_score.render({scores: scores});

		var slots = document.getElementsByClassName("score_card");

		for (var i = 0; i < slots.length; i += 1) {
			if (i < scores.length) {
				slots[i].innerHTML = templates.end_points.render(scores[i]);
				slots[i].style.display = "block";
			} else {
				slots[i].style.display = "none";
			}
		}

		toggle_div("finish", true);
	});

	network.list(function (list) {
		var str = "<table class='list'>";

		for (var i in list) {
			str += "<tr id='" + i + "'><td>" + list[i].name + "</td><td>" + list[i].connected_players + " / " + list[i].nplayers + "</td><td>" + list[i].size + "</td></tr>";
		}

		str += "</table>";
		document.getElementById("games").innerHTML = str;

		var manageEvent = function (e) {
			var	pseudo = document.getElementById("pseudo").value.trim(),
				game;

			if (pseudo !== "") {
				toggle_div("list", false);
				toggle_div("connecting", true);
				network.enter(i, pseudo, function (data) {
					console.log("here it is");
					toggle_div("connecting", false);
					toggle_div("waiting", true);
					game = new Game(data.size, update, data.nplayers);
					network.setGame(game);

					_paq.push(["trackEvent", "Game", "Joined new game", "Multi"]);
				});
			} else {
				alert("Please choose a pseudo");
			}
		};

		for (i in list) {
			document.getElementById(i).addEventListener("click", manageEvent);
		}
	});

	document.getElementById("create").onsubmit = function (e) {
		var game;

		e.preventDefault();
		toggle_div("waiting", true);
		toggle_div("list", false);
		game = new Game(parseInt(document.getElementById("size").value), update, parseInt(document.getElementById("nplayers").value));
		network.setGame(game);

		_paq.push(["trackEvent", "Game", "Initialized new game", "Multi", parseInt(document.getElementById("nplayers").value)]);

		network.create(parseInt(document.getElementById("size").value), parseInt(document.getElementById("nplayers").value), document.getElementById("pseudo").value, function (data) {
			_paq.push(["trackEvent", "Game", "Game begins", "Multi"]);
		});

		return false;
	};
});

function message(text, callback) {
	if (window.location.hash == "#tuto_view") {
		toggle_div("tuto_view", true);
		document.getElementById("tuto_text").innerHTML = text;
		document.getElementById("tuto_next").onclick = function () {
			toggle_div("tuto_view", false);
			callback();
		};
	}
}

function play_cells(game, cells, cb) {
	if (cells.length > 0) {
		var cell = cells.shift();
		game.play(game.whosturn + 1, cell[0], cell[1]);

		setTimeout(play_cells, 1000, game, cells, cb);
	} else {
		cb();
	}
}

function mark(cells, cb) {
	var table_cells = document.getElementById("game").getElementsByTagName("td");

	for (var i = 0; i < cells.length; i += 1) {
		for (var j = 0; j < table_cells.length; j += 1) {
			if (table_cells[j].cellIndex == cells[i][1] && table_cells[j].parentElement.rowIndex == cells[i][0]) {
				table_cells[j].className = (cells[i][2]) ? "p-2" : "p-3";
				break;
			}
		}
	}
	setTimeout(cb, 1000);
}

document.getElementById("tuto").addEventListener("click", function () {
	var game = new Game(9, update, 2);
	toggle_div("menu", false);
	init_game(9, function (x, y) {});
	game.update();
	toggle_div("tuto_view", true);
	message("<strong>Welcome to Gravity !</strong><br /> The goal is simple: Score as many points as possible by lining up four cells (either in a row/column or in a diagonal)," +
		" once a line is made, you can't use the cells again in the same direction.", function () {
		play_cells(game, [[8, 5], [6, 8], [6, 7], [8, 6], [7, 6], [8, 8], [5, 8]], function () {
			message("You can add a cell only if it is supported by one of the four sides thanks to a column of other cells", function () {
				play_cells(game, [[8, 3], [7, 3], [6, 3]], function () {
					mark([[5, 3, true], [6, 2, false], [6, 4, false]], function () {
						message("You can't play in the middle cell. Furthermore, the middle can't be used as a support", function () {
							game.update();
							mark([[3, 4, false], [4, 3, false], [5, 4, false], [4, 5, false]], function () {
								message("If the game ends up with a tie, the cells lined up with the middle will settle the winner", function () {
									_paq.push(["trackEvent", "Game", "Finished tutorial"]);
									_paq.push(["trackGoal", 3]);
									toggle_div("menu", true);
								});
							});
						});
					});
				});
			});
		});
	});
});

var	restart_buttons = document.getElementsByClassName("restart"),
	manageEvent = function (e) {
		window.history.back();
		socket.emit("quit");
	};

for (var i  = 0; i < restart_buttons.length; i += 1) {
	restart_buttons[i].addEventListener("click", manageEvent);
}

window.addEventListener("hashchange", function (e) {
	var	url = e.newURL.split("#"),
		div = (url.length < 2) ? "menu" : url[1];

	if (div !== e.oldURL.split("#")[1]) {
		if ((e.oldURL.split("#")[1] === "game") && (window.gaming)) {
			if (!confirm("You sure you want to ragequit ?")) {
				document.location.hash = "#game";

				return false;
			}
		}

		toggle_div("finish", false);
		toggle_div("tuto_view", false);
		toggle_div("list", false);
		toggle_div("waiting", false);
		toggle_div("loading", false);
		toggle_div("scores", false);
		toggle_div("menu", false);
		toggle_div("solo_menu", false);
		toggle_div("tuto_view", false);
		toggle_div(div, true);
	}
});

_paq.push(["trackPageView"]);
_paq.push(["enableLinkTracking"]);
_paq.push(["setTrackerUrl", u + "piwik.php"]);
_paq.push(["setSiteId", 1]);

socket = io("@@URL_SOCKETIO_SERVER");
