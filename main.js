function update(state, score)
{
	var colors = ["grey", "white", "blue", "red"];
	str = "<table>"
	for(var i = 0; i < 9; i += 1){
		str += "<tr>"
		for(var j = 0; j < 9; j += 1){
			str += "<td onclick='play("+i+","+j+")' style='background-color:"+colors[state[i][j]+1]+"'> </td>"
		}
		str += "</tr>"
	}
	str += "<span style='color: blue'>" + score[0] + "</span> - <span style='color: red'>"+ score[1] + "</span></table>"
	document.getElementById("game").innerHTML = str
}

var i = 0
var game = new Game(9,update)

function play(x,y){
	console.log(i)
	if (game.play(i%2+1,x,y)){
		i += 1
	}
	console.log(i)
	console.log(game.scores())
}
