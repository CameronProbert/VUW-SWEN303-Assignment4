// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 1000;
var barWidth = 100;
var arrowSize = 50;
var teamBannerWidth = 350;
var teamBannerHeight = 100;
var logoWidth = 100;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 20;
var bottomPadding = 75;
var topPadding = 50;
var graphPadding = 50;

var AUTeams = ["Adelaide Thunderbirds", "Melbourne Vixens", "New South Wales Swifts", "Queensland Firebirds", "West Coast Fever"];
var NZTeams = ["Waikato Bay of Plenty Magic", "Central Pulse", "Northern Mystics", "Southern Steel", "Canterbury Tactix"];
var year = 2013;
doPage();

function doPage () {
	var svg = getNewSVG(svgWidth, svgHeight);
	drawASTeams (svg);
	drawASBanners (svg);
	drawNZTeams (svg);
	drawNZBanners (svg);
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

	//console.log(team);
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
				
				var win = winOrLoss(match, team);
				wonGames += win;
				rounds[r].wins += win;
			}
		}
	}
	var percentage = wonGames/numGames*100;
	console.log('wins = ' + wonGames);
	console.log('total = ' + numGames);
	drawGraph (rounds, wonGames, percentage, team, svg);
	
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
	if(game['Home Team']===team || game['Away Team']===team){ // byes are ignored
		//console.log("found a match");
		return true;
	}
	return false;
}

function winOrLoss (game, team) {
	var resH = game['Home Score']; // home score
	var resA = game['Away Score']; // away score
	if(resH>resA && game['Home Team'] === team){
		return 1; // home team won and team was the home team
	}
	if (resH<resA && game['Away Team'] === team){
		return 1;
	}
	return 0;
}

function drawGraph (rounds, wonGames, winRate, team, svg) {
	// Team Name
	drawText(svg, team, 0, topPadding, 60, "left");

	// Logo
	svg.append("svg:image")
		.attr("xlink:href", "../Resources/logos/logo_" + team + ".png")
		.attr("x", 0)
		.attr("y", topPadding+padding)
		.attr("width", logoWidth)
		.attr("height", teamBannerHeight)
	// Banner
	svg.append("svg:image")
		.attr("xlink:href", "../Resources/banners/banner_" + team + ".png")
		.attr("x", logoWidth)
		.attr("y", topPadding+padding)
		.attr("width", teamBannerWidth)
		.attr("height", teamBannerHeight)
	// Text
	winRate = Number(winRate).toFixed(2);
	drawText(svg, "Number of games won : "+wonGames, logoWidth+teamBannerWidth+barPadding, topPadding+padding+teamBannerHeight/2-15, 30, "left");
	drawText(svg, "Win rate : "+winRate+"%", logoWidth+teamBannerWidth+barPadding, topPadding+padding+teamBannerHeight-15, 30, "left");
	//Border
	
	var heightMin = topPadding+padding*2+barPadding+teamBannerHeight;
	var heightMax = svgHeight-(barPadding*2);
	svg.append("rect")
        .attr("x", 0)
        .attr("y", heightMin)
        .attr("width", svgWidth)
        .attr("height", heightMax-heightMin)
		.attr("fill", colorWhite)
		.attr("stroke-width", 3)
        .attr("stroke", colorBlack);
	// Graph
	var lowestWR = getLowestandHighestWR(rounds)[0];
	var highestWR = getLowestandHighestWR(rounds)[1];
	// average win rate bar
	heightMax = heightMax - 50;
	winRate = winRate/100; // convert back to decimal from %
	var scale = d3.scale.linear()
		.domain([lowestWR, highestWR])
		.range([0, heightMax-heightMin-graphPadding*2]);
		
	drawLine( (heightMax-graphPadding-scale(winRate)), svg);
	drawLine(heightMax-graphPadding, svg);
	for(var i=1; i<rounds.length; i++){
		var wR;
		if(rounds[i].totalGames!==0){
			wR = rounds[i].wins/rounds[i].totalGames;
		}else{
			wR=0;
		}
		drawBar (i, wR, winRate, lowestWR, highestWR, svg, heightMin, heightMax);
	}
	
	drawRounds (rounds, svg, heightMax);
	drawText (svg, "Rounds", svgWidth/2, heightMax+barPadding, 40,"center");
	
}

