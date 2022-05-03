var players = []; 			//list of players
var dedPlayers = []; 		//list of dead players
var total_players = 0		//total players
var doodads = [];			//list of items
var doodadsNum = 0;			//number of doodads spawned, used for ids
var turnFightLim = 2		//number of players a player can fight per turn

var terrain = [];			//2d array for terrain objects
var riverSpawns = [];		//rivers?
var mapSize = 1000;			//diameter of the map. 

var interval = 1500;		//something for animation?
var initDone = false;		//if initialization of the game is done
var playing = false;		//if the game is auto playing
var day = 0;				//the day
var hour = 8;				//the hour of the day

var iconSize = 24;			//the size of each icon
var moralNum = {"Chaotic":0,"Neutral":0,"Lawful":0};		//dict for moral
var personalityNum = {"Evil":0,"Neutral":0,"Good":0};		//dict for personality
var terrainDeath = 3; 		//Max num who can fall off a cliff	

var dirArr = [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]]; 	//some array to go through the directions i guess

var timerClicks = {};
var messages = [];
var lastMessage = -1;
var events = [];

var globalAggro = 0;
var dangerSize = 0;		//size of the restricted zone
var dangerActive=false
var safeSize = mapSize/2 -dangerSize; //radius of safe zone
var log_msg=true
var event_length = 130	//max amount of events displayed

var player_line = 
	"<div class='cnt_player'>"+
		//name input
		"<input class='name' value=''>"+
		//img input
		"<input class='img' value=''>"+
		//attribute input
		"<input class='attr' value=''>"+
		//moral select
		"<select class='moral'>"+
			"<option value='Random'>R</option>"+
			"<option value='Lawful'>L</option>"+
			"<option value='Neutral'>N</option>"+
			"<option value='Chaotic'>C</option>"+
		"</select>"+
		//personality select
		"<select class='personality'>"+
			"<option value='Random'>R</option>"+
			"<option value='Good'>G</option>"+
			"<option value='Neutral'>N</option>"+
			"<option value='Evil'>E</option>"+
		"</select>"+
	"</div>"

$( document ).ready(function(){
	document.getElementById('load_file').addEventListener('change', function() {
		var fr=new FileReader();
		fr.onload=function(){
			// resetPlayers();
			log_message("loading data")
			$('#cnt_players').html("");
			loadPlayers(fr.result);
		}
		fr.readAsText(this.files[0]);
	})
	Init();
	//draw each player
	players.forEach(function(chara,index){
		chara.draw();
	});
});

//initialize the start screen
function Init(){
	//calculate some sizes
	if($('body').width() > $('body').height()){
		$('#map').width($('#map').height());
		$('#map').height($('#map').width());
		$('#side').width("calc(100% - 40px - " + ($('#map').width() + 5) + "px)");
		$('#side').css({'max-height':'100%','overflow-y':'scroll'});
	} else {
		$('#map').width('calc(100% - 40px)');
		$('#map').height($('#map').width());
		$('#map').width($('#map').height());
		$('#side').width("100%");
		$('#side').css({'max-height':'calc(100% - 40px - ' + $('#map').height() + "px)",'overflow-y':'scroll'});
	}
	// $('#danger').css('visibility', 'visible');
	$('#danger').height($('#map').height()-10)
	$('#danger').width($('#map').width()-10)
	/*
	//put player icons into the player div to generate player table on start screen
	charlist.forEach(function(i,index){
		$('#cnt_players').append(
			"<div class='cnt_player'>"+
				//name input
				"<input class='name' value='" + i[0] + "'>"+
				//img input
				"<input class='img' value='" + i[1] + "'>"+
				//attribute input
				"<input class='attr'>"+
				//moral select
				"<select class='moral'>"+
					"<option value='Random'>R</option>"+
					"<option value='Lawful'>L</option>"+
					"<option value='Neutral'>N</option>"+
					"<option value='Chaotic'>C</option>"+
				"</select>"+
				//personality select
				"<select class='personality'>"+
					"<option value='Random'>R</option>"+
					"<option value='Good'>G</option>"+
					"<option value='Neutral'>N</option>"+
					"<option value='Evil'>E</option>"+
				"</select>"+
			"</div>");
	});
	*/
	$('#cnt_players').html("");
	loadPlayers(chartext);
	//add empty row at the end
	// $('#cnt_players').append(player_line);
	initDone = true;
	//if a player as added on the last row, add new empty row below it
	$('#cnt_players').on('change','.name',function(){
		if($('#cnt_players .name').last().val()){
			$('#cnt_players').append(player_line);
		}
	});
}

