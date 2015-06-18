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
var teamBannerWidth = 200;
var teamBannerHeight = 100;
var logoWidth = 100;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 5;
var bottomPadding = 75;

var AUTeams = ["Adelaide Thunderbirds", "Melbourne Vixens", "New South Wales Swifts", "Queensland Firebirds", "West Coast Fever"];
var NZTeams = ["Waikato Bay of Plenty Magic", "Central Pulse", "Northern Mystics", "Southern Steel", "Canterbury Tactix"];
var year = 2013;
doPage();

function doPage () {
	var svg = getNewSVG(svgWidth, svgHeight);
	drawASTeams (svg);
	//drawASBanners (svg);
	drawNZTeams (svg);
	//drawNZBanners (svg);
}

function overall(team, svg){
	d3.csv('data/2008-Table1.csv', function (e1, data2008){
		if(e1){return;}
		d3.csv('data/2009-Table1.csv', function (e2, data2009){
			if(e2){return;}
			d3.csv('data/2010-Table1.csv', function (e3, data2010){
				if(e3){return;}
				d3.csv('data/2011-Table1.csv', function (e4, data2011){
					if(e4){return;}
					d3.csv('data/2012-Table1.csv', function (e5, data2012){
						if(e5){return;}
						d3.csv('data/2013-Table1.csv', function (e6, data2013){
							if(e6){return;}
							var years = [data2008, data2009, data2010, data2011, data2012, data2013];
							clearSVG();
							printStats(years, svg, team);	
						});	
					});
				});
			});	
		});
	});
}

function printStats (years, svg, team) {
	console.log(team);
	var rounds = initRounds();
	var bestRank = 99;
	var numGames = 0;
	var wonGames = 0;
	for(var i=0; i<years.length; i++){ // for each year
		for(var j=0; j<years[i].length; j++){ // for each game
			var match = years[i][j];
			var r = match.Round;
			if(gameConcerningThisTeam(match, team)){
				rounds[r].totalGames ++;
				numGames++;
				//console.log("year : " + i + " game : " + j);
				var win = winOrLoss(match, team);
				if(win){
					wonGames++;
					rounds[r].wins ++;
				}
			}
		}
	}
	var percentage = wonGames/numGames*100;
	for(var i=0; i<rounds.length; i++){
		//console.log("wins : "+rounds[i].wins);
		//console.log("total games : "+rounds[i].totalGames);
	}
	console.log('wins = ' + wonGames);
	console.log('total = ' + numGames);
	drawGraph (rounds, percentage, svg);
	
}

function initRounds () {
	var rounds = [];
	for(var i=0; i<18; i++){ // total of 17 rounds, will count from 1
		rounds[i] = {
			wins : 0,
			totalGames : 0			
		}
	}
	return rounds;
}

function gameConcerningThisTeam (game, team) {
	if(game['Home Team']===team || game['Away Team']===team){ 
		//console.log("found a match");
		return true;
	}
	return false;
}

function winOrLoss (game, team) {
	var resH = game['Home Score']; // home score
	var resA = game['Away Score']; // away score
	if(resH>resA && game['Home Team'] === team){
		return true; // home team won and team was the home team
	}
	if (resH<resA && game['Away Team'] === team){
		return true;
	}
	return false;
}

function drawGraph (rounds, winRate, svg) {

}

function drawASTeams (svg) {
	svg.selectAll("image")
		.data(AUTeams)
		.enter()
		.append("svg:image")
		.attr("xlink:href", function(d){
			return "../Resources/logos/logo_" + d + ".png";
		})
		.attr("x", svgWidth/2)
		.attr("y", function(d, i){
			return i*(teamBannerHeight+barPadding);
		})
		.attr("width", logoWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(d){
			d3.event.stopPropagation();
			overall(d, svg);
		});
}

function drawASBanners (svg) {
	for(var i=0; i<ASTeams.length; i++){
		svg.append("svg:image")
		.attr("xlink:href", "../Resources/banners/banner_" + ASTeams[i] + ".png")
		.attr("x", barPadding+logoWidth+svgWidth/2)
		.attr("y", i*(teamBannerHeight+barPadding))
		.attr("width", teamBannerWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(){
			d3.event.stopPropagation();
			overall(ASTeams[i], svg);
		});
	}
}

function drawNZTeams (svg) {
	for(var i=0; i<NZTeams.length; i++){
	var team = NZTeams[i];
		svg.append("svg:image")
		.attr("xlink:href", "../Resources/logos/logo_" + NZTeams[i] + ".png")
		.attr("x", barPadding)
		.attr("y", i*(teamBannerHeight+barPadding))
		.attr("width", logoWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(){
			d3.event.stopPropagation();
			overall(team, svg);
		});
	}
}

function drawNZBanners (svg) {
	for(var i=0; i<NZTeams.length; i++){
		svg.append("svg:image")
		.attr("xlink:href", "../Resources/banners/banner_" + NZTeams[i] + ".png")
		.attr("x", barPadding+logoWidth)
		.attr("y", i*(teamBannerHeight+barPadding))
		.attr("width", teamBannerWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(d){
			d3.event.stopPropagation();
			overall(NZTeams[i], svg);
		});
	}
}

function perSeason (year) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			var svg = getNewSVG(svgWidth, svgHeight);
			clearSVG();
		}
	);
}

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
			perSeason(year);
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
			perSeason(year);
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


