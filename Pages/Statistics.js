// Variables =========================================================================================================


// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorPink = "rgb(237, 0, 140)";
var colorPurple = "rgb(119, 78, 181)"
var colorWhite = "rgb(255, 255, 255)";
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
var divideLineWidth = 1;
var minBarLength = 5;
var barThickness = 77;
var iconSize = barThickness;

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
var region = "ALL";
var year = 2013;
var seasonPart = "Both";

var svg;


// Automatic code ====================================================================================================


// Run the overall view of the page
load();


// Data retrieval functions ==========================================================================================


//
function load(){
	if (region==="ALL"){
		svgHeight = 1200;
	} else {
		svgHeight = 800;
	}
	if (view==="Overall"){
		svgHeight-=102;
	}
	getNewSVG(svgWidth, svgHeight);
	clearSVG();
	if (view==="Overall"){
		svgHeight+=102;
	}
	if (view === "Overall"){
		doPage();
	} else {
		perSeason();
	}
}

// Overall View
function doPage () {
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
							//clearSVG();
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
function perSeason () {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			//getNewSVG(svgWidth, svgHeight);
			//clearSVG();
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
	var buttonHeight = 30;
	var graphHeight = svgHeight-graphY-125-divPadding*2-buttonHeight;
	
	// Top of graph dividing line
	drawLine (0, graphY-keyHeight-divPadding, graphWidth, graphY-keyHeight-divPadding, divideLineWidth, colorBlack);
	// Draws a line at the end of the graph
	drawLine (0, graphY+graphHeight+divPadding, graphWidth, graphY+graphHeight+divPadding, divideLineWidth, colorBlack);
	
	// === Start of doing the actual graph ===
	
	var winColour = colorPink;
	var drawColour = colorPurple;
	var lossColour = colorLightBlue;
	
	var numDivisions = teamData.length+1;
	
	// Find out how many games were played by the team with most games
	var maxGamesPlayed = -1;
	for (var i = 0; i < teamData.length; i++){
		if (teamData[i].played > maxGamesPlayed){
			maxGamesPlayed = teamData[i].played;
		}
	}
	
	// Draw each team
	for (var i = 0; i < teamData.length; i++){
		var barCentreY = (i+1) * (barGap+barThickness) - barThickness/2;
		
		// Draw logo
		drawAnImage (barPadding, graphY+barCentreY-iconSize/2, iconSize, iconSize, "../Resources/logos/logo_"+teamData[i].name+".png");
		
		if (teamData[i].played > 0){
			// Bar lengths
			var barLength = teamData[i].played/maxGamesPlayed * graphWidth - iconSize - barPadding*2;
			//console.log("Total bar length = " + barLength);
			var winLength = barLength * (teamData[i].won/teamData[i].played);
			var drawLength = barLength * (teamData[i].drew/teamData[i].played);
			var lossLength = barLength - winLength - drawLength;
			
			// Draw win section of bar
			drawRect (iconSize+barPadding, graphY+barCentreY-barThickness/2, winLength, barThickness, winColour, colorWhite);
			// Draw the draw section of bar
			drawRect (iconSize+barPadding+winLength, graphY+barCentreY-barThickness/2, drawLength, barThickness, drawColour, colorWhite);
			// Draw loss section of bar
			drawRect (iconSize+barPadding+winLength+drawLength, graphY+barCentreY-barThickness/2, lossLength, barThickness, lossColour, colorWhite);
		
		}
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
	var keyCol = [winColour, drawColour, lossColour];
	var keyText = ["Wins", "Draws", "Losses"];
	for (var i=0; i < keyCol.length; i++){
		drawRect (iconSize+i*graphWidth/6, y, keySize, keySize, keyCol[i], colorBlack);
		drawText (iconSize+i*graphWidth/6+ textSize+textPadding, y+textSize-textPadding, textSize, align, textColor, keyText[i]);
	}
	
	// === End of doing the actual graph ===
	
	// Draw the buttons for selecting which part of the season to view
	var buttonWidth = graphWidth/3;
	var buttonY = graphY+graphHeight+graphPadding;
	drawSeasonButton(0, buttonY, buttonWidth, buttonHeight, "Season");
	drawSeasonButton(buttonWidth, buttonY, buttonWidth, buttonHeight, "Both");
	drawSeasonButton(buttonWidth*2, buttonY, buttonWidth, buttonHeight, "Finals");
	
	// Draw another dividing line
	var lineY = buttonY + buttonHeight + graphPadding/2;
	drawLine (0, lineY, svgWidth, lineY, divideLineWidth, colorBlack);
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
	
	
	var startIndex = 1;
	var endIndex = 17;

	if (seasonPart === "Season"){
		endIndex = 14;
	} else if (seasonPart === "Finals") {
		startIndex = 15;
	}
	
	for (var teamIndex = 0; teamIndex<teamNames.length; teamIndex++){
		teamName = teamData[teamIndex].name;
		//console.log("LOOPING THROUGH TEAM, at team " + teamName);
		for(var i=0; i<allGames.length; i++){ // for each year
			//console.log("LOOPING THROUGH YEAR, at year " + i);
			for(var j=0; j<allGames[i].length; j++){ // for each game
				//console.log("LOOPING THROUGH YEAR, at game " + j);
				var match = allGames[i][j];
				var round = match['Round'];
				if (round >= startIndex && round <= endIndex){
					if(gameConcerningThisTeam(match, teamName)){
						var win = winOrLoss(match, teamData[teamIndex]);
					}
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
function drawLeftTri ()  {
	var tip = "Previous Year";
	drawAnImage (barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/LeftArrow.png")
		.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			perSeason();
		});
}

// Draws the next season triangle
function drawRightTri ()  {
	var tip = "Next Year";
	drawAnImage (svgWidth - arrowSize-barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/RightArrow.png")
		.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			perSeason();
		});
}

// Draws the banner displaying the season
function drawBanner (year) {
	return drawAnImage(arrowSize, svgHeight - arrowSize*1.5-barPadding, svgWidth-arrowSize*2, arrowSize*2, "../Resources/banners/banner_"+year+".png" );
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
			} else {
				d3.event.stopPropagation();
				view = "Overall";
			}
			load();
		});
	drawRect (x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorBackround, colorText)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
			} else {
				d3.event.stopPropagation();
				view = "Overall";
			}
			load();
		});
	drawText (x+viewBarWidth/2, y+viewBarHeight/2+5, "20px", "middle", colorText, view)
		.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
			} else {
				d3.event.stopPropagation();
				view = "Overall";
			}
			load();
		});
}

