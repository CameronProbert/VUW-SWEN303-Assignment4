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
var barPadding = 20;
var podiumPadding = 5;
var bottomPadding = 100;
var topPadding = 50;

var svg;
var podiumHeights = [100, 200, 150];
var year = 2013;

// Start of code =====================================================================================================
doPage();

function doPage () {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
		if(error){return;}
		svgHeight = 650;
		svg = getNewSVG(svgWidth, svgHeight);
		svgHeight = 550;
		clearSVG();
		
		drawTitle ();
		drawPodium();
		
		var topThree = getPlacings(data);
		drawImages(topThree);
		drawBanner();
		
		if(year===2013){
			drawLeftTri();
		}else if(year===2008){
			drawRightTri();
		}else{
			drawLeftTri();
			drawRightTri();
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

function drawLeftTri ()  {
	var tip = "Previous Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/arrows/LeftArrow.png";
		})
		.attr("x", barPadding)
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			doPage();
		});
}

function drawRightTri ()  {
	var tip = "Next Year";
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/arrows/RightArrow.png";
		})
		.attr("x", svgWidth - arrowSize-barPadding )
        .attr("y", svgHeight - arrowSize)
        .attr("width", arrowSize)
        .attr("height", arrowSize)
		.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			doPage();
		});
}

// drawn second after images so only needs to append the svg
function drawBanner () {
	svg.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/banners/banner_"+year+".png";
		})
		.attr("x", arrowSize)
        .attr("y", svgHeight - arrowSize*2)
        .attr("width", svgWidth-2*arrowSize)
        .attr("height", arrowSize*2)
}

function drawImages (topThree) {
	var imgs = svg.selectAll("image")
		.data(topThree)
		.enter()
		.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/logos/logo_" + d + ".png";
		})
		.attr("x", function(d, i){
			return i*(svgWidth-padding*2)/3+padding + (svgWidth-padding*2)/12 - 2*podiumPadding;
		})
		.attr("y", function(d, i){
			return svgHeight-podiumHeights[i]-(svgWidth-padding*2)/6 - bottomPadding;
		})
		.attr("width",(svgWidth-padding*2)/6)
		.attr("height",(svgWidth-padding*2)/6);
}

function drawPodium () {
		for (var i = 0; i < podiumHeights.length; i++){
			var colourFill = colorBronze;
			if (i===1){
				colourFill = colorGold;
			} else if (i===2){
				colourFill = colorSilver;
			}
			drawRect (
				i * ( svgWidth - padding * 2 ) / 3 + padding, 
				svgHeight - podiumHeights[i] - bottomPadding, 
				(svgWidth-padding*2)/3-podiumPadding, 
				podiumHeights[i], 
				colourFill, 
				colorWhite
			)
			var place = i%3;
			if (place ===0){
				place = 3;
			}
			var textSize = 50;
			drawText (
				i * ( svgWidth - padding * 2 ) / 3 + padding + ((svgWidth-padding*2)/3-podiumPadding)/2, 
				svgHeight - podiumHeights[i] - bottomPadding+textSize, 
				textSize, 
				"middle", 
				colorWhite, 
				place
			);
		}
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

// Draws the title
function drawTitle () {
	// Team Banner
	drawRect (0, 0, svgWidth, padding, colorLightBlue, colorWhite)
	// Team Name
	var textSize = 50;
	drawText (barPadding, topPadding+barPadding, textSize, "start", colorWhite, "Final Placings for " + year);
}

// Draws and returns an svg Rectangle
function drawRect (x, y, width, height, colorFill, colorStroke) {
	return svg.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height)
		.attr("fill", colorFill)
		.attr("stroke-width", 1)
		.attr("stroke", colorStroke);
}

// Draws and returns an svg line
function drawLine (x1, y1, x2, y2, width, colour) {
	return svg.append("line")
		.attr("x1", x1)
		.attr("y1", y1)
		.attr("x2", x2)
		.attr("y2", y2)
		.attr("stroke", colour)
		.attr("stroke-width", width);
}

// Draws and returns an svg text (align is 'start', 'middle' or 'end')
function drawText (x, y, size, align, color, text){
	return svg.append("text")
        .text(text)
        .attr("x", x) 
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", size+"px")
        .attr("fill", color)
        .attr("text-anchor", align);
}

