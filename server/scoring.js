var	fs = require("fs");

function compute_scores(pseudos, scores, data){
	var points = Array(pseudos.length);
	for (var i = 0; i < pseudos.length; i += 1){
		points[i] = scores[i];
	}
	return points;
}


function push_scores(pseudos, scores){
	fs.readFile("scores.json", function(err, raw){
		data = JSON.parse(raw || "{}");
		var points = compute_scores(pseudos, scores, data);
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
