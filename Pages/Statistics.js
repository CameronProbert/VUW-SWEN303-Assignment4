// Variables =========================================================================================================


// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";
var colorGrey = "rgb(225, 225, 225)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 800;
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
var divPadding = 25;
var bottomPadding = 75;
var topPadding = 50;
var graphPadding = 50;
var barGap = 5;
var lilBar = 15;
var bigPadding = 200;

//Team Names
var AUTeamNames = ["Adelaide Thunderbirds", "Melbourne Vixens", "Queensland Firebirds", "New South Wales Swifts", "West Coast Fever"];
var NZTeamNames = ["Waikato Bay of Plenty Magic", "Northern Mystics", "Southern Steel", "Central Pulse", "Canterbury Tactix"];
var AllTeamNames = ["Adelaide Thunderbirds", "Melbourne Vixens", "Queensland Firebirds", "New South Wales Swifts", "West Coast Fever", "Waikato Bay of Plenty Magic", "Northern Mystics", "Southern Steel", "Central Pulse", "Canterbury Tactix"];

// Variable Page data
var view = "Overall";
var region = "NZ";
var year = 2013;

var svg;


// Automatic code ====================================================================================================


// Run the overall view of the page
doPage();


// Data retrieval functions ==========================================================================================


// Overall View
function doPage () {
	svgHeight = 800;
	getNewSVG(svgWidth, svgHeight);
	clearSVG();
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
							var allGames = [data2008, data2009, data2010, data2011, data2012, data2013]; 
							clearSVG();
							drawTitle ();
							drawRegionChange (svgWidth-viewBarWidth*2-barPadding*2, barPadding+5, colorWhite, colorLightBlue);
							drawViewChange (svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
							drawGraph(allGames);
						});	
					});
				});
			});	
		});
	});
}

// Season view
function perSeason (year) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			getNewSVG(svgWidth, svgHeight);
			clearSVG();
			drawTitle ();
			drawRegionChange (svgWidth-viewBarWidth*2-barPadding*2, barPadding+5, colorWhite, colorLightBlue);
			drawViewChange (svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
			
			drawBanner (year);
			if(year===2013){
				drawLeftTri(year);
			}else if(year===2008){
				drawRightTri(year);
			}else{
				drawLeftTri(year);
				drawRightTri(year);
			}
			drawGraph([data]);
	});
}


// Data manipulation functions =======================================================================================


// Draws the team bar graph
function drawGraph (gameData) {

	// Populates the data
	var teamData = [];
	if (region === "NZ"){
		teamData = gamesPlayedAndWon(gameData, NZTeamNames);
	} else if (region === "AU"){
		teamData = gamesPlayedAndWon(gameData, AUTeamNames);
	} else {
		teamData = gamesPlayedAndWon(gameData, AllTeamNames);
	}
	
	teamData.sort(function(a,b){
		return comparator(a,b);
	});

	// Set up graph areas
	var graphWidth = svgWidth;
	var graphCentreX = svgWidth/2;
	var keyHeight = 30;
	var graphY = 150 + keyHeight;
	var graphHeight = svgHeight-graphY-125;	
	
	// Top of graph dividing line
	drawLine (0, graphY-keyHeight-divPadding, graphWidth, graphY-keyHeight-divPadding, 1, colorBlack);
	// Draws a line at the end of the graph
	drawLine (0, graphY+graphHeight+divPadding, graphWidth, graphY+graphHeight+divPadding, 1, colorBlack);
	
	// === Start of doing the actual graph ===
	
	var winColour = colorPink;
	var drawColour = colorBlack;
	var lossColour = colorLightBlue;
	
	var numDivisions = teamData.length+1;
	var barThickness = (graphHeight-barGap*numDivisions)/teamData.length;
	
	// Find out how many games were played by the team with most games
	var maxGamesPlayed = -1;
	for (var i = 0; i < teamData.length; i++){
		if (teamData[i].played > maxGamesPlayed){
			maxGamesPlayed = teamData[i].played;
		}
	}
	
	// Draw each team
	var iconSize = 200;
	if (barThickness < iconSize){
		iconSize = barThickness;
	}
	for (var i = 0; i < teamData.length; i++){
		var barCentreY = (i+1) * (barGap+barThickness) - barThickness/2;
		
		// Bar lengths
		var barLength = teamData[i].played/maxGamesPlayed * graphWidth-iconSize;
		var winLength = barLength * (teamData[i].won/teamData[i].played);
		var drawLength = barLength * (teamData[i].drew/teamData[i].played);
		var lossLength = barLength - winLength - drawLength;
		
		// Draw logo
		drawAnImage (0, graphY+barCentreY-iconSize/2, iconSize, iconSize, "../Resources/logos/logo_"+teamData[i].name+".png");
		// Draw win section of bar
		drawRect (iconSize, graphY+barCentreY-barThickness/2, winLength, barThickness, winColour, colorWhite);
		// Draw the draw section of bar
		drawRect (iconSize+winLength, graphY+barCentreY-barThickness/2, drawLength, barThickness, drawColour, colorWhite);
		// Draw loss section of bar
		drawRect (iconSize+winLength+drawLength, graphY+barCentreY-barThickness/2, lossLength, barThickness, lossColour, colorWhite);
	}
	
	// Draw key
	var textSize = 20;
	var align = "start";
	var textColor = colorBlack;
	var textPadding = 2;
	var y = graphY-textSize-5;
	var keySize = textSize;
	var x = iconSize;
	var textX = x + textSize+textPadding;
	drawRect (x, y, keySize, keySize, winColour, colorBlack);
	drawText (textX, y+textSize-textPadding, textSize, align, textColor, "Wins");
	x += graphWidth/6;
	textX = x + textSize+textPadding;
	drawRect (x, y, keySize, keySize, drawColour, colorBlack);
	drawText (textX, y+textSize-textPadding, textSize, align, textColor, "Draws");
	x += graphWidth/6;
	textX = x + textSize+textPadding;
	drawRect (x, y, keySize, keySize, lossColour, colorBlack);
	drawText (textX, y+textSize-textPadding, textSize, align, textColor, "Losses");
	
}