// Draw the buttons for selecting which part of the season to view
function drawSeasonButton(x, y, width, height, type){
	var selectedColour = colorLightBlue;
	var selectedText = colorWhite;
	var unselectedColour = colorWhite;
	var unselectedText = colorLightBlue;
	
	if (seasonPart !== type){
		drawRect (x, y, width, height, unselectedColour, colorWhite)
			.on("click", function(){
				d3.event.stopPropagation();
				seasonPart = type;
				load();
			});
			drawRect (x+2.5, y+2.5, width-5, height-5, unselectedColour, unselectedText)
		.on("click", function(){
				d3.event.stopPropagation();
				seasonPart = type;
				load();
		});
		drawText (x+width/2, y+height/2+5, "20px", "middle", unselectedText, type)
			.on("click", function(){
				d3.event.stopPropagation();
				seasonPart = type;
				load();
			});
	} else {
		drawRect (x, y, width, height, selectedColour, colorWhite);
		drawRect (x+2.5, y+2.5, width-5, height-5, selectedColour, selectedText);
		drawText (x+width/2, y+height/2+5, "20px", "middle", selectedText, type);
	}
}	
// Region switcher
function drawRegionChange (x, y, colorBackround, colorText) {
	drawRect (x, y, viewBarWidth, viewBarHeight, colorBackround, colorWhite)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				load();
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				load();
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				load();
			}
		});
	drawRect (x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorBackround, colorText)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				load();
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				load();
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				load();
			}
		});
	drawText (x+viewBarWidth/2, y+viewBarHeight/2+5, "20px", "middle", colorText, region)
		.on("click", function(){
			if(region === "NZ"){
				d3.event.stopPropagation();
				region = "AU";
				load();
			} else if (region === "AU"){
				d3.event.stopPropagation();
				region = "ALL";
				load();
			} else {
				d3.event.stopPropagation();
				region = "NZ";
				load();
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

