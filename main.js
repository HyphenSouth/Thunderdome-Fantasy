var players = []; 			//list of players used for the game
var playerStatic = []; 		//static list of players
var dedPlayers = []; 		//list of dead players
var total_players = 0		//total players
var turnFightLim = 3		//number of players a player can fight per turn
var doodads = [];			//list of items
var doodadsNum = 0;			//number of doodads spawned, used for ids

var generated = false;
var terrain = [];			//2d array for terrain objects
var mapSize = 1000;			//diameter of the map.
var customMap = "";

var interval = 1500;		//time between turns
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
var dangerActive=false;
var safeSize = mapSize/2 -dangerSize; //radius of safe zone
var event_length = 130	//max amount of events displayed
var page_num = 0;
var game_started = false;

var error_count = 0;
window.onerror = function(error) {
	error_count++;
	$('#error').css({'display':"block"});
	$('#error').text(error_count);
};
function errorClick(){
	error_count=0;
	$('#error').css({'display':"none"});
}

$(document).ready(function(){
	//load files
	document.getElementById('load_file').addEventListener('change', function() {
		var fr=new FileReader();
		fr.onload=function(readerEvt){
			// resetPlayers();
			$('#cnt_players').html("");
			if(fileType=="text/csv"){
				log_message("loading data")
				loadPlayersTxt(fr.result);
			}
			else if(fileType=="application/json"){
				log_message("loading data")
				loadPlayersJson(JSON.parse(fr.result));
			}
			$('#cnt_players').append(createPlayerLine());
		}
		fr.readAsText(this.files[0]);
		let fileType = this.files[0].type

	})
	Init();
});
//element coords : ingame cords
var mapXratio = 1;
var mapYratio = 1;
//margins
var marginLeft = 0;
var marginTop = 0;
//converts element coordinates to game coordinates
function elementToGameCoords(coords){
	x = coords[0] - marginLeft;
	x = x/mapXratio;
	y = coords[1] - marginTop;
	y = y/mapYratio;
	return [x,y]
}
//converts game coordinates to element coordinates
function gameToElementCoords(x,y){
	x = coords[0] * mapXratio;
	x = x + marginLeft;
	y = coords[0] * mapYratio;
	y = y + marginTop;
	return [x,y]
}
function getMapClickPosition(e) {
    // xPosition = e.clientX / mapXratio;
    // yPosition = e.clientY / mapYratio;
	xPosition = e.clientX;
    yPosition = e.clientY;

	// console.log(elementToGameCoords([xPosition, yPosition]))
}
//initialize the start screen
function Init(){
	//calculate some sizes
	if($('body').width() > $('body').height()){
		$('#map').width($('#map').height());
		$('#map').height($('#map').width());
		$('#side').width("calc(100% - 40px - " + ($('#map').width() + 5) + "px)");
		// $('#side').css({'max-height':'100%','overflow-y':'scroll'});
		$('#side').css({'max-height':'100%'});
	} else {
		$('#map').width('calc(100% - 40px)');
		$('#map').height($('#map').width());
		$('#map').width($('#map').height());
		$('#side').width("100%");
		// $('#side').css({'max-height':'calc(100% - 40px - ' + $('#map').height() + "px)",'overflow-y':'scroll'});
		$('#side').css({'max-height':'calc(100% - 40px - ' + $('#map').height() + "px)"});
	}
	// $('#danger').css('visibility', 'visible');
	$('#danger').height($('#map').height()-10)
	$('#danger').width($('#map').width()-10)

	$('#effects').height($('#map').height());
	$('#effects').width($('#map').width());

	$('#cnt_players').html("");
	// loadPlayersTxt(chartext);
	loadPlayersJson(charlist);

	//add empty row at the end
	$('#cnt_players').append(createPlayerLine());
	initDone = true;
	//if a player as added on the last row, add new empty row below it
	$('#cnt_players').on('change','.name',function(){
		if($('#cnt_players .name').last().val()){
			$('#cnt_players').append(createPlayerLine());
		}
	});
	mapXratio = $('#map').width()/mapSize;
	mapYratio = $('#map').height()/mapSize;
	marginTop = parseInt($('#map').css('margin-top').replace('px',''))
	marginLeft = parseInt($('#map').css('margin-left').replace('px',''))
	$('#map')[0].addEventListener("click", getMapClickPosition, false);
}

//clears all players
function resetPlayers(){
	//add a single row into the player table
	$('#cnt_players').html(createPlayerLine());
}

