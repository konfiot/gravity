var	fs = require("fs"),
	async = require("async"),
	pg = require("pg");

function sum (array) {
	var out = 0;

	for (var i = 0; i < array.length; i += 1) {
		out += array[i];
	}

	return out;
}

/*
	Compute scores (featuring interpolated polynome) :
	scores : [[p1, p2, ...] , [mid1, mid2]]
*/
function compute_scores (pseudos, scores, data, game) {
	var n = pseudos.length;
	var	points = Array(n);
	var rank = Array(n);

	for (var i = 0; i < n; ++i) {
		rank[i] = i;
	}

	// Ranking with middle
	rank.sort(function (a, b) {
		if (scores[0][a] > scores[0][b]) {
			return -1;
		} else if (scores[0][a] < scores[0][b]) {
			return 1;
		} else {
			if (scores[1][a] > scores[1][b]) {
				return -1;
			} else if (scores[0][a] < scores[0][b]) {
				return 1;
			} else {
				return 0;
			}
		}
	});

	for (var j = 0 ; j < n ; j++) {
		points[j] = n * 2 + -0.5 * Math.pow(rank[j], 3) + 3 * Math.pow(rank[j], 2) - 7.5 * rank[j] + 1;
	}

	var eq = [];

	for (var p = 0 ; p < pseudos.length ; p++) {
		eq.push(null);
	}

	for (var nb = 0 ; nb < pseudos.length ; nb++) {
		if (eq[nb] === null) {
			var S = 0,
				equal = 0;

			for (var k0 = 0 ; k0 < pseudos.length ; k0++) {
				if (scores[0][k0] === scores[0][nb] && scores[1][k0] === scores[1][nb]) {
					eq[k0] = nb;
					S += points[k0];
					equal++;
				}
			}
			S = Math.floor(S / equal);

			for (var k1 = 0 ; k1 < pseudos.length ; k1++) {
				if (eq[k1] === nb) {
					points[k1] = S;
				}
			}
		}
	}

	return points;
}

function push_scores (pseudos, scores, game, cb) {
	if (process.env.ENV === "prod") {
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			if (err) {
				console.log("Cannot connect");
				console.log(JSON.stringify(err));
			} else {
				console.log("Connected");
			}

			client.query("SELECT * from players", function (err, result) {
				var	data = {},
					points = [],
					results = [];

				if (err) {
					console.log("Erreur dans la récupération des données");
					console.log(JSON.stringify(err));
				} else {
					console.log("No error");
				}

				for (var j = 0; j < result.rows.length; j += 1) {
					data[result.rows[j].pseudo] = result.rows[j];
				}

				points = compute_scores(pseudos, scores, data, game);

				for (var i = 0; i < pseudos.length; i += 1) {
					results.push([pseudos[i], points[i], (points[i] === Math.max.apply(this, points)) ? 1 : 0, scores[0][i]]);
				}

				async.map(results, function (item, callback) {
					if (data[item[0]] === undefined) {
						client.query("INSERT INTO players(pseudo,score,won) VALUES ($1, $2, $3)" , item.slice(0, 3), function (err, res) {});
						console.log([item[0], item[1], 0]);
						callback(null, [item[0], item[1], 0, item[3]]);
					} else {
						client.query("UPDATE players SET score=score+$2, total=total+1, won=won+$3 WHERE pseudo=$1", item.slice(0, 3), function (err, res) {
							callback(null, [item[0], item[1], data[item[0]].score, item[3]]);
						});
					}
				}, function (err, results) {
					done();
					cb(results);
				});
			});
		});

	} else {
		fs.readFile("scores.json", function (err, raw) {
			var	data = JSON.parse(raw || "{}"),
				points = compute_scores(pseudos, scores, data, game),
				result = [];

			for (var i = 0; i < pseudos.length; i += 1) {
				data[pseudos[i]] = data[pseudos[i]] || {score: 0, won: 0, total: 0};

				result.push([pseudos[i], points[i], data[pseudos[i]].score, scores[0][i]]);

				data[pseudos[i]].score += points[i];
				data[pseudos[i]].total += 1;
				data[pseudos[i]].won += (scores[i] === Math.max.apply(this, scores)) ? 1 : 0;
				data[pseudos[i]].ratio = parseInt(100 * data[pseudos[i]].won / data[pseudos[i]].total);
			}

			fs.writeFile("scores.json", JSON.stringify(data), function () {});

			cb(result);
		});
	}
}

function get_scores (cb) {
	if (process.env.ENV === "prod") {
		pg.connect(process.env.DATABASE_URL, function (err, client, done) {
			client.query("SELECT total, 100*won/(total-won) as ratio, score, pseudo FROM players", function (err, result) {
				var data = {};

				for (var j = 0; j < result.rows.length; j += 1) {
					data[result.rows[j].pseudo] = result.rows[j];
				}

				cb.call(cb, data);
				done();
			});
		});

	} else {
		fs.readFile("scores.json", function (err, raw) {
			cb.call(cb, JSON.parse(raw || "{}"));
		});
	}
}

module.exports.push_scores = push_scores;
module.exports.get_scores = get_scores;
