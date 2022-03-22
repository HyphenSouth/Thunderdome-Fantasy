var players = []; 			//list of players
var dedPlayers = []; 		//list of dead players
var terrain = [];			//2d array for terrain objects
var doodads = [];			//list of items
var riverSpawns = [];		//rivers?
var doodadsNum = 0;			//number of doodads spawned, used for ids
var interval = 1500;		//something for animation?
var mapSize = 1000;			//diameter of the map. 
var initDone = false;		//if initialization of the game is done
var playing = false;		//if the game is auto playing
var day = 0;				//the day
var hour = 8;				//the hour of the day
var iconSize = 24;			//the size of each icon
var moralNum = {"Chaotic":0,"Neutral":0,"Lawful":0};		//dict for moral
var personalityNum = {"Evil":0,"Neutral":0,"Good":0};		//dict for personality
var terrainDeath = 3; 		//Max num who can fall off a cliff	
var sexSword = true;		//if sex sword is able to be found
var dirArr = [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]]; 	//some array to go through the directions i guess
var lastT = 0;	//no clue what this does
var timerClicks = {};
var messages = [];
var lastMessage = -1;

var log_msg=true

$( document ).ready(function(){
	Init();
	//draw each player
	players.forEach(function(chara,index){
		chara.draw();
	});
});
//initialize the start screen
function Init(){
	if($('body').width() > $('body').height()){
		$('#map').width($('#map').height());
		$('#map').height($('#map').width());
		$('#side').width("calc(100% - 40px - " + ($('#map').width() + 100) + "px)");
		$('#side').css({'max-height':'100%','overflow-y':'scroll'});
	} else {
		$('#map').width('calc(100% - 40px)');
		$('#map').height($('#map').width());
		$('#map').width($('#map').height());
		$('#side').width("100%");
		$('#side').css({'max-height':'calc(100% - 40px - ' + $('#map').height() + "px)",'overflow-y':'scroll'});
	}
	//put player icons into the player div to generate player table on start screen
	charlist.forEach(function(i,index){
		$('#cnt_players').append("<div class='cnt_player'><input class='name' value='" + i[0] + "'><input class='img' value='" + i[1] + "'></div>");
	});
	//add empty row at the end
	$('#cnt_players').append("<div class='cnt_player'><input class='name' value=''><input class='img' value=''></div>");
	initDone = true;
	//if a player as added on the last row, add new empty row below it
	$('#cnt_players').on('change','.name',function(){
		if($('#cnt_players .name').last().val()){
			$('#cnt_players').append("<div class='cnt_player'><input class='name' value=''><input class='img' value=''></div>");
	}
});
}
//clears all players
function resetPlayers(){
	//add a single row into the player table
	$('#cnt_players').html("<div class='cnt_player'><input class='name' value=''><input class='img' value=''></div>");
}
//start the game
function startGame(){
	//temp list of characters
	charlist = [];
	//go through each player in the player table
	$('#cnt_players .cnt_player').each(function(){
		//if there is a name in this column
		if($(this).find('.name').val())
			//add the name and image into charlist
			charlist.push([$(this).find('.name').val(),$(this).find('.img').val()]);
	});
	//clear the player table
	$('#table').html('');
	//go through charlist
	for(var i = 0;i<charlist.length;i++){
		//get a random starting point for the player
		let x = 0;
		let y = 0;
		do {
			x = Math.floor(Math.random() * mapSize);
			y = Math.floor(Math.random() * mapSize);
		} while(!boundsCheck(x,y)); //make sure it is in bounds
		let tempChar = "";
		//create player object
		if(charlist[i]){
			tempChar = new Char(charlist[i][0],charlist[i][1],x,y);
		} else {
			tempChar = new Char("char" + i,"",x,y);
		}
		//draw the player
		tempChar.draw();
		//add the player obj into the player list
		players.push(tempChar);
	}
	//something for drawing probably
	setInterval(timer,interval);
}
//something for progressing turns
function timer(){
	if(playing){
		turn();
	}
}
//toggle autoplay
function auto(){
	playing = !playing;
}
//progress turn for each player
function turn(){
    log_message('================================== start of turn ==================================');
	let numReady = 0;// number of players that are ready
	players.forEach(function(chara,index){
		//check if the player has finished its actions for the turn
		if(chara.finishedAction)
			numReady++;
	});
	//if all players are ready
	if(numReady == players.length){
		//change bg color based on time of day
		switch(hour){
			case 7:
			case 20:
				$('#map').css('background','rgb(0,90,0)');
				break;
			case 6:
			case 21:
				$('#map').css('background','rgb(0,50,0)');
				break;
			case 8:
				$('#map').css('background','rgb(0,128,0)');
				break;
			case 22:
				$('#map').css('background','rgb(0,20,0)');
				break;
		}
		//randomize the player list
		players.sort(() => Math.random() - 0.5);
		players.forEach(chara => chara.plannedAction = "");
		players.forEach(chara => chara.finishedAction = false);
		//plan an action for each player
		players.forEach(function(chara,index){
			chara.planAction();
		});
	}
    action()
}
//some sort of action
function action(){
    log_message("performing actions");
	//perform actions for each player
	players.forEach(function(chara,index){
		chara.doAction();
	});
	//progress time
	hour++;
	if(hour == 24){
		hour = 0;
		day++;
	}
	$('#day').text("Day " + day + " Hour " + hour);
	//update the info tables
	updateTable();
    log_message('================================== end of turn ==================================');

}
function MapResize(){
	//why is this even here
}

