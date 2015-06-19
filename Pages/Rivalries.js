// COLOURS
var colourDarkBlue = "rgb(0, 122,182)";
var colourLightBlue = "rgb(0, 157, 221)";
var colourWhite = "rgb(255, 255, 255)";
var colourPink = "rgb(237, 0, 140)";
var colourBlack = "rgb(0, 0, 0)";
var colourGrey = "rgb(240, 240, 240)";

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 1000;
var iconSize = 100;
var rivalryPadding = 30;
var arrowSize = 50;

// GLOBAL PADDINGS
var padding = 50;
var barPadding = 5;
var bottomPadding = 75;

var RIVALRIES_TO_SHOW = 6;

var selectedRivalry = 0;//RIVALRIES_TO_SHOW+1;

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
							svgHeight = RIVALRIES_TO_SHOW*(iconSize+rivalryPadding);
							if (selectedRivalry<RIVALRIES_TO_SHOW){
								svgHeight+=250;
							}

							// Create a new SVG and then make sure it is clear
							var svg = getNewSVG(svgWidth, svgHeight);
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
							
							drawRivalries(svg, topRivalries, selectedRivalry);
							
						});
					});
				});
			});
		});
	});
}

function drawRivalries(svg, rivalries, selectedRivalry){

	// Loop through all the rivalries
	for (var count = 0; count < RIVALRIES_TO_SHOW && count < rivalries.length; count++){
	
		// If this is the selected rivalry
		if (count === selectedRivalry){
			drawSelectedRivalry(count, svg, rivalries);
		}
		// If this is not the selected rivalry
		else {
			drawUnselectedRivalry(count, selectedRivalry, svg, rivalries);
		}
	}
}

