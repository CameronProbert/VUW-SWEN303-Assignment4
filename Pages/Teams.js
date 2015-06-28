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

var welcomeMessage = ["Welcome to the Teams Pages!", "You can click to select a team to see information", "about them"];
var AUTeams = ["Adelaide Thunderbirds", "Melbourne Vixens", "Queensland Firebirds", "New South Wales Swifts", "West Coast Fever"];
var NZTeams = ["Waikato Bay of Plenty Magic", "Northern Mystics", "Southern Steel", "Central Pulse", "Canterbury Tactix"];
var year = 2013;
var svg = getNewSVG(svgWidth, svgHeight);

doPage();

function doPage () {
	svgHeight = 800;
	svg = getNewSVG(svgWidth, svgHeight);
	clearSVG();
	drawHeading ();
	drawASTeams ();
	drawASBanners ();
	drawNZTeams ();
	drawNZBanners ();
}

function perSeason (team) {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			svgHeight = 1625;
			svg = getNewSVG(svgWidth, svgHeight);
			svgHeight = 1500;
			clearSVG();
			drawTitle (team);
			drawViewChange (team, svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
			drawRoundsPerSeason (team, data);
			
			drawBackButton();
			
			drawBanner ();
			if(year===2013){
				drawLeftTri(team);
			}else if(year===2008){
				drawRightTri(team);
			}else{
				drawLeftTri(team);
				drawRightTri(team);
			}
	});
}

function drawRoundsPerSeason (team, data) {
	var matches = findGames (team, data);	
	var maxScore = findMaxScore (team, matches);
	var heightMin = topPadding+padding*2+barPadding+teamBannerHeight;
	var heightMax = svgHeight-(padding);
	var gapX = svgWidth - graphPadding*2-logoWidth;
	var gapY = heightMax-heightMin-graphPadding*2;
	
	drawFrame (heightMin, heightMax);
	var scale = d3.scale.linear()
		.domain([0, maxScore])
		.range([0, gapX]);
	
	for(var i = 0; i<matches.length; i++){
		var score1 = getScores(team, matches[i])[0];
		var score2 = getScores(team, matches[i])[1];
		var x1 = graphPadding;
		var x2 = graphPadding + scale (score1);
		var y = heightMin+graphPadding+i*gapY/matches.length;
		var height = gapY/matches.length-barPadding
		var width1 = scale(score1);
		var width2 = scale(score2);
		drawABar (x1, y, width1, height, colorPink, colorWhite);
		var other = drawABar (x2, y, width2, height, colorLightBlue, colorWhite);
		var otherTeamName = attachLink (x2+scale(score2), y, matches[i], team, other);
		
		// draw other team logo
		drawOtherTeamLogo (x2+width2, y, height, otherTeamName)
		
		// Draw Round Number
		drawText (matches[i]['Round'], barPadding+5, y+height*2/3, 20, "middle", colorBlack);
		
		// Draw score
		drawText (score1, x1+width1-barPadding, y+height*2/3, 20, "end", colorWhite);
		drawText (score2, x2+barPadding, y+height*2/3, 20, "start", colorWhite);
	}
	
}

function attachLink (x, y, match, team, other) {
	var otherTeamName = match['Home Team'];
	if(match['Home Team']===team){otherTeamName = match['Away Team'];}
	other.on ("click", function(){
		perSeason (otherTeamName);
	});
	return otherTeamName;
}

function drawOtherTeamLogo (x, y, barHeight, team) {
	var image = drawAnImage (x+barPadding, y-barPadding/2, barHeight+barPadding, barHeight+barPadding, "../Resources/logos/logo_" + team + ".png");
	image.on("click", function(f){
			perSeason(team);
		})
		.attr("cursor", "pointer");
}

// returns the team given's score in position 0 and the other in pos 1 
function getScores(team, match){
	var scores = [];
	if (team===match['Home Team']){
		scores[0] = match['Home Score'];
		scores[1] = match['Away Score'];
	}else{
		scores[1] = match['Home Score'];
		scores[0] = match['Away Score'];
	}
	return scores;
}