//load players from csv
function loadPlayersTxt(player_txt){
	player_txt=player_txt.replace(/\r\n/g,"\n")
	let player_lst = player_txt.split("\n");
	player_lst.forEach(function(player_data, index){
		let player_data_lst = player_data.split(",");
		if(player_data_lst[0]){
			let img_txt=""
			if(player_data_lst.length>=2){
				img_txt = player_data_lst[1]
			}

			let attr_txt = ""
			if(player_data_lst.length>=3){
				//process attributes
				let attr_lst = player_data_lst[2].split(";");
				attr_lst.forEach(function(attr){
					if(attr!=""){
						attr_txt = attr_txt+attr+','
					}
				});
				//remove last comma
				attr_txt = attr_txt.substring(0, attr_txt.length-1)		//remove last comma
			}

			let morals = {"R":"Random","L":"Lawful","N":"Neutral","C":"Chaotic"}
			let moral_txt = "Random"
			if(player_data_lst.length>=4 && (player_data_lst[3] in morals)){
				moral_txt = morals[player_data_lst[3]]
			}

			let personalities = {"R":"Random","G":"Good","N":"Neutral","E":"Evil"}
			let personalities_txt = "Random"
			if(player_data_lst.length>=5 && (player_data_lst[4] in personalities)){
				personalities_txt = personalities[player_data_lst[4]]
			}

			//add into the table
			$('#cnt_players').append(createPlayerLine(player_data_lst[0], img_txt, attr_txt, moral_txt, personalities_txt));
		}
	});
}

//load players from json
function loadPlayersJson(players_obj){
	players_obj.forEach(function(player_data, index){
		let attr_txt = ""
		if(player_data.attr){
			player_data.attr.forEach(function(attr){
				if(attr!=""){
					attr_txt = attr_txt+attr+','
				}
			});
			//remove last comma
			attr_txt = attr_txt.substring(0, attr_txt.length-1)
		}
		let morals = {"R":"Random","L":"Lawful","N":"Neutral","C":"Chaotic"}
		let moral_txt = "Random"
		if(player_data.moral && (player_data.moral in morals)){
			moral_txt = morals[player_data.moral]
		}

		let personalities = {"R":"Random","G":"Good","N":"Neutral","E":"Evil"}
		let personalities_txt = "Random"
		if(player_data.personality && (player_data.personality in personalities)){
			personalities_txt = personalities[player_data.personality]
		}

		$('#cnt_players').append(createPlayerLine(player_data.name, player_data.img, attr_txt, moral_txt, personalities_txt));

	});
}

function createPlayerLine(name='', img='', attr='', moral='Random', personality='Random'){
	let player_line = `<div class='cnt_player'>
		<input class='name' value='${name}'><input class='img' value='${img}'><input class='attr' value='${attr}'><select class='moral'>
			<option value='${moral}' selected hidden>${moral[0]}</option>
			<option value='Random'>R</option>
			<option value='Lawful'>L</option>
			<option value='Neutral'>N</option>
			<option value='Chaotic'>C</option>
		</select><select class='personality'>
			<option value='${personality}' selected hidden>${personality[0]}</option>
			<option value='Random'>R</option>
			<option value='Good'>G</option>
			<option value='Neutral'>N</option>
			<option value='Evil'>E</option>
		</select>
		</div>`
	return player_line
}

//saves the results of the game
function saveResults(filename = ''){
	result_str = 'alive\n';
	//living players
	players.forEach(function(tP){
		result_str = result_str +
					 '0,' +
					 tP.name + ',' +
					 tP.kills + '\n';
	});
	result_str = result_str + 'dead\n'
	placement = playerStatic.length - dedPlayers.length;
	//dead players
	for(let i=dedPlayers.length-1; i>=0; i--){
		dP = dedPlayers[i];
		result_str = result_str +
					 placement + ',' +
					 dP.name + ',' +
					 dP.kills + ',' +
					 dP.death + '\n';
		placement++;
	}

	log_message(result_str)
	if(filename == ''){
		let date = new Date();
		filename = 	date.getDate() + '_' +
					(date.getMonth()+1) + '_' +
					date.getFullYear() + '_' +
					date.getHours() + ':' + date.getMinutes()+
					'_results'
	}

	let blob = new Blob([result_str],{type: "text/plain;charset=utf-8"});
	let a = document.createElement('a');
	a.download = filename+".csv";
	a.href = window.URL.createObjectURL(blob);
	a.click();
}

//save players
function savePlayers(){
	if($('input[name="save_type"]:checked').val()=='csv'){
		log_message("saving as csv")
		savePlayersTxt();
	}
	else{
		log_message("saving as json")
		savePlayersJson();
	}
}

