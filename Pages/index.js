// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 550;
var barWidth = 100;
var arrowSize = 50;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 5;
var bottomPadding = 75;


var year = 2008;
doPage(year);




function doPage (year) {
d3.csv('data/'+year+'-Table1.csv', function (error, data){
	if(error){return;}
	clearSVG(svg);
	for(var i=0; i<data.length; i++){
		//console.log(data[i]);
	}
	var rectHeights = [100, 200, 150];
	var svg = getNewSVG(svgWidth, svgHeight);
	svg.selectAll("rect") // podiums
        .data(rectHeights)
        .enter()
        .append("rect")
        .attr("x", function(d, i){
			return i * ( svgWidth - padding * 2 ) / 3 + padding;
		})
        .attr("y", function(d){
			return svgHeight - d - bottomPadding;
		})
        .attr("width",(svgWidth-padding*2)/3-barPadding)
        .attr("height", function(d){
			return d;
		})
        .attr("fill", colorPink);
		
	var topThree = getPlacings(data);
	var imgs = svg.selectAll("image")
		.data(topThree)
        .enter()
        .append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/logo_" + d + ".png";
		})
        .attr("x", function(d, i){
			return i*(svgWidth-padding*2)/3+padding + (svgWidth-padding*2)/12 - 2*barPadding;
		})
        .attr("y", function(d, i){
			return svgHeight-rectHeights[i]-(svgWidth-padding*2)/6 - bottomPadding;
		})
        .attr("width",(svgWidth-padding*2)/6)
        .attr("height",(svgWidth-padding*2)/6);
	if(year===2013){
		drawLeftTri(svg, year);
	}else if(year===2008){
		drawRightTri(svg, year);
	}else{
		drawLeftTri(svg, year);
		drawRightTri(svg, year);
	}
	
});

function getNewSVG (w, h) {
    var svg = d3.select("#mainsvg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "centered");
	return svg;
}

function clearSVG(svg){
	d3.selectAll("svg > *").remove();
	//console.log("tried to clear the svg");
}

function drawLeftTri (svg, year)  {
	var tip = "Previous Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/LeftArrow.png";
		})
		.attr("x", 0)
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		//.append("svg:title")
		//.text(tip)
		.on('click', function(){
			//console.log("I was clicked");
			d3.event.stopPropagation();
			year = year - 1;
			doPage(year);
		});
}

function drawRightTri (svg, year)  {
	var tip = "Next Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/RightArrow.png";
		})
		.attr("x", svgWidth - arrowSize )
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		//.append("svg:title")
		//.text(tip)
		.on('click', function(){
			//console.log("I was clicked");
			d3.event.stopPropagation();
			year = year + 1;
			doPage(year);
		});
}

function getPlacings (data) {
	var topThree = [];
	var lastGame = data[data.length-1];
	var penUltGame = data[data.length-2];
	var score = lastGame.Score;
	var res = score.split("-");
	res[0] = doTrim(res[0]);
	res[1] = doTrim(res[1]);
	if(res[0]>res[1]){
		topThree[0] = lastGame['Home Team'];
		topThree[1] = lastGame['Away Team'];
	}else{
		topThree[1] = lastGame['Home Team'];
		topThree[0] = lastGame['Away Team'];
	}
	score = penUltGame.Score;
	var res = score.split("-");
	res[0] = doTrim(res[0]);
	res[1] = doTrim(res[1]);
	if(res[0]>res[1]){
		topThree[2] = penUltGame['Away Team'];
	}else{
		topThree[2] = penUltGame['Home Team'];
	}
	return ordered(topThree);
}

function ordered (topThree) {
	var placings = [];
	placings[0] = topThree[2];
	placings[1] = topThree[0];
	placings[2] = topThree[1];
	return placings;
}

function doTrim(str){
	var fin;
	if(str.charAt(0)==" "){
		var finPos = str.length-1;
		fin = str.substring(1, finPos);
	}else{
		fin = str;
	}
	var finPos = fin.length-1;
	if(fin.charAt(finPos)==" "){
		fin = fin.substring(0, finPos-1);
	}
	return fin;
}

}