function drawLine (y, svg) {
	svg.append("line")
		.attr("x1", barPadding)
		.attr("y1", y)
		.attr("x2", svgWidth-barPadding)
		.attr("y2", y)
		.attr("stroke", colorBlack)
		.attr("stroke-width", 3);
}

function drawBar (i, wR, winRate, lowestWR, highestWR, svg, heightMin, heightMax ) {
	var noBar = 5;
	var graphPadding = 50;
	var scale = d3.scale.linear()
		.domain([lowestWR, highestWR])
		.range([0, heightMax-heightMin-graphPadding*2]);

	svg.append("rect")
		.attr("x", (i-1)*(svgWidth-4*barPadding)/16+barPadding)
		.attr("y", function(){
			if(wR===0){
				return heightMax-graphPadding-noBar;
			}
			return heightMax-graphPadding-scale(wR);
		})
		.attr("width", (svgWidth-4*barPadding)/16-barPadding)
		.attr("height", function(){
			if(wR===0){
				return noBar;
			}
			return scale(wR);
		})
		.attr("fill", function(){
			if(wR>=winRate){
				return colorPink;
			}else{
				return colorLightBlue;
			}
		})
		.attr("stroke-width", 3)
		.attr("stroke", colorBlack);
	
}

function drawText (svg, text, x, y, size, allign){
	svg.append("text")
        .text(text)
        .attr("x", x) 
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", size+"px")
        .attr("fill", colorBlack)
        .attr("text-anchor", allign);
}

function drawRounds (rounds, svg, heightMax){
	for(var i=1; i<rounds.length; i++){
		drawText(svg, i, (i-1)*(svgWidth-4*barPadding)/16+barPadding+10, heightMax-barPadding, 20);
	}
}

function getLowestandHighestWR(rounds){
	var hAndL = [];
	hAndL[0] = 9999999;
	hAndL[1] = 0;
	for(var i=0; i<rounds.length; i++){
		var wR;
		if(rounds[i].totalGames!==0){
			wR = rounds[i].wins/rounds[i].totalGames;
		}else{
			wR=0;
		}
		if(wR>hAndL[1]){hAndL[1]=wR;}
		else if(wR<hAndL[0]){hAndL[0]=wR;}		
	}
	return hAndL;
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
	for(var i=0; i<AUTeams.length; i++){
		drawTeamBanner(AUTeams[i], svg, i, barPadding+logoWidth+svgWidth/2);
	}
}

function drawTeamBanner (team, svg, i, x) {	
	svg.append("svg:image")
		.attr("xlink:href", "../Resources/banners/banner_" + team + ".png")
		.attr("x", x)
		.attr("y", i*(teamBannerHeight+barPadding))
		.attr("width", teamBannerWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(){
			d3.event.stopPropagation();
			overall(team, svg);
		});
}

function drawNZTeams (svg) {
	for(var i=0; i<NZTeams.length; i++){
		drawlogo (NZTeams[i], svg, i);
	}
}

function drawlogo (team, svg, i) {
	svg.append("svg:image")
		.attr("xlink:href", "../Resources/logos/logo_" + team + ".png")
		.attr("x", barPadding)
		.attr("y", i*(teamBannerHeight+barPadding))
		.attr("width", logoWidth)
		.attr("height", teamBannerHeight)
		.on('click', function(){
			d3.event.stopPropagation();
			overall(team, svg);
		});
}

function drawNZBanners (svg) {
	for(var i=0; i<NZTeams.length; i++){
		drawTeamBanner (NZTeams[i], svg, i, barPadding+logoWidth );
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
		.attr("xlink:href", "../Resources/banners/banner_"+year+".png")
		.attr("x", arrowSize)
        .attr("y", svgHeight - arrowSize)
        .attr("width", svgWidth-2*arrowSize)
        .attr("height", arrowSize)
}