function savePlayersTxt(){
	// csv
	let data = ""
	$('#cnt_players .cnt_player').each(function(){
		//if there is a name in this column
		if($(this).find('.name').val()){
			// add the name and image into charlist
			data = data+$(this).find('.name').val()+",";
			data = data+$(this).find('.img').val()+",";

			let attr = $(this).find('.attr').val().replace(/ /g, "_");
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
	let target_file = ""
	target_file = $('#save_file').val();
	// log_message(save_txt)
	if(target_file!="" && data!=""){
		let blob = new Blob([data],{type: "text/plain;charset=utf-8"});
		let a = document.createElement('a');
		a.download = target_file+".csv";
		a.href = window.URL.createObjectURL(blob);
		a.click();
	}
}

function savePlayersJson(){
	// csv
	let char_list_data = [];
	$('#cnt_players .cnt_player').each(function(){
		//if there is a name in this column
		if($(this).find('.name').val()){
			// let char_name =  $(this).find('.name').val();
			let char_obj = {}
			char_obj.name = $(this).find('.name').val();
			char_obj.img = $(this).find('.img').val();
			let attr = $(this).find('.attr').val().replace(/ /g, "_");
			let attr_lst = [...new Set(attr.split(","))];
			if(attr_lst.length>0 && !(attr_lst.length==1 && attr_lst[0]=="")){
				char_obj.attr = attr_lst;
			}
			if($(this).find('.moral').val()[0]!='R'){
				char_obj.moral = $(this).find('.moral').val()[0];
			}
			if($(this).find('.personality').val()[0]!='R'){
				char_obj.personality = $(this).find('.personality').val()[0];
			}
			char_list_data.push(char_obj);
		}
	});

	let target_file = ""
	target_file = $('#save_file').val();
	if(target_file!="" && char_list_data!=""){
		let blob = new Blob([JSON.stringify(char_list_data)],{type: "text/plain;charset=utf-8"});
		let a = document.createElement('a');
		a.download = target_file+".json";
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
	// $('#table').html('');
	$('#player_prep').css('display','none');
	$('#char_lst').css('display','block');
	$('#table').css('display','block');
	$('#messages').css('display','none');
	$('#nav_bar').css('display','block');
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
			let attr_txt = charlist[i][2].replace(/ /g, "_");
			let attr_lst = []
			attr_lst = [...new Set(attr_txt.split(","))];
			let filtered_attr = []

			//set personality and morals
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
			
			//set attributes
			//controlled players
			/*
			if(attr_lst.indexOf('control')>=0 && maxControl>controlledPlayers.length){
				tempChar = new ControlledChar(charlist[i][0],charlist[i][1],x,y, moral, personality);
				controlledPlayers.push(tempChar);
			}
			else
				tempChar = new Char(charlist[i][0],charlist[i][1],x,y, moral, personality);
			*/
			tempChar = new Char(charlist[i][0],charlist[i][1],x,y, moral, personality);
			attr_lst.forEach(function(attr){
				if(attr != ""){
					tempChar.attributes.push(create_attr(attr, tempChar));
				}
			});
		} else {
			tempChar = new Char("char" + i,"",x,y,[],"Neutral","Neutral");
		}
		//draw the player
		tempChar.draw();
		//add the player obj into the player list
		players.push(tempChar);
		playerStatic.push(tempChar);
		playerDistTable.push([])
		page_num=0;
	}
	total_players = players.length;
	max_alliance_size = Math.min(6, 2 + Math.floor(total_players/15))
	max_alliance_count = Math.min(alliance_names.length, 1 + Math.floor(total_players/(max_alliance_size*3)));
	//set up distances and opinions
	playerStatic.forEach(function(tP){
		updatePlayerDists(tP);
		//opinions
		base_opinion = 0
		playerStatic.forEach(function(oP){
			if(tP==oP){
				tP.opinions[oP.id] = 0
			}
			else{
				if(tP.personality == oP.personality){
					//same personality
					tP.opinions[oP.id] = base_opinion + 50
				} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
					//opposing personality
					tP.opinions[oP.id] = base_opinion - 50
				}
				else{
					tP.opinions[oP.id] = base_opinion
				}
			}
		});
	});
	if(customMap)
		customMap.game_start();
	console.log('loading complete')
	game_started = true;
	onStart();
	//set up auto play
	setInterval(timer,interval);
}

function onStart(){
	// globalAggro=5000;
	// createDangerZone(500);
	// playerStatic[0].equip_item(create_weapon('dnagun'));
	// generateJibunWo();
	// customMap.game_start();
	
	// playerStatic[0].equip_item(create_weapon('spicy'));
	// playerStatic[0].equip_item(create_offhand('doll'));
	// playerStatic[0].equip_item(create_offhand('mirror'));
	max_alliance_size = 0;
	max_alliance_count = 0;
	// players.forEach(function(oP){
		// oP.inflict_status_effect(new Skulled(10000))
	// });
}

//keyboard inputs
document.addEventListener('keydown', (e) => {
	// console.log(e.code)
	// console.log(e.key)
	if (!e.repeat){
		switch(e.code){
			case "Space":
				if(game_started)
					turn();
				break;
			case "KeyP":
				if(game_started)
					hidePlayers();
				break;
		}
	}
});
mapEventID=0
mapEvents=[]
function create_map_event(mapEvent){
    mapEvent.id = mapEventID
    mapEventID++
    mapEvents.push(mapEvent)
}
u = new MapEvent('terrain update')
u.end_update = terrainUpdate
//progress turn for each player
function turn(){
	if(!dayComplete){
		console.log('turn not ready yet');
		return
	}
	dayComplete = false;
	log_message('======= start of turn '+day+' '+hour+' =======');
	//if all players are ready
	//change bg color based on time of day
	switch(hour){
		case 7:
		case 20:
			$('#map').css('background','rgb(0,110,0)');
			break;
		case 6:
		case 21:
			$('#map').css('background','rgb(0,80,0)');
			break;
		case 8:
			$('#map').css('background','rgb(0,128,0)');
			break;
		case 22:
			$('#map').css('background','rgb(0,60,0)');
			break;
	}

	if(customMap)
		customMap.start_update();
    mapEvents.forEach(function(e){
        e.end_update();
    });
    
	//randomize the player list
	players.sort(() => Math.random() - 0.5);

	// players.forEach(chara => chara.plannedAction = "");
	// players.forEach(chara => chara.finishedAction = false);
	//turn start
	for(i=0; i<players.length; i++){
		players[i].turnStart();
	}
	//plan actions
	for(i=0; i<players.length; i++){
		players[i].planAction();
	}
	/*
	if(controlledPlayers.length>0){
		controlledPlayers.sort(() => Math.random() - 0.5);
		for(i=0; i<controlledPlayers.length; i++){
			if(!controlledPlayers[i].autoplay && controlledPlayers[i].health>0)
				await controlledPlayers[i].doAction();
		}
	}
	*/
	log_message("======= performing actions =======");
	//perform actions for each player
	for(i=0; i<players.length; i++){
		if(!players[i].controlled || players[i].autoplay){
			players[i].doAction();
		}
	}

	players.forEach(function(chara,index){
		chara.turnEnd();
	});
	//update alliances
	allianceUpdate();

	//update doodads
	doodadUpdate();

	if(customMap)
		customMap.end_update();
	mapEvents.forEach(function(e){
        e.end_update();
    });
	terrainUpdate();

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
	$('#alive_cnt').text("Alive: " + players.length +"/"+total_players);
	$('#ded_cnt').text("Dead: " + (total_players-players.length)+"/"+total_players);
	//update the info tables
	updateTable();
	log_message('======= end of turn '+day+' '+(hour - 1)+'=======');
	log_message("   ")
	dayComplete = true;
}
var dayComplete = true;

function allianceUpdate(){
	alliances.forEach(function(tA,index){
		tA.update();		//check doodads
	});
}

function doodadUpdate(){
	doodads.forEach(function(tD,index){
		tD.update();		//check doodads
	});
}
function terrainUpdate(){
		//update terrain
	for(let i = 0; i <= mapSize; i=i+25) {
		if(terrain[i]){
			for(let j = 0; j <= mapSize; j=j+25) {
				if(terrain[i][j]){
					terrain[i][j].update();
				}
			}
		}
	}

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

}

//check if a coordinates are in bounds and has safe terrain
function safeTerrainCheck(x,y, dangerlv=0){
	//safe zone check
	if(!safeBoundsCheck(x,y)){
		return false
	}
	//terrain check
	if(getTerrain(x,y).danger>dangerlv){
		return false
	}
	return true
}

//check if coordinates are not in danger zone
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

//check if a coordinates are in map bounds
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

//get random coordinates in the map
function getRandomCoords(check_type='', tries=10){
	let newX = 0;
	let newY = 0;
	checker = inBoundsCheck
	if(check_type=='safe')
		checker = safeBoundsCheck
	if(check_type=='terrain')
		checker = safeTerrainCheck
	//get new cords to move to
	do {
		newX = Math.floor(Math.random()*mapSize);
		newY = Math.floor(Math.random()*mapSize);
		tries--;
	} while(!checker(newX,newY) && tries >0);
	//if safe location can't be found, move to center
	if(tries<=0){
		newX = mapSize/2 + roll_range(-25,25);
		newY = mapSize/2 + roll_range(-25,25);
	}

	//get a target location to move to
	return [newX,newY]
}

//puts terrain above players
function showTerrain(){
	if($('.terrain').css('z-index')!=1){
		$('.terrain').css({'z-index':1})
	}
	else{
		$('.terrain').css({'z-index':20})
	}
}
//puts hides players
function hidePlayers(){
	if($('#players').css('display')!="block"){
		$('#players').css({'display':"block"})
	}
	else{
		$('#players').css({'display':"none"})
	}
}
function pushMessage(chara, msg){
	events.push({"chara": chara, "message":msg, "fight":false});
}

function highlight_clicked(char_id) {
	// log_message("container click")
	//deselect
	if($('#tbl_' + char_id).hasClass('selected')){
		deselect_show_info();
	}
	else if($('#tbl_' + char_id).hasClass('highlight')){
		$('#char_' + char_id).removeClass('highlight')
		$('#tbl_' + char_id).removeClass('highlight')
	}
	else{
		$('#char_' + char_id).addClass('highlight')
		$('#tbl_' + char_id).addClass('highlight')
	}
}
var show_info_id = -1; 		//id of the current player's info shown (-1 for none)
function toggle_show_info(char_id){
	// log_message("img click")
	//no char selected
	if(show_info_id==-1){
		select_show_info(char_id)
	}
	//another character selected
	else if(show_info_id!=char_id){
		// $('#char_' + show_info_id).removeClass('highlight')
		// $('#tbl_' + show_info_id).removeClass('highlight')

		deselect_show_info()
		select_show_info(char_id)
	}
	//deselect current char
	else{
		deselect_show_info();
	}
}
//select char info box
function select_show_info(char_id){
	$('#tbl_' + char_id).removeClass('highlight')
	$('#tbl_' + char_id).addClass('selected')
	$('#char_' + char_id).addClass('highlight')

	show_info_id=char_id;
	playerStatic[show_info_id].show_main_info();

	$('#char_info').css('display','inline-block')
	// $('#table').css('margin-bottom','250px')
}
function deselect_show_info(){
	deselect_extra_info()
	$('#tbl_' + show_info_id).removeClass('selected')
	$('#char_' + show_info_id).removeClass('highlight')
	$('#char_info_container').html('');

	show_info_id=-1;
	$('#char_info').css('display','none')
	// $('#table').css('margin-bottom','50px')
}

var extra_info_obj = ""		//object shown in the extra info screen
//show info for player
function player_extra_info(char_id, info_type, extra_info=0){
	info_obj = info_type
	if(info_type == 'wep')
		info_obj = playerStatic[char_id].weapon
	else if(info_type == 'off')
		info_obj = playerStatic[char_id].offhand
	else if(info_type == 'eff')
		info_obj = playerStatic[char_id].status_effects[extra_info]
	else if(info_type == 'attr')
		info_obj = playerStatic[char_id].attributes[extra_info]
	else if(info_type == 'alliance')
		info_obj = playerStatic[char_id].alliance

	show_info_id = char_id;
	toggle_extra_info(info_obj);
}

function toggle_extra_info(obj){
	if(obj=='')
		return
	//no item selected
	if(extra_info_obj==""){
		select_extra_info(obj)
	}
	//different item selected
	else if(extra_info_obj != obj){
		deselect_extra_info()
		select_extra_info(obj)
	}
	//toggle off
	else{
		deselect_extra_info()
	}
}

function select_extra_info(obj){
	extra_info_obj = obj;
	display_extra_info()
	$('#extra_info').css('display','inline-block')
}
function deselect_extra_info(){
	$('#extra_info').css('display','none')
	$('#extra_info_container').html('');
	if(extra_info_obj instanceof Alliance){
		extra_info_obj.members.forEach(function(member){
			//remove highlight
			$('#char_' + member.id).removeClass('alliance')
			$('#tbl_' + member.id).removeClass('alliance')
		})
	}

	extra_info_obj=""
}
function display_extra_info(){
	if(extra_info_obj=="more info"){
		if(show_info_id!=-1){
			playerStatic[show_info_id].show_more_info()
		}
	}
	else if(extra_info_obj=="opinions"){
		if(show_info_id!=-1){
			playerStatic[show_info_id].show_opinions()
		}
	}
	else{
		extra_info_obj.show_info()
	}
}

selected_alliance_id = -1
function toggle_selected_alliance(alliance_id){
	if(div_clicked==false){
		//no alliance selected
		if(selected_alliance_id==-1){
			select_alliance(alliance_id)
		}
		//different alliance selected
		else if(selected_alliance_id != alliance_id){
			deselect_alliance()
			select_alliance(alliance_id)
		}
		//toggle off
		else{
			deselect_alliance()
		}
	}
	div_clicked=false
}
var div_clicked=false
//player icon clicked on alliance page
function alliance_div_click(alliance_id, char_id){
	if(show_info_id==-1){
		select_show_info(char_id)
		player_extra_info(char_id, 'alliance')
		select_alliance(alliance_id)
	}
	//another character selected
	else if(show_info_id!=char_id){
		deselect_show_info()
		select_show_info(char_id)
		player_extra_info(char_id, 'alliance')
		deselect_alliance()
		select_alliance(alliance_id)
	}
	//deselect current char
	else if(playerStatic[char_id].alliance == allianceStatic[alliance_id]){
		if(show_info_id!=char_id){
			select_alliance(alliance_id)
		}
		else{
			deselect_show_info()
			deselect_alliance();
		}
	}
	else{
		deselect_show_info();
		deselect_alliance();
	}
	div_clicked=true;
}

function select_alliance(alliance_id){
	$('#alliance_' + alliance_id).addClass('alliance_highlight')
	selected_alliance_id = alliance_id;
	allianceStatic[selected_alliance_id].highlight_alliance_members();

	selected_alliance_id = alliance_id;
}
function deselect_alliance(){
	$('#alliance_' + selected_alliance_id).removeClass('alliance_highlight')
	if(selected_alliance_id>=0 && selected_alliance_id<allianceStatic.length)
		allianceStatic[selected_alliance_id].deselect_alliance_members()

	selected_alliance_id = -1;
}

//toggle the info being displayed
function infoDisplay(){
	//switch from status to events
	switch(page_num){
		//switch to events
		case 0:
			$('#table').css('display','none');
			$('#messages').css('display','block');
			$('#alliances').css('display','none');
			page_num = 1
			updateEvents()
			break;
		case 1:
			$('#table').css('display','none');
			$('#messages').css('display','none');
			$('#alliances').css('display','block');
			page_num = 2
			updateAlliances()
			break;
		case 2:
			$('#table').css('display','block');
			$('#messages').css('display','none');
			$('#alliances').css('display','none');
			page_num = 0
			updateStatusTable()
			break;
	}
}


//update the info tables
function updateTable(){
	//list status
	if(show_info_id!=-1){
		playerStatic[show_info_id].show_main_info();
	}
	if(extra_info_obj!=''){
		display_extra_info()
	}

	players.forEach(function(chara,index){
		//prepare player data
		//character icons
		$("#char_" + chara.id + " .healthBar").css("width",(chara.health/chara.maxHealth)*100 + "%");
		$("#char_" + chara.id + " .energyBar").css("width",(chara.energy/chara.maxEnergy)*100 + "%");

		//weapon
		let inv_text=""
		if(chara.weapon){
			inv_text+=chara.weapon.icon;
		}
		if(chara.offhand){
			inv_text+=chara.offhand.icon;
		}
		$("#char_" + chara.id + " .charWeap").html(inv_text);
		//status effect
		let icon_status_text = "";	//char icon
		let icon_count=0;
		chara.status_effects.forEach(function(eff,index){
			if(icon_count<4){
				if(eff.icon){
					icon_status_text=icon_status_text+eff.icon;
					icon_count++;
				}
			}
		});
		$("#char_" + chara.id + " .charEff").html(icon_status_text);

	});

	if(page_num == 0)
		updateStatusTable();
	// if(page_num == 1)
		// updateEvents()
	if(page_num == 2)
		updateAlliances();

	//turn existing messages transparent
	$('#messages td').css('opacity','0.3');
	$('#eventFeed').empty()
	updateEvents();

	doodads.forEach(function(tD,index){
		tD.draw();
	});
}

function updateStatusTable(){
	players.forEach(function(chara,index){
		//prepare player data
		//weapon
		let inv_text=""
		if(chara.weapon){
			inv_text+=chara.weapon.icon;
		}
		if(chara.offhand){
			inv_text+=chara.offhand.icon;
		}
		//status effect
		let status_text=""				//side bar
		chara.status_effects.forEach(function(eff,index){
			status_text+=eff.icon;
		});

		//info bar
		$("#tbl_" + chara.id + " .healthBar").css("width",(chara.health/chara.maxHealth)*100 + "%");
		$("#tbl_" + chara.id + " .energyBar").css("width",(chara.energy/chara.maxEnergy)*100 + "%");
		//action
		$("#tbl_" + chara.id + " .status").html(chara.statusMessage);
		//kills
		$("#tbl_" + chara.id + " .kills").text(chara.kills);
		$("#tbl_" + chara.id + " .weapon").html(inv_text);
		$("#tbl_" + chara.id + " .effects").html(status_text);
		// log_message(chara.name +" status txt " + status_text);
	});

	dedPlayers.forEach(function(chara,index){
		$("#tbl_" + chara.id + " .kills").text(chara.kills);
		let inv_text=""
		if(chara.weapon){
			inv_text+=chara.weapon.icon;
		}
		if(chara.offhand){
			inv_text+=chara.offhand.icon;
		}
		$("#tbl_" + chara.id + " .weapon").html(inv_text);
	});
}
var dayColors = ["#282828","#474747"];
var currentDayColor=0;
function updateEvents(){
	//add new event messages
	let fight_count = 0;	//fight counter
	events.forEach(function(msg,index){
		//bg based on time
		let event_html = "<tr><td style='background-color:"+ dayColors[currentDayColor]+";'>Day " + day + " " + hour + ":00</td>";
		let feed_html = "";
		if(!msg.fight){
			let chara = msg.chara;
			let message = msg.message;
			event_html = event_html + "<td style='background-color:"+ dayColors[currentDayColor]+";'><img src='" + chara.img + "'></img><span>" + message + "</span></td>"
			feed_html = "<span style='color:white'>" + message + "</span><br>";
		}
		else{
			let attacker = msg.attacker;
			let defender = msg.defender;
			event_html = event_html + "<td style='background-color:"+ dayColors[currentDayColor]+";'><div>"+
				"<div style='float:left;max-width:120px;text-align:left;'>\
					<img style='width:90px; height:90px;' src='" + attacker.img + "'></img>"+
					// <span style='display:inline-block'>"+attacker.name+"</span>
				"</div>"+
			// "<span>attacks</span>"+
				"<div style='float:right;max-width:120px;text-align:right;'>\
					<img style='width:90px; height:90px;' style='float:right;' src='" + defender.img + "'></img>"+
					// <span style='display:inline-block'>"+defender.name+"</span>
				"</div>\
			</div>"+
			"<div style='font-size:16px;display:inline-block'>"
			msg.events.forEach(function(event_msg){
				event_html = event_html + "<span style='margin-bottom:5px;display:inline-block;'>"+event_msg+"</span><br>"

			});
			event_html = event_html+"</div></td>";
			// feed_html = "<span style='color:red'>⚔️" + attacker.name + " fights " + defender.name + "</span><br>";
			fight_count++;
		}
		event_html = event_html + "</tr>";
		$('#eventMsg tbody').prepend(event_html);
		$('#eventFeed').prepend(feed_html);
	});
	// if(fight_count>0)
		// $('#eventFeed').prepend("<span style='color:white'>" + fight_count+" fights</span><br>");
	// remove excess messages
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

	//list deaths
	dedPlayers.forEach(function(chara,index){
		if(!chara.diedMessage){
			$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + chara.img + "'></img>" + chara.death + "</td>>");
			chara.diedMessage = "Done";
		}
	});

	events=[];
}