//check if a coordinate is in bounds
function boundsCheck(x,y){
	let valid = true;
	let boundX = Math.abs(x-mapSize/2);
	let boundY = Math.abs(y-mapSize/2);
	let limit = Math.sqrt(Math.pow(mapSize/2,2) - Math.pow(boundX,2));
	if(boundY > limit){
		valid = false;
	}
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			if(terrain[roundX][roundY].type == "w"){
				valid = false;
			}
		}
	}
	return valid;
}
//toggle the info being displayed
function infoDisplay(){
	//block = display players
	//none = deaths
	if($('#table').css('display')=='block'){
		$('#table').css('display','none');
		$('#messages').css('display','block');
	} else {
		$('#table').css('display','block');
		$('#messages').css('display','none');
	}
	
}
//update the info tables
function updateTable(){
	//list status
	if($('#table').css('display')=='block'){
		players.forEach(function(chara,index){
			$("#tbl_" + chara.id + " .energyBar").css("width",(chara.energy/100)*100 + "%");
			$("#tbl_" + chara.id + " .healthBar").css("width",(chara.health/100)*100 + "%");
			$("#char_" + chara.id + " .healthBar").css("width",(chara.health/100)*100 + "%");
			$("#char_" + chara.id + " .energyBar").css("width",(chara.energy/100)*100 + "%");
			if(chara.weapon){
				//$("#char_" + chara.id + " .charWeap").text(chara.weapon.icon);
				$("#char_" + chara.id + " .charWeap").html(chara.weapon.icon);
			} else {
				$("#char_" + chara.id + " .charWeap").text("");
			}
			$("#tbl_" + chara.id + " .status").html(chara.lastAction);
			$("#tbl_" + chara.id + " .kills").text(chara.kills);
			if(chara.weapon){
				//$("#tbl_" + chara.id + " .weapon").text(chara.weapon.icon);
				$("#tbl_" + chara.id + " .weapon").html(chara.weapon.icon);
			} else {
				$("#tbl_" + chara.id + " .weapon").text("");
			}
		});
		dedPlayers.forEach(function(chara,index){
			$("#tbl_" + chara.id + " .kills").text(chara.kills);
			if(chara.weapon){
				//$("#tbl_" + chara.id + " .weapon").text(chara.weapon.icon);
				$("#tbl_" + chara.id + " .weapon").html(chara.weapon.icon);
			} else {
				$("#tbl_" + chara.id + " .weapon").text("");
			}
		});
	} else {//list status
		$('#messages td').css('opacity','0.3');
		players.forEach(function(chara,index){
			if(chara.plannedAction != "move" && chara.plannedAction != "sleep" && chara.plannedAction != "forage"){
				$('#eventMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + chara.img + "'></img>" + chara.name + " " + chara.lastAction + "</td>>");
			}
		});
		dedPlayers.forEach(function(chara,index){
			if(!chara.diedMessage){
                $('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + chara.img + "'></img>" + chara.death + "</td>>");
                chara.diedMessage = "Done";
			}
		});
		/*if(messages.length - 1 > lastMessage){
			for(let i = lastMessage + 1;i < messages.length;i++){
				$('#messages tbody').prepend("<tr><td>Day " + messages[i][2] + " " + messages[i][3] + ":00</td><td><img src='" + messages[i][0].img + "'></img>" + messages[i][1] + "</td>>");
			}
			lastMessage = messages.length - 1;
		}*/
	}
}
//remove value from an array
function arrayRemove(arr, value) { 
	return arr.filter(function(ele){ return ele != value; });
}

//a^2+b^2=c^2
function hypD(x,y,hyp=true){
	if (hyp){
		return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
	} else {
		return Math.sqrt(Math.pow(x,2)-Math.pow(y,2));
	}
}
//get the type of terrain at coords
function terrainCheck(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			return terrain[roundX][roundY].type;
		} else {
			return "Index error";
		}
	}
}
var generated = false;
//generates terrain 
function generateTerrain(){
	//clears all terrain
	terrain.forEach(function(terrRow,i){
		terrRow.forEach(function(terr,j){
			terr.destroy();
		});
	});
	
	riverSpawns = [];
	if(!generated){
	for(var i = 0;i<=mapSize;i+=25){
		terrain[i] = [];
		//timerClick("terrain row " + i);
		for(var j =0;j<=mapSize;j+=25){
			//timerClick("terrain bound check row " + i + " col " + j);
			//check the current coords are in bounds
			if(boundsCheck(i,j)){
				//timerClick("terrain row " + i + " col " + j);
				let tempTerr = new Terrain("rand",i,j); //generate a random terrain		
				//draw terrain and add it to the list
				tempTerr.draw();
				terrain[i][j] = tempTerr;
				//timerClick("terrain row " + i + " col " + j);
			}
			//timerClick("terrain bound check row " + i + " col " + j);
		}
		//timerClick("terrain row " + i);
	}
	timerClick("terrain spread");
	//get the spread terrain value
	if(Math.floor($('#txt_spreadTerrain').val()) > 0){
		//spread the terrain for that amount
		for(var i = 0;i<$('#txt_spreadTerrain').val();i++){
			spreadTerrain();
			//console.log("");
		}
	}
	//generate river
	riverSpawns.forEach(function(river,index){
		//pass in the starting point for the river
		generateRiver(river,true);
	});
	timerClick("terrain spread");
	}
	//generated = true;
}
//spread mountains and rivers
//spreads from left to right and top to bottom
function spreadTerrain(){
	//go through each terrain object and spread
	for(var i = 0;i<=mapSize;i+=25){
		for(var j =0;j<=mapSize;j+=25){
			if(terrain[i][j]){
				terrain[i][j].spread();
			}
		}
	}
}
//generate a river
function generateRiver(river,recursive){
	//pick a random direction to go in
	var dir = Math.floor(Math.random()*8);
	do {
		xDir = Math.floor(Math.random() * 3) - 1;
		yDir = Math.floor(Math.random() * 3) - 1;
	} while (xDir != 0 && yDir != 0);
	//choose random length for river
	var length = Math.floor(Math.random()*20) + 10;
	//console.log(dir);
	//get the coords for the next spot
	var currX = river.x+dirArr[dir][0]*25;
	var currY = river.y+dirArr[dir][1]*25;
	var split = -1;
	//decide to split the river
	if(Math.random() > 0.75 && recursive){
		split = Math.floor(Math.random() * (length - 5) + 10);
	}
	//generate rivers in a line
	for(var i = 0;i<length;i++){
		//console.log(currX + " " + currY)
		if(terrain[currX]){
			if(terrain[currX][currY]){
				terrain[currX][currY].type = "w";
				//terrain[currX][currY].icon = "🔹"
				terrain[currX][currY].draw();
				//generate forks
				if(i == split && recursive){
					generateRiver(terrain[currX][currY],false);
					//console.log("river split");
					//console.log(terrain[currX][currY]);
				}
			} 
		}
		//randomly change direction
		let ChangeDir = Math.floor(Math.random() * 3) - 1;
		dir += ChangeDir;
		if(dir < 0)
			dir = 0;
		if(dir > 7)
			dir = 7;
		//console.log(dir);
		currX += dirArr[dir][0]*25;
		currY += dirArr[dir][1]*25;			
	}
}

function rollSpecialP(tempName){
	let tempArr = [
	"Andou",
	"Parn",
	"Lin Setsu A",
	"Tsukasa",
	"Teppei",
	];
	if (tempArr.includes(tempName)){
		return "Evil";
	} else {
		return "Good";
	}
	
}
function rollSpecialH(tempName){
	if (tempName == 'Evil'){
		return "250";
	} else {
		return "100";
	}
	
}
//roll a range
function roll_range(min, max){
    return Math.floor(Math.random() * (max-min)) + min
}

function roll(options){
	let tempArr = [];
	//console.log(options);
	options.forEach(function(choice,index){
		for(let i =0;i<choice[1];i++){
			tempArr.push(choice[0]);
		}
	});
	//console.log(tempArr);
	tempArr.sort(() => Math.random() - 0.5);
	return tempArr[0];
}
function timerClick(val){
	var d = new Date();
	if(timerClicks[val]) {
		console.log(val + " - " + (d.getTime() - timerClicks[val]));
		timerClicks[val] = "";
	} else {
		timerClicks[val] = d.getTime();
		console.log(val + " started");
	}
}

function log_message(msg){
    if(log_msg==true){
        console.log(msg);
    }    
}