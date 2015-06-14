// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 450;
var barWidth = 100;
var arrowSize = 50;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 5;
var bottomPadding = 50;


var year = 2013;
doPage(year);

function doPage (year) {
d3.csv('data/'+year+'-Table1.csv', function (error, data){
	if(error){return;}
	// TODO neeeeeeeeeed to clear the SVG!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	for(var i=0; i<data.length; i++){
		console.log(data[i]);
	}
	var rectHeights = [100, 200, 150];
	var svg = getNewSVG(svgWidth, svgHeight);
	svg.selectAll("rect") // background
        .data(rectHeights)
        .enter()
        .append("rect")
        .attr("x", function(d, i){
			return i*(svgWidth-padding*2)/3+padding;
		})
        .attr("y", function(d){
			return svgHeight-d;//+padding;
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
			return svgHeight-rectHeights[i]-(svgWidth-padding*2)/6;//+padding;
		})
        .attr("width",(svgWidth-padding*2)/6)
        .attr("height",(svgWidth-padding*2)/6);
	if(year===2013){
		drawLeftTri(svg);
	}else if(year===2008){
		drawRightTri(svg);
	}else{
		drawLeftTri(svg);
		drawRightTri(svg);
	}
	
});

function getNewSVG (w, h) {
    var svg = d3.select("#mainsvg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "centered");
	return svg;
}

function drawLeftTri (svg)  {
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/LeftArrow.png";
		})
		.attr("x", padding/2)
        .attr("y", svgHeight - bottomPadding/2)
        .attr("width", arrowSize)
        .attr("height", arrowSize);
}

function drawRightTri (svg)  {
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/RightArrow.png";
		})
		.attr("x", svgWidth - padding/2)
        .attr("y", svgHeight - bottomPadding/2)
        .attr("width", arrowSize)
        .attr("height", arrowSize);
}

function getPlacings (data) {
	var topThree = [];
	var lastGame = data[data.length-1];
	var penUltGame = data[data.length-2];
	var score = lastGame.Score;
	var res = score.split(" - ");
	if(res[0]>res[1]){
		topThree[0] = lastGame['Home Team'];
		topThree[1] = lastGame['Away Team'];
	}else{
		topThree[1] = lastGame['Home Team'];
		topThree[0] = lastGame['Away Team'];
	}
	score = penUltGame.Score;
	var res = score.split(" - ");
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


}