function updateAlliances(){
	alliances.forEach(function(alli,index){
		$("#alliance_" + alli.id + " .unity").html(alli.unity);
		if(alli.attack_target)
			$("#alliance_" + alli.id + " .alliance_target").html(alli.attack_target.name);
		else
			$("#alliance_" + alli.id + " .alliance_target").html("None");
		alli.members.forEach(function(member){
			//remove players not in alliance
			if(alli.members.indexOf(member)<0){
				$("#alliance_"+alli.id+"_char_" + member.id).remove()
				return
			}
			if($("#alliance_"+alli.id+"_char_" + member.id).length){
				//prepare player data
				//weapon
				let inv_text=""
				if(member.weapon){
					inv_text+=member.weapon.icon;
				}
				if(member.offhand){
					inv_text+=member.offhand.icon;
				}
				//status effect
				let status_text=""				//side bar
				member.status_effects.forEach(function(eff,index){
					status_text+=eff.icon;
				});

				//info bar
				$("#alliance_"+alli.id+"_char_" + member.id + " .healthBar").css("width",(member.health/member.maxHealth)*100 + "%");
				$("#alliance_"+alli.id+"_char_" + member.id + " .energyBar").css("width",(member.energy/member.maxEnergy)*100 + "%");
				//action
				$("#alliance_"+alli.id+"_char_" + member.id + " .status").html(member.statusMessage);
				//kills
				$("#alliance_"+alli.id+"_char_" + member.id + " .kills").text(member.kills);
				$("#alliance_"+alli.id+"_char_" + member.id + " .inv").html(inv_text);
				$("#alliance_"+alli.id+"_char_" + member.id + " .effects").html(status_text);
			}
			else{
				let mem_html = alli.create_member_div(member)
				// html+=mem_html
				$("#alliance_" + alli.id+' .alliance_members').append(mem_html)
			}
		});
	});
	disbanded_alliances.forEach(function(alli,index){
	});
}

