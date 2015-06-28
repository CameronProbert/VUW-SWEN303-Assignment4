// COLOURS
var colourDarkBlue = "rgb(0, 122,182)";
var colourLightBlue = "rgb(0, 157, 221)";
var colourLighterBlue = "rgb(70, 197, 240)";
var colourWhite = "rgb(255, 255, 255)";
var colourPink = "rgb(237, 0, 140)";
var colourBlack = "rgb(0, 0, 0)";
var colourGrey = "rgb(240, 240, 240)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 1200;
var iconSize = 100;
var rivalryPadding = 30;
var arrowSize = 50;
var graphTop = 130;

// GLOBAL PADDINGS
var padding = 50;
var barPadding = 5;
var bottomPadding = 75;

var RIVALRIES_TO_SHOW = 6;

var selectedRivalry = RIVALRIES_TO_SHOW+1;
var svg;

doPage();

function doPage () {
	// Read in each year's data into data<year>
	d3.csv('data/2008-Table1.csv', function (error, data2008){
		if(error){return;}
		d3.csv('data/2009-Table1.csv', function (error, data2009){
			if(error){return;}
			d3.csv('data/2010-Table1.csv', function (error, data2010){
				if(error){return;}
				d3.csv('data/2011-Table1.csv', function (error, data2011){
					if(error){return;}
					d3.csv('data/2012-Table1.csv', function (error, data2012){
						if(error){return;}
						d3.csv('data/2013-Table1.csv', function (error, data2013){
							if(error){return;}
							
							// Set the height of the svg
							svgHeight = RIVALRIES_TO_SHOW*(iconSize+rivalryPadding)+graphTop;
							if (selectedRivalry<RIVALRIES_TO_SHOW){
								svgHeight+=250;
							}

							// Create a new SVG and then make sure it is clear
							getNewSVG(svgWidth, svgHeight);
							clearSVG();

							// Aggregate the data together
							var allData = [data2008,data2009,data2010,data2011,data2012,data2013];
							var matchups = createRivalries();
							// Iterate through every match to populate matchups
							for (var countData = 0; countData < allData.length; countData++){
								for (var countEntry = 0; countEntry < allData[countData].length; countEntry++){
									for (var i = 0; i < matchups.length; i++){

										// Find if the teams are from this matchup
										if (matchups[i].team1 === allData[countData][countEntry]['Home Team']){ //team1 is Home
											if (matchups[i].team2 === allData[countData][countEntry]['Away Team']){
												// Was this matchup so add one to the number of games played
												matchups[i].games++;
												
												matchups[i].team1score += Number(allData[countData][countEntry]['Home Score']);
												matchups[i].team2score += Number(allData[countData][countEntry]['Away Score']);

												// Check to see if team1 won
												if (allData[countData][countEntry]['Home Score'] > allData[countData][countEntry]['Away Score']){
													matchups[i].won++;
												}
											}
										} else if (matchups[i].team1 === allData[countData][countEntry]['Away Team']){ //team1 is Away
											if (matchups[i].team2 === allData[countData][countEntry]['Home Team']){
												// Was this matchup so add one to the number of games played
												matchups[i].games++;
												
												matchups[i].team1score += Number(allData[countData][countEntry]['Away Score']);
												matchups[i].team2score += Number(allData[countData][countEntry]['Home Score']);

												// Check to see if team1 won
												if (allData[countData][countEntry]['Away Score'] > allData[countData][countEntry]['Home Score']){
													matchups[i].won++;
												}
											}
										}
									}
								}
							}

							// Iterate through each matchup to determine the rivalries
							var rivalries = [];
							for (var i = 0; i < matchups.length; i++){
								var gamesPlayed = matchups[i].games;
								var gamesWon = matchups[i].won;
									if (gamesWon/gamesPlayed >= 0.25 && gamesWon/gamesPlayed <= 0.75){
										rivalries[rivalries.length] = matchups[i];
									}
							}
							
							// Sort the rivalries by closest to 50%
							rivalries.sort(function(a,b){
							
								// Find winrate for each team
								var winRateA = a.won/a.games;
								var winRateB = b.won/b.games;
								
								// Find the absolute difference from 50%
								var diffA = Math.abs(winRateA - 0.5);
								var diffB = Math.abs(winRateB - 0.5);
								
								return diffA-diffB;
							});
							
							var topRivalries = [];
							// Obtain the number of rivalries specified in RIVALRIES_TO_SHOW
							for (var i = 0; i < RIVALRIES_TO_SHOW && i < rivalries.length; i++){
								topRivalries[topRivalries.length] = rivalries[i];
							}
							
							drawRivalries(topRivalries, selectedRivalry, allData);
							
						});
					});
				});
			});
		});
	});
}

