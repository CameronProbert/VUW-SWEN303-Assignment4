// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";

var colorGold = "rgb(204, 153, 0)";
var colorBronze = "rgb(139, 85, 49)";
var colorSilver = "rgb(205, 206, 208)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 550;
var barWidth = 100;
var arrowSize = 50;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 5;
var bottomPadding = 75;


var rectHeights = [100, 200, 150];

var year = 2013;
doPage(year);




function doPage (year) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
		if(error){return;}
		var svg = getNewSVG(svgWidth, svgHeight);
		clearSVG();
		
		drawPodium(svg);
		var topThree = getPlacings(data);
		drawImages(svg, topThree);
		drawBanner(svg, year);
		
		if(year===2013){
			drawLeftTri(svg, year);
		}else if(year===2008){
			drawRightTri(svg, year);
		}else{
			drawLeftTri(svg, year);
			drawRightTri(svg, year);
		}
});}

function getNewSVG (w, h) {
    var svg = d3.select("#mainsvg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "centered");
	return svg;
}

function clearSVG () {
	d3.selectAll("svg > *").remove();
}

function drawLeftTri (svg, year)  {
	var tip = "Previous Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/arrows/LeftArrow.png";
		})
		.attr("x", 0)
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			doPage(year);
		});
}

function drawRightTri (svg, year)  {
	var tip = "Next Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/arrows/RightArrow.png";
		})
		.attr("x", svgWidth - arrowSize )
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			doPage(year);
		});
}

// drawn second after images so only needs to append the svg
function drawBanner (svg, year) {
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/banners/banner_"+year+".png";
		})
		.attr("x", arrowSize)
        .attr("y", svgHeight - arrowSize)
        .attr("width", svgWidth-2*arrowSize)
        .attr("height", arrowSize)
}

function drawImages (svg, topThree) {
	var imgs = svg.selectAll("image")
		.data(topThree)
		.enter()
		.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/logos/logo_" + d + ".png";
		})
		.attr("x", function(d, i){
			return i*(svgWidth-padding*2)/3+padding + (svgWidth-padding*2)/12 - 2*barPadding;
		})
		.attr("y", function(d, i){
			return svgHeight-rectHeights[i]-(svgWidth-padding*2)/6 - bottomPadding;
		})
		.attr("width",(svgWidth-padding*2)/6)
		.attr("height",(svgWidth-padding*2)/6);
}

function drawPodium (svg) {
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
		.attr("fill", function(d, i){
			if(i===0) return colorBronze;
			if(i===1) return colorGold;
			return colorSilver;
		});
}

function getPlacings (data) {
	var topThree = [];
	var lastGame = data[data.length-1];
	var penUltGame = data[data.length-2];
	var resH = lastGame['Home Score'];
	var resA = lastGame['Away Score'];
	if(resH>resA){
		topThree[0] = lastGame['Home Team'];
		topThree[1] = lastGame['Away Team'];
	}else{
		topThree[1] = lastGame['Home Team'];
		topThree[0] = lastGame['Away Team'];
	}
	
	resH = penUltGame['Home Score'];
	resA = penUltGame['Away Score'];
	if(resH>resA){
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