var playerDistTable = []
function updatePlayerDists(p1){
	playerStatic.forEach(function(p2){
		let dist = 0;
		if(p1!=p2){
			let x1 = p1.x;
			let y1 = p1.y;
			let x2 = p2.x;
			let y2 = p2.y;
			dist = hypD(x2-x1, y2-y1);
		}
		playerDistTable[p1.id][p2.id] = dist;
		playerDistTable[p2.id][p1.id] = dist;
	})
}
//calculate distance between 2 players
function playerDist(p1, p2){
	return playerDistTable[p1.id][p2.id]
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

function loadMap(map_lst, rand_terrain=[["tree",120],["mtn",8],["water",5]]){
	log_message('loading map');
	// for(var i = 0;i<map_lst.length;i++){
		// terrain[i*25] = [];
	// }
	terrain=[]
	for(var i = 0;i<map_lst.length;i++){
		// terrain[i*25] = [];
		for(var j=0; j<map_lst[i].length;j++){
			// if(map_lst[i][j]!='' && map_lst[i][j]!=' '){
				let temp_type = "";
				switch(map_lst[i][j].toLowerCase()){
					case "m":
						temp_type = "mtn";
						break;
					case "t":
						temp_type = "tree";
						break;
					case "w":
						temp_type = "water";
						break;
					case "r":
						temp_type = roll(rand_terrain);
						break;
					case "0":
						temp_type = "rand";
						break;
					default:
						temp_type = "none";
						// temp_type = "water";
						break;
				}
				let tempTerr = create_terrain(temp_type,j*25,i*25); //generate a random terrain
				setTerrain(tempTerr, false);
			// }
		}
	}
	log_message('map loaded');
	generated = true;
}

//clears all terrain
function clearTerrain(){
	terrain.forEach(function(terrRow,i){
		terrRow.forEach(function(terr,j){
			terr.destroy();
		});
	});
}

//generates terrain
function generateTerrain(){
	//clear terrain
	clearTerrain();
	dangerSize=0;
	generated=false;	
	customMap = '';
	log_message('terrain generation start')
	//get the spread terrain value
	if(isNaN($('#txt_spreadTerrain').val())){
		getCustomGenerator($('#txt_spreadTerrain').val())
	}
	else{
		regular_generation();
	}
	log_message('terrain generation end')
	if(customMap)
		log_message('generated ' + customMap.name);
}

var riverSpawns = [];
function regular_generation(){
	for(var i = 0;i<=mapSize;i+=25){
		terrain[i] = [];
		//generate reandom terrain pieces
		for(var j =0;j<=mapSize;j+=25){
			//timerClick("terrain bound check row " + i + " col " + j);
			//check the current coords are in bounds
			if(inBoundsCheck(i,j)){
				//timerClick("terrain row " + i + " col " + j);
				let tempTerr = create_terrain("rand",i,j); //generate a random terrain
				setTerrain(tempTerr, false);
			}
		}
		log_message('finished '+i);
	}
	
	generated=true;	
	log_message('terrain spread start')
	if(Math.floor($('#txt_spreadTerrain').val()) > 0){
		//spread the terrain for that amount
		for(var i = 0;i<$('#txt_spreadTerrain').val();i++){
			spreadTerrain();
		}
	}	
	log_message('terrain spread end')
	log_message('river spread start')
	log_message(riverSpawns.length + ' rivers')	
	
	riverSpawns = [];
	//generate river
	riverSpawns.forEach(function(river,index){
		//pass in the starting point for the river
		generateRiver(river,true);
	});
	// timerClick("terrain spread");
	log_message('river spread end')
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
// var riverSpawns = [];		//rivers?
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
	//decide when to split the river
	if(Math.random() > 0.75 && recursive){
		split = Math.floor(Math.random() * (length - 5) + 10);
	}
	//generate rivers in a line
	for(var i = 0;i<length;i++){
		//console.log(currX + " " + currY)
		if(terrain[currX]){
			if(terrain[currX][currY]){
				let newTerrain =  new WaterTerrain(currX, currY, false);
				newTerrain.spreadOnce = true;
				newTerrain.river = true;
				setTerrain(newTerrain);

				//generate forks
				if(i == split && recursive){
					generateRiver(terrain[currX][currY],false);
					//console.log("river split");
					//console.log(terrain[currX][currY]);
				}
			}
		}
		//randomly change direction
		let changeDir = Math.floor(Math.random() * 3) - 1;
		dir += changeDir;
		if(dir < 0)
			dir = 0;
		if(dir > 7)
			dir = 7;
		//console.log(dir);
		currX += dirArr[dir][0]*25;
		currY += dirArr[dir][1]*25;
	}
}

function generateFull(){
	for(var i = 0;i<=mapSize;i+=25){
		terrain[i] = [];
		//generate reandom terrain pieces
		for(var j =0;j<=mapSize;j+=25){
			//timerClick("terrain bound check row " + i + " col " + j);
			//check the current coords are in bounds
			if(inBoundsCheck(i,j)){
				//timerClick("terrain row " + i + " col " + j);
				let temp_type = roll([["tree",120],["mtn",8],["water",5]]);
				let tempTerr = create_terrain(temp_type,i,j); //generate a random terrain
				setTerrain(tempTerr);
			}
		}
		log_message('finished '+i);
		generated = true;
	}
}

function getCustomGenerator(generator){
	generator = generator.replace(' ','');
	generator = generator.toLowerCase();
	log_message(generator)
	if(generator.startsWith('jibunwo')){
		generateJibunWo();
	}
	else if(generator=='full'){
		generateFull();
	}
}













