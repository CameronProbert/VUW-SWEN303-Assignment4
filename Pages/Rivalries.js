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

//doPage();

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
										if (matchups[i].team1 === allData[countData][countEntry]['Home Team']){
											if (matchups[i].team2 === allData[countData][countEntry]['Away Team']){
												// This matchup so add one to the number of games played
												matchups[i].games++;

												// Check to see if team1 won
												var score = allData[countData][countEntry].Score;
												console.log(score);
												var res = score.split(/-|–/);
												res[0] = doTrim(res[0]);
												res[1] = doTrim(res[1]);
												if (res[0] > res[1]){
													matchups[i].won++;
												}
											}
										} else if (matchups[i].team1 === allData[countData][countEntry]['Away Team']){
											if (matchups[i].team2 === allData[countData][countEntry]['Home Team']){
												// This matchup so add one to the number of games played
												matchups[i].games++;

												// Check to see if team1 won
												var score = allData[countData][countEntry].Score;
												var res = score.split("-");
												res[0] = doTrim(res[0]);
												res[1] = doTrim(res[1]);
												if (res[1] > res[0]){
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
							console.log(rivalries.length);

							// Find the top 6 rivalries (closest to 50% wins each team in a matchup)
							for (var i = 0; i < rivalries.length; i++){

							}
						});
					});
				});
			});
		});
	});
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
				games:0,
				wins:0
			};
			//matchups[numRivalries].team1 = allTeams[teamCount];
			//matchups[numRivalries].team2 = allTeams[oppTeamCount];
			//matchups[numRivalries].games = 0;
			//matchups[numRivalries].wins = 0;
			numRivalries++;
		}
	}
	return matchups;
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
