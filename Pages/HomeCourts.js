// COLOURS
var colorDarkBlue = "rgb(0, 122,182)";
var colorLightBlue = "rgb(0, 157, 221)";
var colorWhite = "rgb(255, 255, 255)";
var colorPink = "rgb(237, 0, 140)";
var colorBlack = "rgb(0, 0, 0)";
var colorTie = "rgb(119, 78,181)";

// GLOBAL PADDINGS
var padding = 100;
var barPadding = 20;
var bottomPadding = 75;
var topPadding = 50;
var graphPadding = 50;
var lilBar = 15;
var bigPadding = 200;

// GLOBAL SIZES
var svgWidth = 1000;
var svgHeight = 900;
var barWidth = 100;
var arrowSize = 50;
var teamBannerWidth = 350;
var teamBannerHeight = 100;
var logoWidth = 100;
var viewBarWidth = 150;
var viewBarHeight = 50;
var transformX = svgWidth/4+padding-50;
var transformY = padding*5;

var view = "Overall";
var selectedCourt = "";
var svg = getNewSVG(svgWidth, svgHeight);

var welcomeMessage = ["Home Court Performance", "You can click on a team to see more information", "about how well they play at their home courts"];
var teamNames = ["Adelaide Thunderbirds", "Melbourne Vixens", "West Coast Fever", "New South Wales Swifts", "Queensland Firebirds", "Waikato Bay of Plenty Magic", "Northern Mystics", "Southern Steel", "Central Pulse", "Canterbury Tactix"];
var year = 2013;
overall();

function perSeason () {
	d3.csv('data/'+year+'-Table1.csv', function (error, data){
			if(error){return;}
			clearSVG();
			//console.log (data);
			
			var years = [data];
			var teams = populateTeams (years);
			drawSeason(teams);
			
			
	});
}

function drawSeason (teams) {
	svgHeight = 925;
	svg = getNewSVG (svgWidth, svgHeight);
	svgHeight = 900;
	clearSVG();
	drawGraph (teams);
	drawHeading ();
	drawViewChange (svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
	drawBanner ();
	if(year===2013){
		drawLeftTri();
	}else if(year===2008){
		drawRightTri();
	}else{
		drawLeftTri();
		drawRightTri();
	}
}

// returns the team given's score in position 0 and the other in pos 1 
function getScores (team, match) {
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

function overall () {
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
							var teams = populateTeams (years);
							drawOverall (teams) ;
							
						});	
					});
				});
			});	
		});
	});
}

function drawOverall (teams) {
	
	svgHeight = 825;
	svg = getNewSVG (svgWidth, svgHeight);
	svgHeight = 800;
	clearSVG();
	drawHeading ();
	drawViewChange (svgWidth-viewBarWidth-barPadding, barPadding+5, colorWhite, colorLightBlue);
	drawGraph (teams);
}

function populateTeams (data) {
	var teams = [];
	for (var i=0; i<teamNames.length; i++){
		teams[i] = {
			name : teamNames[i],
			matches : []
		}
	}
	for (var i=0; i<data.length; i++){	
		for (var j=0; j<data[i].length; j++){
			if(data[i][j].Date.indexOf("BYES") === -1){ // counting byes breaks this
				var teamIndex = findIndexOfTeam (data[i][j]['Home Team']);
				var team = teams[teamIndex];				
				var arrayLength = team['matches'].length;
				team['matches'][arrayLength] = data[i][j];
			}
		}	
	}
	
	return teams;
}

function drawGraph (teams) {
	var convertToRad = Math.PI / 180;
	var endAngle = 0;
	var total = findTotal (teams);
	
	for (var i = 0; i < teams.length; i++) {
        var proportion = teams[i].matches.length / total * 360;// in degrees
        var outerRadius = 260;
		var color = colorLightBlue;
        if (teams[i].name===selectedCourt) {
			var tempAngle = endAngle;
			var wins = calcWins (teams[i]);
			for(var w=0; w<wins.length; w++){
				var flush = 0.1;
				var proTemp = wins[w]/ teams[i].matches.length*proportion;
				if(wins[w]!==0){
					if (w===0)color = colorPink;
					if (w===1)color = colorTie;
					if (w===2){
						color = colorLightBlue;
						flush = 1;
					}
					var arc = d3.svg.arc()
						.innerRadius(outerRadius+1)
						.outerRadius(300)
						.startAngle(tempAngle) //converting from degs to radians
						.endAngle(tempAngle + (proTemp - flush) * convertToRad); //just radians
					tempAngle += (proTemp) * convertToRad;
					drawArc (teams, teams[i], arc, colorWhite, color, transformX, transformY) ;		
				}				
			}
            color = colorPink;
			drawTeamInfo (wins, teams[i]);
        }
        else {
            outerRadius = 260;
            color = colorLightBlue;
        }
        var arc = d3.svg.arc()
            .innerRadius(140)
            .outerRadius(outerRadius)
            .startAngle(endAngle) //converting from degs to radians
            .endAngle(endAngle + (proportion - 1) * convertToRad); //just radians
        endAngle += proportion * convertToRad;
		drawArc (teams, teams[i], arc, color, colorWhite, transformX, transformY) ;
		
		drawImages (arc, transformX, transformY, teams[i], teams);
		
        }
	
	if(selectedCourt === ""){drawGenericInfo (teams);}
	
}