// Returns the number of games won and played by all teams
function gamesPlayedAndWon (allGames, teamNames) {
	var teamData = [];
	for (var teamIndex = 0; teamIndex<teamNames.length; teamIndex++){
		teamData[teamData.length] = {
			name:teamNames[teamIndex],
			played:0,
			won:0,
			drew:0
		};
	}
	for (var teamIndex = 0; teamIndex<teamNames.length; teamIndex++){
		teamName = teamData[teamIndex].name;
		//console.log("LOOPING THROUGH TEAM, at team " + teamName);
		for(var i=0; i<allGames.length; i++){ // for each year
			//console.log("LOOPING THROUGH YEAR, at year " + i);
			for(var j=0; j<allGames[i].length; j++){ // for each game
				//console.log("LOOPING THROUGH YEAR, at game " + j);
				var match = allGames[i][j];
				var r = match['Round'];
				if(gameConcerningThisTeam(match, teamName)){
					var win = winOrLoss(match, teamData[teamIndex]);
				}
			}
		}
	}
	return teamData;
}

// Finds out if a team is in the game
function gameConcerningThisTeam (game, teamName) {
	if (game['Home Team']===teamName || game['Away Team']===teamName){
		return true;
	}
	return false;
}

// Finds if the team won or lost the game
function winOrLoss (game, team) {
	var resH = game['Home Score']; // home score
	var resA = game['Away Score']; // away score
	team.played++;
	if (resH===resA){
		team.drew++;
	}
	else if (resH>resA && game['Home Team'] === teamName){
		team.won++;
	}
	else if (resH<resA && game['Away Team'] === teamName){
		team.won++;
	}
}

// Sorts the array of teamData by first games played, then by win %
function comparator (a, b){

	// Sort by games played
	if (a.played > b.played){
		return -1;
	} else if (b.played > a.played){
		return 1;
	}
	
	// Sort by win %
	if (a.won/a.played > b.won/b.played){
		return -1;
	} else if (b.won/b.played > a.won/a.played){
		return 1;
	}
	
	return 0;
	
}


// Graphical Code ====================================================================================================


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

// Draws a team Banner
function drawTeamBanner (x, y, width, height, teamName) {	
	return svg.append("svg:image")
		.attr("xlink:href", "../Resources/banners/banner_" + teamName + ".png")
		.attr("x", x)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height);
}

// Draws and returns a team logo
function drawlogo (x, y, size, teamName) {
	return svg.append("svg:image")
		.attr("xlink:href", "../Resources/logos/logo_" + teamName + ".png")
		.attr("x", x)
		.attr("y", y)
		.attr("width", size)
		.attr("height", size);
}

// Replaces the id mainsvg with a new svg
function getNewSVG (w, h) {
    svg = d3.select("#mainsvg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "centered");
}

// Clears the svg
function clearSVG () {
	d3.selectAll("svg > *").remove();
}

// Draws the previous season triangle
function drawLeftTri (year)  {
	var tip = "Previous Year";
	drawAnImage (0, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/LeftArrow.png")
		.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			perSeason(year);
		});
}

// Draws the next season triangle
function drawRightTri (year)  {
	var tip = "Next Year";
	drawAnImage (svgWidth - arrowSize-barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/RightArrow.png")
		.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			perSeason(year);
		});
}

// Draws the banner displaying the season
function drawBanner (year) {
	return drawAnImage(arrowSize, svgHeight - arrowSize-barPadding, svgWidth-arrowSize*2, arrowSize, "../Resources/banners/banner_"+year+".png" );
}

// Draws and returns an svg image
function drawAnImage (x, y, width, height, name){
	//console.log("Drawing image at "+x+","+y+" and "+width+" wide, "+height+" high and named "+name+".");
	return svg.append("svg:image")
		.attr("xlink:href", name)
		.attr("x", x)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height);
}

// Overall/Per season view switcher
function drawViewChange (x, y, colorBackround, colorText) {
	drawRect (x, y, viewBarWidth, viewBarHeight, colorBackround, colorWhite)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				doPage ();
			}
		});
	drawRect (x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorBackround, colorText)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				doPage ();
			}
		});
	drawText (x+viewBarWidth/2, y+viewBarHeight/2+5, "20px", "middle", colorText, view)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (year);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				doPage ();
			}
		});
}

// Region switcher
function drawRegionChange (x, y, colorBackround, colorText) {
	drawRect (x, y, viewBarWidth, viewBarHeight, colorBackround, colorWhite)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			}
		});
	drawRect (x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorBackround, colorText)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			}
		});
	drawText (x+viewBarWidth/2, y+viewBarHeight/2+5, "20px", "middle", colorText, region)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				if (view === "Overall"){
					doPage ();
				} else {
					perSeason (year);
				}
			}
		});
}

// Draws the title
function drawTitle () {
	// Team Banner
	drawRect (0, 0, svgWidth, padding, colorLightBlue, colorWhite)
	// Team Name
	var textSize = 50;
	drawText (barPadding, topPadding+barPadding, textSize, "start", colorWhite, "Regional Performance")
}

