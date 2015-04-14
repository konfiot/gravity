var	fs = require("fs");

function sum(array){
	var sum = 0;
	for(var i = 0; i < array.length; i += 1){
		sum += array[i];
	}
	return sum;
}

function compute_scores(pseudos, scores, data, game){
	var points = Array(pseudos.length),
		K = sum(scores)/Math.pow(game.size, 2)/game.nplayers,
		dr = 0,
		ri = 0,
		rj = 0,
		dp = 0;
	
	for (var i = 0; i < pseudos.length; i += 1){
		if (data[pseudos[i]] !== undefined){
			ri = data[pseudos[i]].won/data[pseudos[i]].total;
		} else {
			ri = .5;
		}
		for (var j = 0; j < pseudos.length; j += 1){
			if (data[pseudos[j]] !== undefined){
				rj = data[pseudos[j]].won/data[pseudos[j]].total;
			} else {
				rj = .5;
			}
			dp = scores[i] - scores[j];
			dr = Math.abs(ri - rj);
			if(dp > 0){
				points[i] += K*4*dp*Math.max(15, 1/dr)+10;
			} else {
				points[i] += (1+dp/scores[j])*dr*4+5;
			}
		}
		points[i] = 3*parseInt(Math.log(points[i]));
	}
	return points;
}


function push_scores(pseudos, scores, game){
	fs.readFile("scores.json", function(err, raw){
		data = JSON.parse(raw || "{}");
		var points = compute_scores(pseudos, scores, data, game);
		console.log(points);
		for (var i = 0; i < pseudos.length; i += 1){
			data[pseudos[i]] = data[pseudos[i]] || {score: 0, won: 0, total: 0};

			data[pseudos[i]].score += points[i];
			data[pseudos[i]].total += 1;
			data[pseudos[i]].won += (scores[i] === Math.max.apply(this, scores)) ? 1 : 0;
		}
		fs.writeFile("scores.json", JSON.stringify(data), function(){});
	});
}

function get_scores(cb){
	fs.readFile("scores.json", function(err, raw){
		cb.call(cb, JSON.parse(raw || "{}"));
	});
}
		
module.exports.push_scores = push_scores;
module.exports.get_scores = get_scores;