function drawTeamInfo (wins, team) {
	// draw stuff in the middle
	var winPos = transformY-25;
	var tiePos = transformY;
	var lossPos = transformY+25;
	if(wins[1]!== 0) {
		winPos -=25;
		lossPos +=25;
	}
	else if (wins[1] === 0 && wins[2]===0) winPos = transformY;
	else if (wins[1] === 0 && wins[0]===0) lossPos = transformY;
	if(wins[0]!==0) drawText ("Home Wins : "+wins[0], transformX, winPos, 20, "middle", colorPink);
	if(wins[1]!==0) drawText ("Home Ties : "+wins[1], transformX, tiePos, 20, "middle", colorTie);
	if(wins[2]!==0) drawText ("Home Losses : "+wins[2], transformX, lossPos, 20, "middle", colorLightBlue);
	
	var courts = workCourts (team);
	
	// draw side bar
	courts.sort (function(a, b){
		return b.count-a.count;
	});
	
	var xPad = 390;
	var yPad = 400;
	var yHeader = 75;
	
	var textY = 425;
	var textX = 375;
	var textPad = 50;
	
	drawABar (svgWidth-xPad, transformY-yPad/2, xPad-barPadding, yPad, colorLightBlue, colorWhite);
	drawABar (svgWidth-xPad+barPadding/2, transformY-yPad/2+barPadding/2, xPad-barPadding*2, yHeader, colorWhite, colorWhite);
	drawText ("Top Played Courts", svgWidth-xPad+barPadding/2+(xPad-barPadding*2)/2, transformY-yPad/2+barPadding/2 + (yHeader+25)/2, 35, "middle", colorLightBlue);
	drawText ("Court", svgWidth-textX, textY, 20, "start", colorWhite);
	drawText ("#Games", svgWidth-barPadding*2, textY, 20, "end", colorWhite);
	
	var maxCourts = 5;
	if (courts.length<maxCourts) maxCourts = courts.length;
	for (var i=0; i<maxCourts; i++){
		var name = courts[i].name;
		var res = name.split(" and ");
		name = res[0];
		if (res.length>1){name += " & " + res[1];}
		drawText (name + "  ", svgWidth-textX, textY+textPad+i*textPad, 15, "start", colorWhite);
		drawText (courts[i].count, svgWidth-barPadding*2, textY+textPad+i*textPad, 15, "end", colorWhite);
	}
	
	
}

function drawGenericInfo (teams) {
	var courts = [];
	for(var i=0; i<teams.length; i++){
		var c = workCourts(teams[i]);
		for (var j=0; j<c.length; j++){
			courts[courts.length] = c[j];
		}
	}
	// draw side bar
	courts.sort (function(a, b){
		return b.count-a.count;
	});
	
	var xPad = 390;
	var yPad = 400;
	var yHeader = 75;
	
	var textY = 425;
	var textX = 375;
	var textPad = 50;
	
	drawABar (svgWidth-xPad, transformY-yPad/2, xPad-barPadding, yPad, colorLightBlue, colorWhite);
	drawABar (svgWidth-xPad+barPadding/2, transformY-yPad/2+barPadding/2, xPad-barPadding*2, yHeader, colorWhite, colorWhite);
	drawText ("Top Played Courts", svgWidth-xPad+barPadding/2+(xPad-barPadding*2)/2, transformY-yPad/2+barPadding/2 + (yHeader+25)/2, 35, "middle", colorLightBlue);
	drawText ("Court", svgWidth-textX, textY, 20, "start", colorWhite);
	drawText ("#Games", svgWidth-barPadding*2, textY, 20, "end", colorWhite);
	
	var maxCourts = 5;
	if (courts.length<maxCourts) maxCourts = courts.length;
	for (var i=0; i<maxCourts; i++){
		var name = courts[i].name;
		var res = name.split(" and ");
		name = res[0];
		if (res.length>1){name += " & " + res[1];}
		drawText (name + "  ", svgWidth-textX, textY+textPad+i*textPad, 15, "start", colorWhite);
		drawText (courts[i].count, svgWidth-barPadding*2, textY+textPad+i*textPad, 15, "end", colorWhite);
	}
}

