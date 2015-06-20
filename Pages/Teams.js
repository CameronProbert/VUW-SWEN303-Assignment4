// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 600;
var barWidth = 100;
var arrowSize = 50;
var teamBannerWidth = 350;
var teamBannerHeight = 100;
var logoWidth = 100;
var viewBarWidth = 150;
var viewBarHeight = 50;

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 20;
var bottomPadding = 75;
var topPadding = 50;
var graphPadding = 50;
var noBar = 5;
var lilBar = 15;
var bigPadding = 200;

var view = "Overall";

var welcomeMessage = ["Welcome to the teams pages!", "Here you can click to select a team and see imformation about them"];
var AUTeams = ["Adelaide Thunderbirds", "Melbourne Vixens", "Queensland Firebirds", "New South Wales Swifts", "West Coast Fever"];
var NZTeams = ["Waikato Bay of Plenty Magic", "Northern Mystics", "Southern Steel", "Central Pulse", "Canterbury Tactix"];
var year = 2013;
doPage();

function doPage () {
	svgHeight = 800;
	var svg = getNewSVG(svgWidth, svgHeight);
	clearSVG();
	//drawHeading (svg);
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
							drawTitle (svg, team);
							drawViewChange (svg, team, svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
							svgHeight = 1100;
							svg.attr("height", svgHeight);
							drawBackButton (svg);
							svgHeight = 1000;
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
	
	// Text
	winRate = Number(winRate).toFixed(2);
	drawText(svg, "Number of games won : "+wonGames, logoWidth+teamBannerWidth+barPadding, topPadding+padding+teamBannerHeight/2-15, 30, "left", colorBlack);
	drawText(svg, "Win rate : "+winRate+"%", logoWidth+teamBannerWidth+barPadding, topPadding+padding+teamBannerHeight-15, 30, "left", colorBlack);
	//Border
	var heightMin = topPadding+padding*2+barPadding+teamBannerHeight;
	var heightMax = svgHeight-(barPadding*2);
	drawABar (svg, 0, heightMin, svgWidth, heightMax-heightMin, colorWhite, colorBlack);
	// Graph
	var lowestWR = getLowestandHighestWR(rounds)[0];
	var highestWR = getLowestandHighestWR(rounds)[1];
	// average win rate bar
	heightMax = heightMax - graphPadding;
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
	
	// round numbers
	drawRounds (rounds, svg, heightMax);
	drawText (svg, "Rounds", svgWidth/2, heightMax+graphPadding/2, 40,"middle", colorBlack);
	
	// graph title
	drawABar (svg, 0, heightMin-graphPadding-barPadding*2, svgWidth, graphPadding+barPadding*2, colorWhite, colorBlack);
	drawText (svg, "Average Win Rate Per Round", svgWidth/2, heightMin-graphPadding+barPadding, 40,"middle", colorBlack);
	
	// keys
		//pink
	drawABar (svg, barPadding, heightMin+barPadding/2, lilBar, lilBar, colorPink, colorBlack);
	drawText (svg, "Win rates above average", barPadding + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
		//blue
	drawABar (svg, svgWidth/2, heightMin+barPadding/2, lilBar, lilBar, colorLightBlue, colorBlack);
	drawText (svg, "Win rates below average", svgWidth/2 + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
	
}

function drawABar (svg, x, y, width, height, colorFill, colorStroke) {
	svg.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height)
		.attr("fill", colorFill)
		.attr("stroke-width", 3)
		.attr("stroke", colorStroke);
	
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
	var graphPadding = 50;
	var scale = d3.scale.linear()
		.domain([lowestWR, highestWR])
		.range([0, heightMax-heightMin-graphPadding*2]);
	var x = (i-1)*(svgWidth-4*barPadding)/16+barPadding;
	var y;
	if(wR===0){
		y = heightMax-graphPadding-noBar;
	}else{ y = heightMax-graphPadding-scale(wR);}
	var width = (svgWidth-4*barPadding)/16-barPadding;
	var height;
	if(wR===0){
		height = noBar;
	}else{ height = scale(wR);}
	var color;
	if(wR>=winRate){
		color = colorPink;
	}else{ color = colorLightBlue;}
	drawABar (svg, x, y, width, height, color, colorBlack);
	
}

function drawText (svg, text, x, y, size, allign, color){
	svg.append("text")
        .text(text)
        .attr("x", x) 
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", size+"px")
        .attr("fill", color)
        .attr("text-anchor", allign);
}

function drawRounds (rounds, svg, heightMax){
	for(var i=1; i<rounds.length; i++){
		drawText(svg, i, (i-1)*(svgWidth-4*barPadding)/16+barPadding+10, heightMax-barPadding, 20, colorBlack);
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
		.attr("y", bigPadding+i*(teamBannerHeight+barPadding))
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
		.attr("y", 200+i*(teamBannerHeight+barPadding))
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

function perSeason (year, team) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			var svg = getNewSVG(svgWidth, svgHeight);
			clearSVG();
			drawTitle (svg, team);
			drawViewChange (svg, team, svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
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
	drawAnImage(svg, arrowSize, svgHeight - arrowSize, svgWidth-2*arrowSize, arrowSize, "../Resources/banners/banner_"+year+".png" );
}

function drawAnImage (svg, x, y, width, height, name){ // no on click function tho
	svg.append("svg:image")
		.attr("xlink:href", name)
		.attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
}

function drawViewChange (svg, team, x, y, colorBackround, colorText) {
	svg.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", viewBarWidth)
		.attr("height", viewBarHeight)
		.attr("fill", colorBackround)
		.attr("stroke-width", 3)
		.attr("stroke", colorWhite)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year, team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team, svg);
			}
		});
	svg.append("rect")
		.attr("x", x+2.5)
		.attr("y", y+2.5)
		.attr("width", viewBarWidth-5)
		.attr("height", viewBarHeight-5)
		.attr("fill", colorBackround)
		.attr("stroke-width", 1)
		.attr("stroke", colorText)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year, team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team, svg);
			}
		});
	svg.append("text")
        .text(view)
        .attr("x", x+viewBarWidth/2) 
        .attr("y", y+viewBarHeight/2+5)
        .attr("font-family", "Verdana")
        .attr("font-size", "20px")
        .attr("fill", colorText)
        .attr("text-anchor", "middle")
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year, team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team, svg);
			}
		});
}

function drawBackButton (svg) {
	var y = 1050;
	var width = 75;
	drawText (svg, "Go back to main teams page", svgWidth/2, y-40, 20, "middle", colorBlack);
	svg.append("svg:image")
		.attr("xlink:href", "../Resources/arrows/BackArrow.png")
		.attr("x", svgWidth/2-width/2)
        .attr("y", y-20)
        .attr("width", width)
        .attr("height", width)
		.on('click', function(){
			d3.event.stopPropagation();
			doPage();
		});
}

function drawTitle (svg, team) {
	// Team Banner
	drawABar (svg, 0, 0, svgWidth, padding, colorLightBlue, colorWhite)
	// Team Name
	var textSize = 60;
	if(team === "Waikato Bay of Plenty Magic"){textSize=50;}
	drawText(svg, team, barPadding, topPadding+barPadding, textSize, "left", colorWhite);
	// Logo
	drawAnImage(svg, 0, topPadding+padding, logoWidth, teamBannerHeight, "../Resources/logos/logo_" + team + ".png");
	// Banner
	drawAnImage(svg, logoWidth, topPadding+padding, teamBannerWidth, teamBannerHeight, "../Resources/banners/banner_" + team + ".png");
}