function drawRivalries(rivalries, selectedRivalry, allData){

	drawTitle ();

	// Loop through all the rivalries
	for (var count = 0; count < RIVALRIES_TO_SHOW && count < rivalries.length; count++){
	
		// If this is the selected rivalry
		if (count === selectedRivalry){
			drawSelectedRivalry(count, rivalries, allData);
		}
		// If this is not the selected rivalry
		else {
			drawUnselectedRivalry(count, selectedRivalry, rivalries);
		}
	}
}

// Draws the selected rivalry
function drawSelectedRivalry(count, rivalries, allData){

	// Text area variables
	var centreX = 500;
	var centreY = count*(iconSize+rivalryPadding)+iconSize/2+150+graphTop;
	var infoWidth = 560;
	var infoHeight = 300;
	var textSize = 20;
	var textColour = colourWhite;
	var textPaddingSide = 30;
	var textPaddingBetween = 60;
	var textTop = centreY-70;
	var textGap = 5;
	var barWidth = 400;
	
	// Display text box
	drawRect (centreX-infoWidth/2, centreY-infoHeight/2, infoWidth, infoHeight, colourLighterBlue, colourWhite)
		
	// Put info in box
	var strings = ["Games Won", "Points/Game", "Overall Win Rate"];
	var values = [
		[
			rivalries[count].won, 
			rivalries[count].games-rivalries[count].won
		], 
		[
			Number(rivalries[count].team1score/rivalries[count].games).toFixed(1), 
			Number(rivalries[count].team2score/rivalries[count].games).toFixed(1)
		], 
		[
			Number(findPercentage(allData, rivalries[count].team1)).toFixed(1) + "%", 
			Number(findPercentage(allData, rivalries[count].team2)).toFixed(1) + "%"
		]
	];
	
	// Draw all the data inside the table
	for (var col = 0; col < strings.length; col++){
	
		// Headings
		drawText (centreX-infoWidth/2+textPaddingSide, textTop+(textSize+textPaddingBetween)*col, textSize, "start", textColour, strings[col]);
		drawText (centreX+infoWidth/2-textPaddingSide, textTop+(textSize+textPaddingBetween)*col, textSize, "end", textColour, strings[col]);
		
		// Values
		drawText (centreX-textPaddingSide, textTop+(textSize+textPaddingBetween)*col+textSize+textGap, textSize, "end", textColour, values[col][0]);
		drawText (centreX+textPaddingSide, textTop+(textSize+textPaddingBetween)*col+textSize+textGap, textSize, "start", textColour, values[col][1]);
	}
	
	// Add dividing central line
	drawLine (centreX, centreY-infoHeight/2, centreX, centreY+infoHeight/2, 1, colourWhite);
	
	// Display team on left
	drawlogo (100, count*(iconSize+rivalryPadding)+graphTop, iconSize, rivalries[count].team1)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});
	
	// Display team on right
	drawlogo (800, count*(iconSize+rivalryPadding)+graphTop, iconSize, rivalries[count].team2)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	var bannerWidth = iconSize*3;
	var bannerHeight = iconSize;
	var bannerPadding = 10;

	// Display team banners for left teams
	drawTeamBanner (210, count*(iconSize+rivalryPadding)+graphTop, bannerWidth, bannerHeight, rivalries[count].team1)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	// Display team banners for right teams
	drawTeamBanner (800-bannerWidth-bannerPadding, count*(iconSize+rivalryPadding)+graphTop, bannerWidth, bannerHeight, rivalries[count].team2)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	// Display versus symbol in the centre of each banner
	var vsSize = 100;
	drawAnImage (1/2*svgWidth-1/2*vsSize, count*(bannerHeight+rivalryPadding)+graphTop, vsSize, vsSize, "../Resources/banners/banner_VS.png")
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});
}