function drawFrame (heightMin, heightMax) {
	
	drawABar (-10, heightMin, svgWidth+20, heightMax-heightMin, colorWhite, colorBlack);

	// graph title
	drawABar (-10, heightMin-graphPadding-barPadding*2, svgWidth+20, graphPadding+barPadding*2, colorWhite, colorBlack);
	drawText ("Score Per Round", svgWidth/2, heightMin-graphPadding+barPadding, 40,"middle", colorBlack);
	
	// keys
		//pink
	drawABar (barPadding, heightMin+barPadding/2, lilBar, lilBar, colorPink, colorWhite);
	drawText ("This team's score", barPadding + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
		//blue
	drawABar (svgWidth/2, heightMin+barPadding/2, lilBar, lilBar, colorLightBlue, colorWhite);
	drawText ("The other team's score", svgWidth/2 + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
}

function findGames (team, data) {
	var matches = [];
	var count = 0;
	for (var i=0; i<data.length; i++){
		if (gameConcerningThisTeam (data[i], team)){
			matches[count] = data[i];
			count++;
		}
	}
	return matches;
}

function findMaxScore (team, matches) {
	var max = 0;
	for (var i=0; i<matches.length; i++){
		var sum = parseInt(matches[i]['Home Score']) + parseInt(matches[i]['Away Score']);
		if (sum>max){
			max = sum;
		}
	}
	return max;
}

function overall(team){
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
							drawTitle (team);
							drawViewChange (team, svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
							svgHeight = 1125;
							svg.attr("height", svgHeight);
							svgHeight = 1000;
							
							drawBackButton ();
							drawStats(years, team);	
						});	
					});
				});
			});	
		});
	});
}

function drawStats (years, team) {
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
	drawGraph (rounds, wonGames, percentage, team);
	
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

function drawGraph (rounds, wonGames, winRate, team) {
	
	// Text
	winRate = Number(winRate).toFixed(2);
	drawText("Number of games won : "+wonGames, logoWidth+teamBannerWidth+barPadding*2, topPadding+padding+teamBannerHeight/2-15, 30, "left", colorBlack);
	drawText("Win rate : "+winRate+"%", logoWidth+teamBannerWidth+barPadding*2, topPadding+padding+teamBannerHeight-15, 30, "left", colorBlack);
	//Border
	var heightMin = topPadding+padding*2+barPadding+teamBannerHeight;
	var heightMax = svgHeight-(barPadding*2);
	drawABar ( -10, heightMin, svgWidth+20, heightMax-heightMin, colorWhite, colorBlack);
	// Graph
	var lowestWR = getLowestandHighestWR(rounds)[0];
	var highestWR = getLowestandHighestWR(rounds)[1];
	// average win rate bar
	heightMax = heightMax - graphPadding;
	winRate = winRate/100; // convert back to decimal from %
	var scale = d3.scale.linear()
		.domain([lowestWR, highestWR])
		.range([0, heightMax-heightMin-graphPadding*2]);
		
	drawLine( (heightMax-graphPadding-scale(winRate)));
	for(var i=1; i<rounds.length; i++){
		var wR;
		if(rounds[i].totalGames!==0){
			wR = rounds[i].wins/rounds[i].totalGames;
		}else{
			wR=0;
		}
		drawBars (i, wR, winRate, lowestWR, highestWR, heightMin, heightMax);
	}
	drawLine(heightMax-graphPadding);
	
	// round numbers
	drawRounds (rounds, heightMax);
	drawText ("Rounds", svgWidth/2, heightMax+graphPadding/2, 40,"middle", colorBlack);
	
	// graph title
	drawABar (-10, heightMin-graphPadding-barPadding*2, svgWidth+20, graphPadding+barPadding*2, colorWhite, colorBlack);
	drawText ("Average Win Rate Per Round", svgWidth/2, heightMin-graphPadding+barPadding, 40,"middle", colorBlack);
	
	// keys
		//pink
	drawABar (barPadding, heightMin+barPadding/2, lilBar, lilBar, colorPink, colorWhite);
	drawText ("Win rates above average", barPadding + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
		//blue
	drawABar (svgWidth/2, heightMin+barPadding/2, lilBar, lilBar, colorLightBlue, colorWhite);
	drawText ("Win rates below average", svgWidth/2 + lilBar*2, heightMin+barPadding+4, 20, "left", colorBlack );
	
}

function drawABar (x, y, width, height, colorFill, colorStroke) {
	return svg.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("width", width)
		.attr("height", height)
		.attr("fill", colorFill)
		.attr("stroke-width", 1)
		.attr("stroke", colorStroke);
	
}

function drawLine (y) {
	return svg.append("line")
		.attr("x1", barPadding)
		.attr("y1", y)
		.attr("x2", svgWidth-barPadding)
		.attr("y2", y)
		.attr("stroke", colorBlack)
		.attr("stroke-width", 3);
}

function drawBars (i, wR, winRate, lowestWR, highestWR, heightMin, heightMax ) {
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
	drawABar (x, y, width, height, color, colorWhite);
	
}

function drawText (text, x, y, size, allign, color){
	return svg.append("text")
        .text(text)
        .attr("x", x) 
        .attr("y", y)
        .attr("font-family", "Verdana")
        .attr("font-size", size+"px")
        .attr("fill", color)
        .attr("text-anchor", allign);
}

function drawRounds (rounds, heightMax){
	for(var i=1; i<rounds.length; i++){
		drawText(i, (i-1)*(svgWidth-4*barPadding)/16+barPadding+10, heightMax-barPadding, 20, colorBlack);
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

function drawASTeams () {
	for (var i=0; i<AUTeams.length; i++){
		var image = drawAnImage (svgWidth/2, bigPadding + i*(teamBannerHeight+barPadding), logoWidth, teamBannerHeight, "../Resources/logos/logo_" + AUTeams[i] + ".png");
		addClick (AUTeams[i], image);
	}
}

function addClick (team, image){
	image.on('click', function(){
			d3.event.stopPropagation();
			overall(team);
	})
	.attr("cursor", "pointer");
}

function drawASBanners () {
	for(var i=0; i<AUTeams.length; i++){
		var image = drawAnImage (barPadding+logoWidth+svgWidth/2, bigPadding+i*(teamBannerHeight+barPadding), teamBannerWidth, teamBannerHeight, "../Resources/banners/banner_" + AUTeams[i] + ".png");
		addClick (AUTeams[i], image );
	}
}

function drawNZTeams () {
	for(var i=0; i<NZTeams.length; i++){
		var logo = drawAnImage (barPadding, bigPadding+i*(teamBannerHeight+barPadding), logoWidth, teamBannerHeight,  "../Resources/logos/logo_" + NZTeams[i] + ".png") ;
		addClick (NZTeams[i], logo);
	}
}

function drawNZBanners () {
	for(var i=0; i<NZTeams.length; i++){
		var image = drawAnImage (barPadding*2+logoWidth, bigPadding+i*(teamBannerHeight+barPadding), teamBannerWidth, teamBannerHeight, "../Resources/banners/banner_" + NZTeams[i] + ".png");
		addClick (NZTeams[i], image );
	}
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

function drawLeftTri (team)  {
	var tri = drawAnImage (barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/LeftArrow.png" );
	tri.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			perSeason(team);
		})
		.attr("cursor", "pointer");
}

function drawRightTri (team)  {
	var tri = drawAnImage(svgWidth - arrowSize-barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize, "../Resources/arrows/RightArrow.png")
	tri.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			perSeason(team);
		})
		.attr("cursor", "pointer");
}

function drawBanner () {
	drawAnImage(arrowSize, svgHeight - arrowSize*2, (svgWidth-2*arrowSize), arrowSize*2, "../Resources/banners/banner_"+year+".png" );
}

function drawAnImage (x, y, width, height, name){ // no on click function tho
	return svg.append("svg:image")
		.attr("xlink:href", name)
		.attr("x", x)
        .attr("y", y)
        .attr("width", width)
        .attr("height", height);
}

function drawViewChange (team, x, y, colorBackround, colorText) {
	var rect1 = drawABar (x, y, viewBarWidth, viewBarHeight, colorBackround, colorBackround);
	rect1.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team);
			}
		})
		.attr("cursor", "pointer");
	var rect2 = drawABar (x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorBackround, colorText);
	rect2.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team);
			}
		})
		.attr("cursor", "pointer");
	var text = drawText(view, x+viewBarWidth/2, y+viewBarHeight/2+5, 20, "middle", colorText)
	text.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason (team);
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall (team);
			}
		})
		.attr("cursor", "pointer");
}

