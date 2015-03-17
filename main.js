function init(){
	str = "<table>"
	for(var i = 0; i < 9; i += 1){
		str += "<tr>"
		for(var j = 0; j < 9; j += 1){
			str += "<td onclick='play("+i+","+j+")'>0</td>"
		}
		str += "</tr>"
	}
	str += "</table>"
	document.getElementById("game").innerHTML = str
}

function update(state)
{
	console.log(state)
	str = "<table>"
	for(var i = 0; i < 9; i += 1){
		str += "<tr>"
		for(var j = 0; j < 9; j += 1){
			str += "<td onclick='play("+i+","+j+")'>"+state[i][j]+"</td>"
		}
		str += "</tr>"
	}
	str += "</table>"
	document.getElementById("game").innerHTML = str
}

var i = 0
var game = new Game(9,update)
init()

function play(x,y){
	game.play(i%2+1,x,y)
	i += 1
}