//clears all players
function resetPlayers(){
	//add a single row into the player table
	$('#cnt_players').html(player_line);
}

//load players
function loadPlayers(player_txt){
	let player_lst = player_txt.split("\r\n");
	$('#cnt_players').html("");
	player_lst.forEach(function(player_data){
		// log_message(player_data)
		let player_data_lst = player_data.split(",");
		if(player_data_lst[0]){
			//attribute input
			let attr_lst = player_data_lst[2].split(";");
			let attr_txt = ""
			attr_lst.forEach(function(attr){
				if(attr!=""){
					attr_txt = attr_txt+attr+','
				}
			});	
			attr_txt = attr_txt.substring(0, attr_txt.length-1)
			let morals = {
				"R":"Random",
				"L":"Lawful",
				"N":"Neutral",
				"C":"Chaotic"
			}
			if(!(player_data_lst[3] in morals)){
				player_data_lst[3]="R"
			}
			let personalities = {
				"R":"Random",
				"G":"Good",
				"N":"Neutral",
				"E":"Evil",
			}
			if(!(player_data_lst[4] in personalities)){
				player_data_lst[4]="R"
			}
			$('#cnt_players').append(
				"<div class='cnt_player'>"+
					//name input
					"<input class='name' value='" + player_data_lst[0] + "'>"+
					//img input
					"<input class='img' value='" + player_data_lst[1] + "'>"+
					//attribute input
					"<input class='attr'value='" + attr_txt + "'>"+
					//moral select
					"<select class='moral'>"+
						"<option value='"+morals[player_data_lst[3]] +"' selected hidden>"+player_data_lst[3] +"</option>"+
						"<option value='Random'>R</option>"+
						"<option value='Lawful'>L</option>"+
						"<option value='Neutral'>N</option>"+
						"<option value='Chaotic'>C</option>"+
					"</select>"+
					//personality select
					"<select class='personality'>"+
						"<option value='"+personalities[player_data_lst[4]] +"' selected hidden>"+player_data_lst[4] +"</option>"+
						"<option value='Random'>R</option>"+
						"<option value='Good'>G</option>"+
						"<option value='Neutral'>N</option>"+
						"<option value='Evil'>E</option>"+
					"</select>"+
				"</div>");		
		}
	});
	$('#cnt_players').append(player_line);
	// var file = e.target.files[0];
}

