function init(){
	str = "<table>"
	for(var i = 0; i < 9; i += 1){
		str += "<tr>"
		for(var i = 0; i < 9; i += 1){
			str += "<td></td>"
		}
		str += "</tr>"
	}
	str += "</table>"
	document.getElementById("game").innerHTML = str
}