function workCourts (team) {
	var courts = [];
	
	for (var i=0; i< team.matches.length; i++){
		var court = findCourt (courts, team.matches[i]);
		if (court==="not found"){
			courts[courts.length] = {
				name : team.matches[i].Venue,
				count : 1			
			}
		} else {
			court.count ++;		
		}
	
	}
	return courts;
}

function findCourt (courts, match) {
	for (var i=0; i<courts.length; i++){
		if (courts[i].name === match.Venue ) {
			return courts[i];
		}
	}	
	return "not found";
}

function calcWins (team) {
	var wins = [0, 0, 0]; // pos : 0=win, 1=tie, 2=loss
	for(var i=0; i<team.matches.length; i++){
		if (team.matches[i]['Home Score']>team.matches[i]['Away Score']){
			wins[0]++;
		} else if (team.matches[i]['Home Score']===team.matches[i]['Away Score']){
			wins[1]++;
		} else{
			wins[2]++;
		}
	}
	return wins;
}

function drawImages (arc, transformX, transformY, team, teams) {
	svg.append("svg:image")
			.attr("transform", function(d){
				// Reposition so that the centre of the image (not the top left corner)
				// is in the centre of the arc
				var x = arc.centroid(d)[0] - logoWidth/2+transformX;
				var y = arc.centroid(d)[1] - logoWidth/2+transformY;
				return "translate(" + x + "," + y + ")";
			})
			.attr("xlink:href","../Resources/logos/logo_" + team.name + ".png")
			.attr("width", logoWidth)
			.attr("height", logoWidth)
			.on("click", function(){
				if (team.name===selectedCourt){selectedCourt = "";}
				else{selectedCourt = team.name;}
				if (view === "Overall"){
					drawOverall (teams);
				}else {
					drawSeason (teams);
				}
			});
}

function drawArc (teams, team, arc, colorStroke, colorFill, x, y) {
	        svg.append("path") // draw the arc
            .attr("d", arc)
			.attr("stroke-width", 2)
			.attr("stroke", colorStroke)
            .attr("fill", colorFill)
            .attr("transform", "translate(" + x + ", " + y + ")")
			.on("click", function(){
				if (team.name===selectedCourt){selectedCourt = "";}
				else{selectedCourt = team.name;}
				if (view === "Overall"){
					drawOverall (teams);
				}else {
					drawSeason (teams);
				}
			});

}

function findTotal (teams) {
	var total = 0;
	for (var i=0; i<teams.length; i++){
		total = total + teams[i].matches.length;
	}
	return total;
}

function findIndexOfTeam (team) {
	for (var i=0; i<teamNames.length; i++){
		if (teamNames[i]===team) {
			return i;
		}
	}
	return -1;
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

function drawLeftTri ()  {
	var tip = "Previous Year";
	var image = drawImage ("../Resources/arrows/LeftArrow.png", barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize);
	image.on('click', function(){
			d3.event.stopPropagation();
			year = year - 1;
			perSeason();
		});
}

function drawRightTri ()  {
	var tip = "Next Year";
	var image = drawImage ("../Resources/arrows/RightArrow.png", svgWidth - arrowSize-barPadding, svgHeight - arrowSize-barPadding, arrowSize, arrowSize);
	image.on('click', function(){
			d3.event.stopPropagation();
			year = year + 1;
			perSeason();
		});
}

function drawImage (name, x, y, width, height) {
	return svg.append("svg:image")
		.attr("xlink:href", name)
		.attr("x", x )
        .attr("y", y)
        .attr("width", width)
        .attr("height", height)
}

function drawBanner () {
	return drawImage("../Resources/banners/banner_"+year+".png", arrowSize, svgHeight - arrowSize*2, (svgWidth-2*arrowSize), arrowSize*2 );
}

function drawViewChange (x, y, colorBackround, colorText) {
	var rect1 = drawABar(x, y, viewBarWidth, viewBarHeight, colorBackround, colorWhite);
	rect1.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason ();
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall ();
			}
		});
	var rect2 = drawABar(x+2.5, y+2.5, viewBarWidth-5, viewBarHeight-5, colorWhite, colorText);
	rect2.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason ();
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall ();
			}
		});
	var text = drawText (view, x+viewBarWidth/2, y+viewBarHeight/2+5, 20, "middle", colorText);
	text.on("click", function(f){
			if(view === "Overall"){
				d3.event.stopPropagation();
				view = "Per Season";
				perSeason ();
			} else {
				d3.event.stopPropagation();
				view = "Overall";
				overall ();
			}
		});
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