function drawBackButton () {
	var y = svgHeight+50;
	var width = 75;
	drawText ("Go back to main teams page", svgWidth/2, y-40, 20, "middle", colorBlack);
	var image = drawAnImage (svgWidth/2-width/2, y-20, width, width, "../Resources/arrows/BackArrow.png");
	image.on('click', function(){
			d3.event.stopPropagation();
			doPage();
	})
	.attr("cursor", "pointer");
}

function drawTitle (team) {
	// Team Banner
	drawABar (0, 0, svgWidth, padding, colorLightBlue, colorWhite)
	// Team Name
	var textSize = 60;
	if(team === "Waikato Bay of Plenty Magic"){textSize=50;}
	drawText(team, barPadding, topPadding+barPadding, textSize, "left", colorWhite);
	// Logo
	drawAnImage(barPadding, topPadding+padding, logoWidth, teamBannerHeight, "../Resources/logos/logo_" + team + ".png");
	// Banner
	drawAnImage(logoWidth+barPadding, topPadding+padding, teamBannerWidth, teamBannerHeight, "../Resources/banners/banner_" + team + ".png");
}

function drawHeading () {
	drawABar (0, 0, svgWidth, padding*2/3+25, colorLightBlue, colorWhite);
	for(var i=0; i<welcomeMessage.length; i++){
		var size = 60;
		var x = barPadding;
		var color = colorWhite;
		var y = padding*2/3;
		if(i!==0){
			x = barPadding*4;
			size = 30;
			color = colorBlack;
			y = y + i*60;
		} 
		if (i>1){
			y = padding*2/3+i*50;
		}
		drawText (welcomeMessage[i], x, y, size, "left", color);
	}
}
