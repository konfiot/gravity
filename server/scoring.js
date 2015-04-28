var	fs = require("fs"),
	pg = require("pg");

function sum(array){
	var out = 0;
	for(var i = 0; i < array.length; i += 1){
		out += array[i];
	}
	return out;
}

function compute_scores(pseudos, scores, data, game){
	var points = Array(pseudos.length),
		K = sum(scores)/Math.pow(game.size, 2)/game.nplayers,
		dr = 0,
		ri = 0,
		rj = 0,
		dp = 0;
	
	for (var k = 0; k < points.length; k += 1){
		points[k] = 0;
	}

	for (var i = 0; i < pseudos.length; i += 1){
		if (data[pseudos[i]] !== undefined){
			ri = data[pseudos[i]].won/data[pseudos[i]].total;
		} else {
			ri = 0.5;
		}
		for (var j = 0; j < pseudos.length; j += 1){
			if (data[pseudos[j]] !== undefined){
				rj = data[pseudos[j]].won/data[pseudos[j]].total;
			} else {
				rj = 0.5;
			}
			dp = scores[i] - scores[j];
			dr = Math.abs(ri - rj);
			if(dp > 0){
				points[i] += K*10*dp*Math.min(15, 1/dr)+10;
			} else {
				points[i] += (1+dp/(scores[j]+1))*dr*2+1;
			}
		}
		points[i] = 3*parseInt(Math.log(points[i]));
	}
	return points;
}


function push_scores(pseudos, scores, game){
	if (process.env.ENV === "prod"){
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			if (err){
				console.log("Cannot connect");
				console.log(JSON.stringify(err));
			} else {
				console.log("Connected");
			}

			client.query("SELECT * from players", function(err, result){
				var	data = {},
					points = [];
				if(err){
					console.log("Erreur dans la récupération des données");
					console.log(JSON.stringify(err));
				} else {
					console.log("No error");
				}

				for (var j = 0; j < result.rows.length; j += 1){
					data[result.rows[j].pseudo] = result.rows[j];
				}

				console.log(data);
				points = compute_scores(pseudos, scores, data, game);
				console.log(points);

				for (var i = 0; i < pseudos.length; i += 1){
					if (data[pseudos[i]] === undefined){
						client.query('INSERT INTO players(pseudo,score,won) VALUES ($1, $2, $3)' , [pseudos[i], points[i], (scores[i] === Math.max.apply(this, scores)) ? 1 : 0], done);
					} else {
						client.query('UPDATE players SET score=score+$2, total=total+1, won=won+$3 WHERE pseudo=$1', [pseudos[i], points[i], (scores[i] === Math.max.apply(this, scores)) ? 1 : 0], done);
					}
				}
			});
		});
	} else {
		fs.readFile("scores.json", function(err, raw){
			var data = JSON.parse(raw || "{}"),
				points = compute_scores(pseudos, scores, data, game);

			for (var i = 0; i < pseudos.length; i += 1){
				data[pseudos[i]] = data[pseudos[i]] || {score: 0, won: 0, total: 0};

				data[pseudos[i]].score += points[i];
				data[pseudos[i]].total += 1;
				data[pseudos[i]].won += (scores[i] === Math.max.apply(this, scores)) ? 1 : 0;
			}
			fs.writeFile("scores.json", JSON.stringify(data), function(){});
		});
	}
}

function get_scores(cb){
	if (process.env.ENV === "prod"){
		pg.connect(process.env.DATABASE_URL, function(err, client, done) {
			client.query("SELECT * from players", function(err, result){
				var data = {};
				for (var j = 0; j < result.rows.length; j += 1){
					data[result.rows[j].pseudo] = result.rows[j];
				}
				cb.call(cb, data);
				done();
			});
		});
	} else {
		fs.readFile("scores.json", function(err, raw){
			cb.call(cb, JSON.parse(raw || "{}"));
		});
	}
}
		
module.exports.push_scores = push_scores;
module.exports.get_scores = get_scores;