//save players
function savePlayers(){
	log_message("saving")
	let target_file = ""
	target_file = $('#save_file').val();
	
	// csv
	let data = ""
	$('#cnt_players .cnt_player').each(function(){
		//if there is a name in this column
		if($(this).find('.name').val()){
			// add the name and image into charlist
			data = data+$(this).find('.name').val()+",";
			data = data+$(this).find('.img').val()+",";

			let attr = $(this).find('.attr').val().replace(/ /g, "");
			let attr_lst = []
			attr_lst = [...new Set(attr.split(","))];
			let attr_txt = ""
			attr_lst.forEach(function(a){
				if(a != "")
					attr_txt = attr_txt+a+";"
			});
			data = data + attr_txt + ","
			data = data+$(this).find('.moral').val()[0]+",";
			data = data+$(this).find('.personality').val()[0];
			data=data+"\n"
		}
	});
	/*
		// json
		let char_list_data = [];
		$('#cnt_players .cnt_player').each(function(){
		//if there is a name in this column
		if($(this).find('.name').val()){
			// let char_name =  $(this).find('.name').val();
			let char_obj = {}
			char_obj.name = $(this).find('.name').val();
			char_obj.img = $(this).find('.img').val();
			let attr = $(this).find('.attr').val().replace(/ /g, "");
			let attr_lst = []
			attr_lst = [...new Set(attr.split(","))];
			char_obj.attr = attr_lst;
			char_obj.moral = $(this).find('.moral').val()[0];
			char_obj.personality = $(this).find('.personality').val()[0];
			char_list_data.push(char_obj);
			// char_list_data[char_name] = char_obj;
		}
	});
	let data = JSON.stringify(char_list_data);
	*/

	// log_message(save_txt)
	if(target_file!="" && data!=""){	
		let blob = new Blob([data],{type: "text/plain;charset=utf-8"});
		let a = document.createElement('a');
		a.download = target_file+".csv";
		a.href = window.URL.createObjectURL(blob);
		a.click();
	}
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
			charlist.push([$(this).find('.name').val(),
							$(this).find('.img').val(),
							$(this).find('.attr').val(),
							$(this).find('.moral').val(),
							$(this).find('.personality').val()]);
	});
	//clear the player table
	$('#table').html('');
	$('#table').css('display','block');
	$('#messages').css('display','none');
	//go through charlist
	for(var i = 0;i<charlist.length;i++){
		//get a random starting point for the player
		let x = 0;
		let y = 0;
		do {
			x = Math.floor(Math.random() * mapSize);
			y = Math.floor(Math.random() * mapSize);
		} while(!safeTerrainCheck(x,y)); //make sure it is in bounds
		
		let tempChar = "";
		//create player object
		if(charlist[i]){
			//attributes
			let attr = charlist[i][2].replace(/ /g, "");
			let attr_lst = []
			attr_lst = [...new Set(attr.split(","))];
			let filtered_attr = []
			attr_lst.forEach(function(a){
				if(a != "")
					filtered_attr.push(a);
			});

			let moral = ""
			if(charlist[i][3]=="" || charlist[i][3]=="Random")
				moral = roll([['Chaotic',1],['Neutral',2],['Lawful',1]]);
			else
				moral = charlist[i][3]
			
			let personality=""
			if(charlist[i][4]=="" || charlist[i][4]=="Random")
				personality =  roll([['Evil',1],['Neutral',2],['Good',1]]);
			else
				personality = charlist[i][4]
			
			tempChar = new Char(charlist[i][0],charlist[i][1],x,y, filtered_attr, moral, personality);
		} else {
			tempChar = new Char("char" + i,"",x,y,[],"Neutral","Neutral");
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
	log_message('======= start of turn =======');
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
		// players.forEach(chara => chara.plannedAction = "");
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
	log_message("======= performing actions =======");
	//perform actions for each player
	players.forEach(function(chara,index){
		chara.doAction();
	});
	
	//update doodads
	doodadUpdate();
	
	//check death
	players.forEach(function(chara,index){
		chara.limitCheck();		//check if player is dead
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
	log_message('======= end of turn=======');
	log_message("   ")
}

function doodadUpdate(){
	doodads.forEach(function(tD,index){
		tD.update();		//check doodads
	});
}

//terrain layers is the thickness of terrain to be turned into danger zones
function createDangerZone(terrainLayers=1){
	//change the size of the danger zone
	dangerSize=dangerSize + terrainLayers*25;	//width of border
	if(dangerSize>(mapSize/2)*0.75){
		dangerSize = (mapSize/2) * 0.75;
	}
	if(dangerSize<0){
		dangerSize=0;
	}
	safeSize = mapSize/2 -dangerSize; //radius of safe zone
	
	if(!dangerActive){
		$('#danger').css('visibility', 'visible');
		dangerActive=true;
	}
	
	let borderPercent= safeSize/(mapSize/2);
	// log_message(safeSize)
	// log_message(dangerSize)
	$('#danger').height($('#map').height() * borderPercent -10)
	$('#danger').width($('#map').width() * borderPercent-10)
	$('#danger').css('margin-top', ($('#map').height() - ($('#map').height() * borderPercent))/2);
	$('#danger').css('margin-left', ($('#map').width() - ($('#map').width() * borderPercent))/2);
	
	/*
	for(let i = 0; i <= mapSize; i=i+25) {
		for(let j = 0; j <= mapSize; j=j+25) {
			let roundX = mapSize/2 - i;
			let roundY = mapSize/2 - j;
			let dist = hypD(roundX, roundY)
			if(dist>safeSize && inBoundsCheck(i,j)){
				// if(terrain[i]){
					// if(terrain[i][j]){
						// terrain[i][j].destroy();
					// }
				// }
				let tempTerr = new Terrain("w",i,j)
				setTerrain(i,j,tempTerr);
			}
		}
	}
	*/
}

//check if a coordinates are in bounds and safe
function safeTerrainCheck(x,y){
	//safe zone check
	if(!safeBoundsCheck(x,y)){
		return false
	}
	//terrain check
	if(terrainCheck(x,y)=="w"){
		return false
	}
	return true

	/*
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			if(terrain[roundX][roundY].type == "w"){
				valid = false;
			}
		}
	}*/
}

//check if coordinates are in danger zone
function safeBoundsCheck(x, y){
	if(isNaN(x) || isNaN(y)){
		return false;
	}
	let boundX = Math.abs(x-mapSize/2);
	let boundY = Math.abs(y-mapSize/2);
	let dist = hypD(boundX, boundY);
	if(dist>safeSize){
		return false
	}
	return true

	/*
	valid = true
	let safeSize = mapSize/2 -dangerSize;
	let boundX = Math.abs(x-mapSize/2);
	let boundY = Math.abs(y-mapSize/2);
	let limit = Math.sqrt(Math.abs(Math.pow(safeSize,2) - Math.pow(boundX,2)));
	if(boundY > limit){
		valid = false;
	}
	return valid
	*/
}

//check if a coordinates are in bounds
function inBoundsCheck(x, y){
	if(isNaN(x) || isNaN(y)){
		return false;
	}

	let boundX = Math.abs(x-mapSize/2);
	let boundY = Math.abs(y-mapSize/2);
	let dist = hypD(boundX, boundY);
	if(dist > mapSize/2){
		return false
	}
	return true
	/*
	let valid = true;
	let boundX = Math.abs(x-mapSize/2);
	let boundY = Math.abs(y-mapSize/2);
	let limit = Math.sqrt(Math.abs(Math.pow(mapSize/2,2) - Math.pow(boundX,2)));
	if(boundY > limit){
		valid = false;
	}
	return valid;	
	*/
}

//toggle the info being displayed
function infoDisplay(){
	//switch from ststus to events
	if($('#table').css('display')=='block'){
		$('#table').css('display','none');
		$('#messages').css('display','block');
	} 
	//switch from events to status
	else {
		$('#table').css('display','block');
		$('#messages').css('display','none');
	}
	
}

function pushMessage(chara, msg){
	events.push({"chara": chara, "message":msg});
}

var dayColors = ["#282828","#474747"];
var currentDayColor=0;

//update the info tables
function updateTable(){
	//list status
	// if($('#table').css('display')=='block'){
		players.forEach(function(chara,index){		
			//prepare player data
			let wep_text=""
			if(chara.weapon){
				wep_text+=chara.weapon.icon;
			}
			if(chara.offhand){
				wep_text+=chara.offhand.icon;
			}

			let status_text=""
			let icon_status_text = "<br>";
			let icon_count=0;
			chara.status_effects.forEach(function(eff,index){		
				status_text+=eff.icon;
				if(icon_count<3){
					if(eff.icon){
						icon_status_text=icon_status_text+eff.icon + "<br>";
						icon_count++;
					}			
				}
			});
			
			//character icons
			$("#char_" + chara.id + " .healthBar").css("width",(chara.health/chara.maxHealth)*100 + "%");
			$("#char_" + chara.id + " .energyBar").css("width",(chara.energy/chara.maxEnergy)*100 + "%");
			
			
			$("#char_" + chara.id + " .charEff").html(icon_status_text);

			/*
			if(chara.weapon){
				//$("#char_" + chara.id + " .charWeap").text(chara.weapon.icon);
				$("#char_" + chara.id + " .charWeap").html(chara.weapon.icon);
			} else {
				$("#char_" + chara.id + " .charWeap").text("");
			}
			*/
			$("#char_" + chara.id + " .charWeap").html(wep_text);
			
			
			//info bar
			$("#tbl_" + chara.id + " .healthBar").css("width",(chara.health/chara.maxHealth)*100 + "%");
			$("#tbl_" + chara.id + " .energyBar").css("width",(chara.energy/chara.maxEnergy)*100 + "%");
			
			//action
			$("#tbl_" + chara.id + " .status").html(chara.statusMessage);
			
			//kills
			$("#tbl_" + chara.id + " .kills").text(chara.kills);


			$("#tbl_" + chara.id + " .weapon").html(wep_text);			
			$("#tbl_" + chara.id + " .effects").html(status_text);
			// log_message(chara.name +" status txt " + status_text);
		});
		dedPlayers.forEach(function(chara,index){
			$("#tbl_" + chara.id + " .kills").text(chara.kills);
			let wep_text=""
			if(chara.weapon){
				wep_text+=chara.weapon.icon;
			}
			if(chara.offhand){
				wep_text+=chara.offhand.icon;
			}
			$("#tbl_" + chara.id + " .weapon").html(wep_text);
			// if(chara.weapon){
				// $("#tbl_" + chara.id + " .weapon").text(chara.weapon.icon);
				// $("#tbl_" + chara.id + " .weapon").html(chara.weapon.icon);
			// } else {
				// $("#tbl_" + chara.id + " .weapon").text("");
			// }
		});
		doodads.forEach(function(tD,index){
			// $("#char_" + chara.id + " .healthBar").css("width",(chara.health/chara.maxHealth)*100 + "%");
			$("#doodad_" + tD.id).html(tD.icon);
		});
		
		//turn existing messages transparent
		$('#messages td').css('opacity','0.3');
		/*
		//add relevant messages
		players.forEach(function(chara,index){
			if(chara.plannedAction != "move" && chara.plannedAction != "sleep" && chara.plannedAction != "forage"){
				$('#eventMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + chara.img + "'></img>" + chara.name + " " + chara.statusMessage + "</td>>");
			}
		});
		*/
		
		events.forEach(function(msg,index){
			let chara = msg.chara;
			let message = msg.message;
			$('#eventMsg tbody').prepend("<tr><td style='background-color:"+ dayColors[currentDayColor]+";'>Day " + day + " " + hour + ":00</td><td style='background-color:"+ dayColors[currentDayColor]+";'><img src='" + chara.img + "'></img>" + message + "</td>>");
		});
		
		if($('#eventMsg tbody').children().length>event_length){
			let remove_amount = $('#eventMsg tbody').children().length-event_length

			for(let i=0; i<remove_amount; i++){
				// log_message($('#eventMsg tbody').children()[$('#eventMsg tbody').children().length-1])
				$('#eventMsg tbody').children()[$('#eventMsg tbody').children().length-1].remove()
				
			}
		}
		if(events.length>0){
			currentDayColor = (currentDayColor+1)%dayColors.length;
		}
		events=[];
		//list deaths
		dedPlayers.forEach(function(chara,index){
			if(!chara.diedMessage){
				$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + chara.img + "'></img>" + chara.death + "</td>>");
				chara.diedMessage = "Done";
			}
		});
		

	/*
	if($('#table').css('display')=='block'){
	} else {//list events
		//
		if(messages.length - 1 > lastMessage){
			for(let i = lastMessage + 1;i < messages.length;i++){
				$('#messages tbody').prepend("<tr><td>Day " + messages[i][2] + " " + messages[i][3] + ":00</td><td><img src='" + messages[i][0].img + "'></img>" + messages[i][1] + "</td>>");
			}
			lastMessage = messages.length - 1;
		}
	}
	*/
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
//calculate distance between 2 players
function playerDist(p1, p2){
	let dist = 0;
	let x1 = p1.x;
	let y1 = p1.y;
	let x2 = p2.x;
	let y2 = p2.y;
	dist = hypD(x2-x1, y2-y1);	
	return dist;
}
//gets all players within a distance of a point
function nearbyPlayers(x, y, dist){
	let temp_list = [];
	let x1 = x;
	let y1 = y;
	players.forEach(function(tP,index){
		let x2 = tP.x;
		let y2 = tP.y;
		let temp_dist = hypD(x2-x1, y2-y1);	
		if(temp_dist<=dist){
			temp_list.push(tP);
		}
	});
	return temp_list;
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
	dangerSize=0;
	
	riverSpawns = [];
	if(!generated){
	for(var i = 0;i<=mapSize;i+=25){
		terrain[i] = [];
		//timerClick("terrain row " + i);
		//generate reandom terrain pieces
		for(var j =0;j<=mapSize;j+=25){
			//timerClick("terrain bound check row " + i + " col " + j);
			//check the current coords are in bounds
			if(inBoundsCheck(i,j)){
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
				terrain[i][j].generationSpread();
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
	// if (tempName == 'Evil'){
		// return 250;
	// } else {
		// return 100;
	// }
	return 100;
	
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

function log_message(msg, category=""){
	if(log_msg==true){
		console.log(msg);
	}	
}