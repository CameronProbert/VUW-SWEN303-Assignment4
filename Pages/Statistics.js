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


var year = 2013;
doPage(year);




function doPage (year) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
		if(error){return;}
		var svg = getNewSVG(svgWidth, svgHeight);
		clearSVG();
	}
);

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
			return "../Resources/LeftArrow.png";
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
			return "../Resources/RightArrow.png";
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

// Removes the spaces from the first and last position of strings (if they exist)
function doTrim (str) {
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