// Draws a single unselected rivalry
function drawUnselectedRivalry(count, selectedRivalry, rivalries){
	console.log("count: " + count + "| selected: " + selectedRivalry );
	var modifier = 0;
	if (count > selectedRivalry){
		modifier = 250;
	}

	// Display team on left
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/logos/logo_" + rivalries[count].team1 + ".png";
		})
		.attr("x", 100)
		.attr("y", function(){
			
			return count*(iconSize+rivalryPadding)+modifier+graphTop;
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});
	
	// Display team on right
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/logos/logo_" + rivalries[count].team2 + ".png";
		})
		.attr("x", 800)
		.attr("y", function(){
			return count*(iconSize+rivalryPadding)+modifier+graphTop;
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	var bannerWidth = iconSize*3;
	var bannerHeight = iconSize;
	var bannerPadding = 10;

	// Display team banners for left teams
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/banners/banner_" + rivalries[count].team1 + ".png";
		})
		.attr("x", 210)
		.attr("y", function(){
			return count*(iconSize+rivalryPadding)+modifier+graphTop;
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	// Display team banners for right teams
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/banners/banner_" + rivalries[count].team2 + ".png";
		})
		.attr("x", 800-bannerWidth-bannerPadding)
		.attr("y", function(){
			return count*(bannerHeight+rivalryPadding)+modifier+graphTop;
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	// Display versus symbol in the centre of each banner
	var vsSize = 100;
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/banners/banner_VS.png";
		})
		.attr("x", 1/2*svgWidth-1/2*vsSize)
		.attr("y", function(){
			return count*(bannerHeight+rivalryPadding)+modifier+graphTop;
		})
		.attr("width",vsSize)
		.attr("height",vsSize)
		.attr("cursor", "pointer")
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});
}

// Selects the given rivalry, if it is already selected then change it to false
function selectRivalry(index){
	if (selectedRivalry === index){
		selectedRivalry = RIVALRIES_TO_SHOW+1;
	}
	else {
	selectedRivalry = index;
	}
}

// Creates every combination of team matchups
function createRivalries(){
	var matchups = [];
	var allTeams = ["Waikato Bay of Plenty Magic", "Central Pulse", "Northern Mystics", "Southern Steel", "Canterbury Tactix", "Adelaide Thunderbirds", "Melbourne Vixens", "New South Wales Swifts", "Queensland Firebirds", "West Coast Fever"];
	// Create all the matchup objects and push each into matchups array
	var numRivalries = 0;
	for (var teamCount = 0; teamCount < allTeams.length; teamCount++){
		for (var oppTeamCount = teamCount+1; oppTeamCount < allTeams.length; oppTeamCount++){

			// Create a matchup object and initialise it
			matchups[numRivalries] = {
				team1:allTeams[teamCount],
				team2:allTeams[oppTeamCount],
				team1score:0,
				team2score:0,
				games:0,
				won:0
			};
			numRivalries++;
		}
	}
	return matchups;
}

function findPercentage (years, team) {
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
	return wonGames/numGames*100;
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
	drawAnImage (0, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/LeftArrow.png")
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

// Draws the title
function drawTitle () {
	var topPadding = 50;
	// Team Banner
	drawRect (0, 0, svgWidth, 100, colourLightBlue, colourWhite)
	// Team Name
	var textSize = 50;
	var textPadding = 20;
	drawText (textPadding, topPadding+textPadding, textSize, "start", colourWhite, "Top Six Rivalries")
}

// Removes the spaces from the first and last position of strings (if they exist)
function doTrim (str) {
	console.log(str);
	var fin;
	if(str.charAt(0)===" "){
		var finPos = str.length-1;
		fin = str.substring(1, finPos);
	}else{
		fin = str;
	}
	var finPos = fin.length-1;
	if(fin.charAt(finPos)===" "){
		fin = fin.substring(0, finPos-1);
	}
	return fin;
}