// Draws the selected rivalry
function drawSelectedRivalry(count, svg, rivalries){

	// Text area variables
	var centreX = 500;
	var centreY = count*(iconSize+rivalryPadding)+iconSize/2+150;
	var infoWidth = 560;
	var infoHeight = 300;
	var textSize = 30;
	var textPaddingSide = 5;
	var textPaddingBetween = 40;
	var textTop = centreY-70;
	var barWidth = 400;
	
	// Display text box
	svg.append("rect")
		.attr("x", centreX-infoWidth/2)
		.attr("y", centreY-infoHeight/2)
		.attr("fill", colourGrey)
		.attr("stroke", colourBlack)
		.attr("stroke-width", 3)
		.attr("width", infoWidth)
		.attr("height", infoHeight);
		
	// Put info in box
	var col = 0;
	svg.append("text")
		.text("Games Won")
		.attr("x", centreX-infoWidth/2+textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "start");
		
	svg.append("text")
		.text("Games Won")
		.attr("x", centreX+infoWidth/2-textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "end");
		
	svg.append("text")
		.text(function(){
			return rivalries[count].won;
		})
		.attr("x", centreX-infoWidth/2+textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+textSize+1)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "start");
		
	svg.append("text")
		.text(function(){
			return (rivalries[count].games-rivalries[count].won);
		})
		.attr("x", centreX+infoWidth/2-textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+textSize+1)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "end");
		
	// Find out proportion of games won by team1
	var gamesWonPercentage = rivalries[count].won/rivalries[count].games;
	svg.append("rect")
		.attr("x", centreX-gamesWonPercentage*barWidth)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+4)
		.attr("fill", colourLightBlue)
		.attr("stroke", colourBlack)
		.attr("stroke-width", 3)
		.attr("width", barWidth)
		.attr("height", textSize);
		
	// Add one to col
	col++;
		
	svg.append("text")
		.text("Points/Game")
		.attr("x", centreX-infoWidth/2+textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "start");
		
	svg.append("text")
		.text("Points/Game")
		.attr("x", centreX+infoWidth/2-textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "end");
		
	svg.append("text")
		.text(function(){
			var aveScore = (rivalries[count].team1score/rivalries[count].games);
			aveScore = Number(aveScore).toFixed(1);
			return aveScore;
		})
		.attr("x", centreX-infoWidth/2+textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+textSize+1)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "start");
		
	svg.append("text")
		.text(function(){
			var aveScore = (rivalries[count].team2score/rivalries[count].games);
			aveScore = Number(aveScore).toFixed(1);
			return aveScore;
		})
		.attr("x", centreX+infoWidth/2-textPaddingSide)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+textSize+1)
		.attr("font-family", "Verdana")
		.attr("font-size", textSize)
		.attr("text-anchor", "end");
	
	// Find out proportion of games won by team1
	var scorePercentage = rivalries[count].team1score/(Number(rivalries[count].team1score)+Number(rivalries[count].team2score));
	console.log(rivalries[count].team1score);
	console.log(rivalries[count].team2score);
	console.log((rivalries[count].team1score)+(rivalries[count].team2score));
	console.log(scorePercentage);
	svg.append("rect")
		.attr("x", centreX-scorePercentage*barWidth)
		.attr("y", textTop+(textSize+textPaddingBetween)*col+4)
		.attr("fill", colourLightBlue)
		.attr("stroke", colourBlack)
		.attr("stroke-width", 3)
		.attr("width", barWidth)
		.attr("height", textSize);
	col++;
		
	// Add dividing central line
	svg.append("line")
		.attr("x1", centreX)
		.attr("y1", centreY-infoHeight/2)
		.attr("x2", centreX)
		.attr("y2", centreY+infoHeight/2)
		.attr("stroke", colourBlack)
		.attr("stroke-width", 3);
	
	// Display team on left
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/logos/logo_" + rivalries[count].team1 + ".png";
		})
		.attr("x", 100)
		.attr("y", function(){
			return count*(iconSize+rivalryPadding);
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
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
			return count*(iconSize+rivalryPadding);
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
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
			return count*(iconSize+rivalryPadding);
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
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
			return count*(bannerHeight+rivalryPadding);
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});

	// Display versus symbol in the centre of each banner
	var vsSize = 150;
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/banners/banner_" + rivalries[count].team2 + ".png";
		})
		.attr("x", 800-bannerWidth-bannerPadding)
		.attr("y", function(){
			return count*(bannerHeight+rivalryPadding);
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
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
			return count*(bannerHeight+rivalryPadding);
		})
		.attr("width",vsSize)
		.attr("height",vsSize)
		.on("click",function(){
			selectRivalry(count);
			doPage();
		});
}

// Draws a single unselected rivalry
function drawUnselectedRivalry(count, selectedRivalry, svg, rivalries){
	console.log("count: " + count + "| selected: " + selectedRivalry );
	var modifier = 0;
	if (count > selectedRivalry){
		modifier = 250;
		console.log("Adjusting Modifier");
	}

	// Display team on left
	svg.append("svg:image")
		.attr("xlink:href", function(){
			return "../Resources/logos/logo_" + rivalries[count].team1 + ".png";
		})
		.attr("x", 100)
		.attr("y", function(){
			
			return count*(iconSize+rivalryPadding)+modifier;
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
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
			return count*(iconSize+rivalryPadding)+modifier;
		})
		.attr("width",iconSize)
		.attr("height",iconSize)
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
			return count*(iconSize+rivalryPadding)+modifier;
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
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
			return count*(bannerHeight+rivalryPadding)+modifier;
		})
		.attr("width",bannerWidth)
		.attr("height",bannerHeight)
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
			return count*(bannerHeight+rivalryPadding)+modifier;
		})
		.attr("width",vsSize)
		.attr("height",vsSize)
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

// Creates an svg with the given width and height
function getNewSVG (w, h) {
    var svg = d3.select("#mainsvg")
        .attr("width", w)
        .attr("height", h)
        .attr("class", "centered");
	return svg;
}

// Removes all items from all svgs
function clearSVG () {
	d3.selectAll("svg > *").remove();
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
