class Char {
	constructor(name,img,x,y, moral, personal){
		//_______________general data_______________
		this.name = name;
		this.img = img;
		//player location
		this.x = x;
		this.y = y;
		//id used for display
		this.id = players.length;
		
		//_______________attributes_______________
		//types of the character
		this.attributes=[];
		//Modifiers
		this.moral = moral
		this.personality = personal;
		moralNum[this.moral]++;
		personalityNum[this.personality]++;
		
		//_______________character condition_______________
		//health
		this.maxHealth = rollSpecialH(this.personality);
		this.health = this.maxHealth;
		//energy
		this.maxEnergy = 100;
		this.energy = this.maxEnergy;
		//stamina
		this.stamina = 100;	
		
		this.status_effects = []

		//_______________stats_______________
		//combat stats. B stands for bonus
		//how far they can see
		this.sightRange = 200;
		this.sightRangeB = 0;
		//how far they can attack
		this.fightRange = 24;
		this.fightRangeB = 0;
		//damage dealt
		this.fightDmg = 25;
		//damage multiplier
		this.fightDmgB = 1.00;
		//damage reduction
		this.dmgReductionB = 1.00;		
		//peacefulness
		this.aggroB = 0;
		this.peaceB = 0;
		this.intimidation = 0;

		//how visible they are
		this.visibility = 100;
		this.visibilityB = 0;
		//movement
		this.moveSpeed = mapSize / 40;		
		this.moveSpeedB = 1
		
		//_______________kills_______________
		//number of kills
		this.kills = 0;
		//experience
		this.killExp = 1.1;
		this.exp = 0;
		
		//_______________actions_______________
		//the current actions
		this.currentAction = {};
		//the action performed in the previous turn
		//used to plan current action
		this.lastAction="";
		this.plannedAction="";

		//the priority of current action
		//0   : no action
		//1-5 : regular actions
		//6-10 : self serving actions
		//11-19 : mind controlling actions
		//20+ : physically disabling actions
		this.actionPriority = 0;
		this.lastSlept=0;
		this.lastFight=0;
		this.oobTurns=0;
		
		//_______________text_______________
		//action message to be displayed
		this.statusMessage = "";
		//if their current action is complete
		this.finishedAction = true;
		this.interrupted = false;

		//_______________surrounding players_______________
		//players they are aware of
		this.awareOf = [];
		//players within attack range
		this.inRangeOf = [];
		//players that can be attacked
		this.attackable = [];
		
		this.attackers = [];
		this.followers = [];
		
		//_______________inventory_______________
		this.weapon = "";
		this.offhand = "";

		//unused
		this.alliance = {};
		this.opinions = [];
		this.recentlySeen = [];
		this.goal = "";

		this.unaware = false;
		this.incapacitated = false;		
		this.dead = false;
	}
	draw() {
		let charDiv = $('#char_' + this.id);
		if(!charDiv.length){
			//map icon 
			$('#players').append(
			"<div id='char_" + this.id + "' class='char'><div class='charName'>"+
				"<span class='charText'>" + this.name + "</span><span class='charWeap'></span></div>"+
			"<div class='charEff'	style='font-size:10px;'></div>"+
			"<div class='healthBar' style='margin-bottom:-10px'></div>"+
			"<div class='energyBar' style='margin-bottom:-10px'></div></div>");		
			charDiv = $('#char_' + this.id);
			charDiv.css('background-image',"url(" + this.img + ")");
			this.div = charDiv;
			
			//side bar
			$('#table').append(
			"<div class='container alive' id='tbl_" + this.id + "'>"+
				"<img src='" + this.img + "' onclick='highlight_clicked("+this.id+")'>"+ //img 
				"<div style='position:absolute;width:50px;height:60px;z-index:2;top:0;left:0;pointer-events: none;'>"+ 
					"<div class='healthBar'></div><div class='energyBar'></div>"+ //hp+ep bar
					"<div class='kills'></div>"+		//kill counter
				"</div>"+
			
				//info section
				"<div class='info'>"+
					"<div>" + 
						this.moral.substring(0,1) + this.personality.substring(0,1) + " <b>" + this.name +"</b>"+ //name
						"<span class='weapon'></span>"+
					"</div>"+
					"<div class='status'></div>"+		//status message
					"<div class='effects'></div>"+		//effects message
				"</div>"+
				"<div style='position:absolute; width:185px; height:100%; top:0; left:0; margin-left:50px;' onclick='show_info("+this.id+")'></div>"+	//clickable div
			"</div>");
			let tblDiv = $('#tbl_' + this.id);
			this.tblDiv = tblDiv;
		} 
		//charDiv.css('left',this.x / 1000 * .95 * $('#map').width() - iconSize/2);
		//charDiv.css('top',this.y / 1000 * .95 * $('#map').height() - iconSize/2);
		charDiv.css({transform:"translate(" + (this.x / mapSize * $('#map').width() - iconSize/2) + "px," + (this.y / mapSize *  $('#map').height() - iconSize/2) + "px)"},function(){
		});
	}
	
	show_main_info(){
		//prepare clickable icons
		let terrain_icon = ""
		if(getTerrain(this.x, this.y)){
			terrain_icon = getTerrain(this.x, this.y).icon
		}
		
		let weaponHtml="<span'>Weapon:None</span>";
		if(this.weapon){
			weaponHtml = "<span onClick='show_item_info("+this.id+",\"wep\")'><u>Weapon</u>:"+this.weapon.icon+"</span>"
		}
		let offhandHtml="<span>Offhand:None</span>";
		if(this.offhand){
			offhandHtml = "<span onClick='show_item_info("+this.id+",\"off\")'><u>Offhand</u>:"+this.offhand.icon+"</span>"
		}
		let statusHtml="None";
		let tP=this
		if(this.status_effects.length>0){
			statusHtml="";
			this.status_effects.forEach(function(eff, eff_id){
				statusHtml=statusHtml+"<span onClick='show_status_info("+tP.id+","+eff_id+")'>"+eff.icon+"</span>"
			});
		}
		let attrHtml="";
		if(this.attributes.length>0){
			this.attributes.forEach(function(attr,attr_id){
				if(attr.display){
					// attrHtml=attrHtml+attr.name+",";
					if(attr.has_info){
						attrHtml=attrHtml+"<span onClick='show_attr_info("+tP.id+","+attr_id+")'><u>"+attr.name+"</u>,</span>"
					}
					else{
						attrHtml=attrHtml+"<span>"+attr.name+",</span>"
					}
				}
			});
		}
		if(attrHtml=="")
			attrHtml="None"
		if(attrHtml[attrHtml.length-8]==',')
			attrHtml = attrHtml.substring(0, attrHtml.length-8)+"</span>"
		//if dead
		let statusMsgHTML = this.statusMessage;
		if(this.health<=0){
			statusMsgHTML = this.death;
		}		
		let fightChance = baseFightChance;
		let peaceChance = basePeaceChance;
		fightChance=fightChance+this.aggroB;
		peaceChance=peaceChance+this.peaceB;
		if(fightChance<1)
			fightChance=1;
		if(peaceChance<1)
			peaceChance=1;
		let char_info=
		"<img id='char_info_img' src='"+ this.img+"'>"+
		"<div class='info'>"+
			"<b style='font-size:24px'>"+this.name+"</b><br>"+
			"<span style='font-size:14px'>" + this.moral + " " + this.personality+"</span><br>"+
			"<span style='font-size:10px;'>ID: "+this.id+"</span><br>"+
			"<span style='font-size:10px;'>Location: ("+ Math.round(this.x) + " , "+Math.round(this.y)+")"+terrain_icon+"</span><br><br>"+
			"<span style='width:150px; display:block;'>"+statusMsgHTML+"</span>"+
			"<div style='width: 170px; height: 25px; bottom:15px; position:absolute;'>"+	//health and energy div
				"<span style='color:red; float: left;'>"+
					"<b>Health:</b><br>"+roundDec(this.health)+"/"+this.maxHealth+
				"</span>"+
				"<span style='color:green; float: right;'>"+
					"<b>Energy:</b><br>"+roundDec(this.energy)+"/"+this.maxEnergy+
				"</span>"+
			"</div>"+
			//stats panel on the right
			"<div id='char_stats'>"+
				"<span>Attr:"+attrHtml+"</span><br>"+
				"<span>Effects:"+statusHtml+"</span><br>"+
				"<div>"+
					"<div style='float: left;'>"+
						weaponHtml+"<br>"+
						"<span>Max Dmg:"+ roundDec(this.fightDmg*this.fightDmgB) +"</span><br>"+
						"<span>Dmg Bonus: x"+ roundDec(this.fightDmgB) +"</span><br>"+
						"<span>Dmg Taken: x"+roundDec(this.dmgReductionB)+"</span><br>"+
						"<span>Peace/Aggro: "+Math.round(this.peaceB)+"/"+Math.round(this.aggroB)+"</span><br>"+
						"<span>Fight Chance: "+roundDec(fightChance/(peaceChance+fightChance)*100)+"%</span><br>"+
						"<span>Intimidation: "+(this.intimidation)+"</span><br>"+
					"</div>"+
					"<div style='float:right;  width: 115px; position:absolute; right:0px;'>"+
						offhandHtml+"<br>"+
						"<span>Speed: "+roundDec(this.moveSpeed* this.moveSpeedB)+"</span><br>"+
						"<span>Move Bonus: x"+roundDec(this.moveSpeedB)+"</span><br>"+
						"<span>Fight Range: "+(this.fightRange+this.fightRangeB)+"</span><br>"+
						"<span>Vision: "+(this.sightRange+this.sightRangeB)+"</span><br>"+
						"<span>Visibility: "+(this.visibility+this.visibilityB)+"</span><br>"+
						"<span onclick='show_player_info("+this.id+")'><u>More Info</u></span><br>"+
				"</div>"+
			"</div>"+
		"</div>"
		$('#char_info_container').html(char_info);
	}
	
	show_info(){
		let extra_info = 
		"<div class='info' style='font-size:12px'>"+
			"<b style='font-size:18px'>"+this.name+"</b><br>"+
			"<span>Kills: "+this.kills+"</span><br>"+
			"<span>Exp: "+roundDec(this.exp)+"</span><br>"+
			"<span>Exp Dmg: x"+roundDec(Math.pow(this.killExp,this.exp/100))+"</span><br>"+
			"<span>Last Action: "+this.lastAction+"</span><br>"+
			"<span>Last Fight: "+this.lastFight+"</span><br>"+
			"<span>Last Slept: "+this.lastSlept+"</span><br>"+
			"<span>Aware Of: "+this.awareOf.length+"</span><br>"+
			"<span>Followers: "+this.followers.length+"</span><br>"+
			"<span>Attackers: "+this.attackers.length+"</span><br>"+
			"<span>In Range: "+this.inRangeOf.length+"</span><br>"+	
			"<span>Attackable: "+this.attackable.length+"</span><br>"

		if(this.oobTurns>0)
			extra_info = extra_info +"<span>Out of Bounds: "+this.oobTurns+"</span><br>"
		
		if(this.unaware){
			extra_info= extra_info + "<span>Unaware</span><br>"
		}
		else if(this.incapacitated){
			extra_info= extra_info + "<span>Incapacitated</span><br>"
		}
		
		extra_info = extra_info + "</div>"
		$('#extra_info_container').html(extra_info);
	}
	
	//calculate bonuses for combat
	calc_bonuses(){
		this.sightRangeB = 0;
		this.visibilityB = 0;

		this.fightRangeB = 0;
		this.fightDmgB = 1;
		this.dmgReductionB = 1;

		this.moveSpeedB = 1
		
		this.aggroB=0
		this.peaceB=0
		this.intimidation = 0;
		
		// good = less damage dealt and taken
		// evil = more damage dealt and taken
		if(this.personality == 'Good'){
			// this.fightDmgB = 0.8;
			// this.dmgReductionB = 0.8;
			this.intimidation -= 20;
		}
		if(this.personality == 'Evil'){
			// this.fightDmgB = 1.25;
			// this.dmgReductionB = 1.25;
			this.intimidation += 10;
		}
		this.intimidation += this.kills * 5

		//chaotic = more likely to be aggro
		//lawful = more likely to be peaceful
		if(this.moral == 'Lawful')
			this.peaceB = 75;
		if(this.moral == 'Chaotic'){
			this.aggroB = 100;
		}
		
		this.attributes.forEach(function(attr){
			attr.calc_bonuses();
		});
	
		//apply bonuses from statuses
		this.status_effects.forEach(function(eff){
			eff.calc_bonuses();
		});
		
		//apply weapon bonuses
		if(this.offhand){
			this.offhand.calc_bonuses();
		}
		if(this.weapon){
			this.weapon.calc_bonuses();
		}
		
		//apply global aggro
		this.aggroB += globalAggro;
		
		//apply experience bonuses
		this.fightDmgB *= Math.pow(this.killExp,this.exp/100);
		//apply terrain bonuses
		if(getTerrain(this.x,this.y)){
			getTerrain(this.x,this.y).calc_bonuses(this)
		}

		if(this.fightDmgB <0){
			this.fightDmgB = 0;
		}
		if(this.dmgReductionB <0){
			this.dmgReductionB = 0;
		}
		
	}
	awareOfPlayer(oP){
		if(this.awareOf.indexOf(oP)>=0)
			return true;
		return false;
	}
	inRangeOfPlayer(oP){
		if(this.inRangeOf.indexOf(oP)>=0)
			return true;
		return false;
	}
	canAttackPlayer(oP){
		if(this.attackable.indexOf(oP)>=0)
			return true;
		return false;
	}
	
	//get all the players within a certain distance
	nearbyPlayers(dist){
		let temp_list = []
		let tP = this
		players.forEach(function(oP){
			if(oP!=tP && playerDistTable[tP.id][oP.id]<=dist)
				temp_list.push(oP);
		});
		return temp_list
	}
	//apply effects to self
	apply_inv_effects(state, wep_data={}, offhand_data={}){
		if(this.weapon)
			this.weapon.effect(state, wep_data)
		if(this.offhand){
			if(this.offhand_data)
				this.offhand.effect(state, offhand_data)
			else
				this.offhand.effect(state, wep_data)
		}
	}
	//apply status effects to self
	apply_status_effects(state, data={}){
		this.status_effects.forEach(function(eff,index){
			eff.effect(state, data);
		});		
	}	
	
	//apply attribute effects to self
	apply_attr_effects(state, data={}){
		this.attributes.forEach(function(attr,index){
			attr.effect(state, data);
		});		
	}	

	apply_all_effects(state, data={}){
		this.apply_inv_effects(state, data);
		this.apply_status_effects(state, data);
		this.apply_attr_effects(state,data);
		// this.apply_terrain_effects(state, data);
	}
		
	//equipping an item
	equip_item(item){
		if(item instanceof Weapon){
			if(this.weapon){
				return this.weapon.replace_wep(item);
			}
			else{
				this.weapon=item;
				item.equip(this);
				return true;
			}
		}
		if(item instanceof Offhand){
			if(this.offhand){
				return this.offhand.replace_offhand(item);
			}
			else{
				this.offhand=item;
				item.equip(this);
				return true;
			}
		}
	}	
	
	//unequipping an item
	unequip_item(slot){
		if(slot=="wep"){
			if(this.weapon){
				if(this.weapon.unequip()){
					this.weapon=""
					return true;
				}
				else{return false;}
			}
		}
		if(slot=="off"){
			if(this.offhand){
				if(this.offhand.unequip()){
					this.offhand=""
					return true;
				}
				else{return false;}
			}
		}
	}
	
	take_damage(dmg, source, dmg_type, fightMsg={}){
		this.apply_all_effects("takeDmg", {"source":source, "damage":dmg, "dmg_type":dmg_type, "fightMsg":fightMsg});
		this.health -= dmg;
	}
	
	heal_damage(dmg, source, dmg_type, fightMsg={}){
		this.apply_all_effects("healDmg", {"source":source, "damage":dmg, "dmg_type":dmg_type, "fightMsg":fightMsg});
		this.health += dmg;
	}	
	
	//adding status effect
	inflict_status_effect(status_eff){
		if(this.get_status_effect(status_eff.name)){
			//if player already has the effect
			this.get_status_effect(status_eff.name).stack_effect(status_eff);
			log_message(this.name +"'s " + status_eff.name+ " stacked", 1);
		}
		else{
			//add new effect into list
			this.status_effects.push(status_eff);
			status_eff.afflict(this);
			this.apply_all_effects("newStatus", {"eff": status_eff});
			log_message(this.name +" is afflicted with " + status_eff.name, 1);
		}
	}
	//checking if the player has a status effect by name
	get_status_effect(status_name){
		let temp_eff=""
		this.status_effects.forEach(function(eff,index){
			if(eff.name == status_name){
				temp_eff = eff;
			}
		});	
		return temp_eff;
	}
	//removing status effect
	remove_status_effect(status_eff){
		this.status_effects = arrayRemove(this.status_effects, status_eff);
	}
	
	//gets attribute from player 
	get_attr(attr_name){
		let temp_attr=""
		this.attributes.forEach(function(attr){
			if(attr.name == attr_name){
				temp_attr = attr;
			}
		});	
		return temp_attr;
	}
	//checking if the player has an attribute by name
	has_attr(attr_name){
		for(let i=0; i<this.attributes.length; i++){
			if(this.attributes[i].name==attr_name){
				return true;
			}
		}
		return false;
	}
	
	//action planning
	setPlannedAction(action, actionPriority){
		let replace=false;
		//chance to replace if prority is same
		if(actionPriority==this.actionPriority){
			if(Math.random()<0.05){
				replace=true;
			}
		}
		if(actionPriority>this.actionPriority){
			replace=true;
		}
		if(replace){
			log_message(this.name +"'s "+ this.plannedAction +" replaced with " +action+ " " +actionPriority, 0);
			this.actionPriority = actionPriority;
			this.plannedAction = action;
			this.currentAction = {};
			return replace;
		}
		log_message(this.name +"'s "+ this.plannedAction +" cannot be replaced with " +action, 0);
		return replace;
	}
	//reset planned action
	resetPlannedAction(){
		this.actionPriority=0;
		this.plannedAction="";
		this.currentAction = {};
		this.prevTarget = this.plannedTarget;
		this.plannedTarget = "";
	}
	
	//check for aware and in range players
	checkSurroundingPlayers(){
		if(this.lastAction == 'sleeping'){this.unaware = true;}
		if(!this.unaware){
			//get opponents that are in sight 
			this.awareOf = awareOfCheck(this);		
		}
		else{
			this.awareOf = [];
		}
		
		//apply effects from those in sight
		let tP=this;
		this.awareOf.forEach(function(oP,index){
			oP.apply_all_effects("opAware", {"opponent":tP});
		});

		if(this.lastAction == 'sleeping'){this.incapacitated = true;}
		if(!this.incapacitated){
			//get opponents that are in sight 
			this.inRangeOf = inRangeOfCheck(this);
		}
		else{
			this.inRangeOf = [];
		}
		// log_message(this.name + " in range "+this.inRangeOf.length, "surrounding", 0)
		
		this.attackable = [];
		tP=this;
		this.inRangeOf.forEach(function(oP){
			let rollResult = aggroCheck(tP,oP);
			// log_message(rollResult+" with " + oP.name, "surrounding", 0)
			if(rollResult == 'fight')
				tP.attackable.push(oP);
		});
		
		//apply effects from those in sight
		tP=this;
		this.inRangeOf.forEach(function(oP,index){
			oP.apply_all_effects("opInRange", {"opponent":tP});
		});
		this.apply_all_effects("surroundingCheck");
	}
	
	//plan the next action
	/*
	calculate bonuses
	apply inventory effects
	choose an action
	*/
	//decide what action to take for the next turn
	planAction(){
		//calculate bonuses
		this.calc_bonuses();
		//reset variables
		this.current_turn_fights = 0
		this.unaware = false;
		this.incapacitated = false;
		this.statusMessage = "";
		this.interrupted = false;
		
	 	//apply turn start effects
		this.apply_all_effects("turnStart");
		
		//update some counters
		if(this.lastAction!="sleeping")
			this.lastSlept++;
		else
			this.lastSlept=0;
		
		if(this.lastAction!="fighting")
			this.lastFight++;
		else
			this.lastFight=0;
				
		this.checkSurroundingPlayers();
		
		//plan next action
		/*
			out of bounds: move to center
			low health/energy: forage
			another action planned: continue action
			in danger: escape
			choose options:
				move, fight, sleep
			if extremely aggressive, chance to replace chosen action with attack
		*/		
		//force rest if no energy
				
		if(this.energy<=0){
			this.setPlannedAction("rest", 20);
			log_message('rest')
		}
		//force movement to center
		if(!safeBoundsCheck(this.x, this.y)){
			this.oobTurns = this.oobTurns+1;
			this.setPlannedAction("move", 9);
			this.currentAction.targetX=mapSize/2;
			this.currentAction.targetY=mapSize/2;
			log_message(this.name +" moving to center", 1)
		}
		else{
			this.oobTurns=0;
		}

		//forage if energy is low
		if((this.energy/this.maxEnergy) *100 < roll_range(25,50) && getTerrain(this.x,this.y).danger==0 && this.lastAction != "foraging" && this.lastAction != "sleeping"){
			//set priority for foraging depending on energy
			let forageLv=2;
			let energy_percent = (this.energy/this.maxEnergy) *100;
			if(energy_percent<20){forageLv = 7;}
			if(energy_percent < 10){forageLv = 14;}
			if(energy_percent < 5){forageLv = 19;}
			this.setPlannedAction("forage", forageLv);
		}
		//forage if health is low and alone
		else if((Math.pow(this.maxHealth - this.health,2) > Math.random() * 2500+ 2500  && this.awareOf.length==0)&& getTerrain(this.x,this.y).danger==0){
			this.setPlannedAction("forage", 2);
		}
		
		//move away from danger
		if(getTerrain(this.x,this.y).danger>1){
			this.setPlannedAction("terrainEscape", 7)
			log_message('terrain escape')
		}
		if(this.inRangeOf.length>0 && (1-(this.health/this.maxHealth))*100+(this.peaceB - this.aggroB )>roll_range(0, 250)){
		// if(this.inRangeOf.length>0 && (1-(this.health/this.maxHealth))*100+(this.peaceB - this.aggroB )>roll_range(0, 1)){
			this.setPlannedAction("playerEscape", 6)
			log_message('player escape')
		}
		
		//continue with current action if there is one
		if(this.currentAction.name){
			log_message(this.name + " continues with " + this.currentAction.name+" "+this.actionPriority, 0);
			this.plannedAction = this.currentAction.name;
		}
		else{
			let options = [];
			//move 
			options.push(["move",100]);
			//fight if players in range
			if(this.attackable.length > 0)
				options.push(["fight",80 + (this.aggroB - this.peaceB)]);
			//follow
			if(this.awareOf.length > 0){
				let follow_chance = Math.floor((total_players - players.length)/total_players *80) + 20
				options.push(["follow", follow_chance]);
			}
			//if it is night add sleep as an option
			if((hour >= 22 || hour < 5) && this.lastAction != "awaken" && this.lastSlept>=12 && getTerrain(this.x,this.y).danger==0)
				options.push(["sleep",10+5*this.lastSlept]);
			
			//choose new action
			let action_option = roll(options);
			if(action_option == "fight"){
				//set target to the first player in range
				if(this.setPlannedAction("fight",6)){
					this.plannedTarget = this.attackable[0];	   
				}
			}
			else if(action_option == "follow"){
				if(this.setPlannedAction("follow",1)){
					this.plannedTarget = this.awareOf[0];
				}
			}
			else if(action_option == "sleep"){
				let sleepLv= 3;
				if(this.lastSlept>24){
					sleepLv= 8;
				}
				if(this.lastSlept >= 72 || this.energy/this.maxEnergy < 0.05){
					sleepLv = 15
				}
				if(this.lastSlept >= 96){
					sleepLv = 21
				}
				this.setPlannedAction(action_option, sleepLv)
			}
			else{
				this.setPlannedAction(action_option, 1)
			}
		}
		/*
		//if high aggro have a chance to fight
		if(this.attackable.length >0 && (this.aggroB - this.peaceB)>roll_range(75, 375)){
			//set target to the first player in range
			log_message(this.name + " fight replacement")
			if(this.setPlannedAction("fight",6)){
				this.plannedTarget = this.inRangeOf[0];
				log_message(this.name + " targets attack "+this.plannedTarget.name)				
			}
		}
		*/
		//apply effects
		this.apply_all_effects("planAction");
				
		log_message(this.name+" plans to "+ this.plannedAction, "planning", 5)
	}
	
	//perform action
	//called by action in main
	doAction(){
		this.attackers = [];
		this.followers = [];
		this.lastAction = "";
		//perform planned action
		if(this.health > 0 && !this.finishedAction){
			this.apply_all_effects("doAction");
		}
		if(this.health > 0 && !this.finishedAction){
			//console.log(this.name + " " + this.plannedAction);
			//removing red fighting border
			this.div.removeClass("fighting");
			this.tblDiv.removeClass("fighting");
			this.tblDiv.removeClass("forage");
			switch(this.plannedAction){
				case "rest":
					this.action_rest();
					break;
				case "forage":
					this.action_forage();
					break;
				case "follow":
					this.action_follow();
					break;
				case "move":
					this.action_move();
					break;				
				case "terrainEscape":
					this.action_terrain_escape();
					break;				
				case "playerEscape":
					this.action_player_escape();
					break;
				case "fight":
					this.action_fight();
					break;
				case "sleep":
					this.action_sleep();
					break;
				default:
					this.apply_all_effects(this.plannedAction);
					break;
			}
		}

		//toggle class for the last action
		if(this.lastAction == 'sleeping'){
			this.div.find('.charText').addClass('sleep');
			this.tblDiv.addClass('sleep');
		} else {
			this.div.find('.charText').removeClass('sleep');
			this.tblDiv.removeClass('sleep');
		}
		if(this.statusMessage==""){
			this.statusMessage = "does nothing"
		}
		//action completed
		this.finishedAction = true;
		
		
		if(getTerrain(this.x,this.y)){
			getTerrain(this.x,this.y).turn_end_effects(this)
		}

		this.apply_all_effects("turnEnd");
	}
	
	action_rest(){
		this.energy += 40;
		this.health += 5;
		this.lastAction = "rest";
		this.statusMessage = "rests";
		this.resetPlannedAction();
	}

	//action functions
	//fight
	action_fight(){
		//add red fighting border
		//this.div.addClass("fighting");
		//fight planned target
		
		if(!this.plannedTarget){
			this.lastAction = "fighting fail";
			this.statusMessage = "fights their inner mind goblin";
			this.resetPlannedAction();
			return;
		}
		//if target is already dead
		if(this.plannedTarget.health<=0){
			this.statusMessage = "attacks the corpse of " + this.plannedTarget.name;
			this.resetPlannedAction();
			return;
		}
			
		//make sure target is still in range
		let dist = playerDist(this, this.plannedTarget);
		if(this.fightRange + this.fightRangeB < dist){
			this.lastAction = "fighting fail";
			this.statusMessage = "tries to fight "+ this.plannedTarget.name +" but they escape"
			this.resetPlannedAction();
			return;
		}
				
		//calculate damage for both fighters
		this.plannedTarget.attackers.push(this);
		fight_target(this,this.plannedTarget);
		this.lastAction = "fighting";
		this.energy -= 20;
		/*
		if(this.energy < 0){
			this.death = "exhausted to death from fighting";
			this.die();
		}*/
		//clear target and actions
		this.plannedTarget = "";
		this.resetPlannedAction();
	}
	
	//forage
	action_forage(){
		//if foraging just started, set current action to foraging and set turns
		if(this.currentAction.name != "forage"){
			log_message(this.name + " starts foraging", "foraging", 0);
			this.currentAction = {};
			this.currentAction.name = "forage";
			this.currentAction.turnsLeft = 2;
		}
		//lose energy and stamina
		this.currentAction.turnsLeft--;
		this.energy -= 5;
		this.stamina -= 2.5;
		this.lastAction = "foraging";
		this.statusMessage = "foraging";
		//once foraging is done
		//foraging loot
		if(this.currentAction.turnsLeft == 0){
			switch(roll([["success",900],["fail",100],["poisoned",1]])){
				//if foraging is successful
				case "success":
					this.statusMessage = "forage success";
					this.lastAction = "forage success";
					//randomly find a weapon
					let type_prob = [];
					if(!this.weapon)
						type_prob.push(["wep", wep_prob])
					if(!this.offhand)
						type_prob.push(["off", off_prob])
					let loot_type=roll(type_prob);
					//roll weapon
					if(loot_type=="wep"){
						let weaponOdds = get_weapon_odds(this);
						let w = roll(weaponOdds)
						log_message(this.name +" found "+ w, 1);
						let temp_wep = create_weapon(w); 
						//add weapon to equipped
						if(temp_wep){
							this.equip_item(temp_wep, "wep");
							this.lastAction = "forage weapon";
							this.tblDiv.addClass("forage");
						}
					}			
					else if(loot_type=="off"){
						let offhandOdds = get_offhand_odds(this);
						let off = roll(offhandOdds)
						log_message(this.name +" found "+ off, 1);
						let temp_off = create_offhand(off); 
						//add weapon to equipped
						if(temp_off){
							this.equip_item(temp_off, "off");
							this.lastAction = "forage offhand";
							this.tblDiv.addClass("forage");
						}
					}
					//restore health and energy
					this.energy += roll_range(30,60)
					this.health += roll_range(5,10);
					
					break;
				//failed forage
				case "fail":
					this.lastAction = "forage fail";
					this.statusMessage = "forage fail";
					break;
				//rip
				case "poisoned":
					this.health = 0;
					this.lastAction = "forage death";
					// this.death = "death from poisoned berries";
					this.death = "poisoned by a poisy (poisonous flower)";
					break;
			}
			this.apply_all_effects("forage");
			//clear current action
			this.resetPlannedAction();
		}
	}
	
	//follow
	//will only follow for current turn
	action_follow(){
		let newX = 0;
		let newY = 0;
		newX = this.plannedTarget.x;
		newY = this.plannedTarget.y;
		this.lastAction = "following";
		this.statusMessage = "following " + this.plannedTarget.name;
		this.plannedTarget.followers.push(this);
		
		this.currentAction.name = "";
		this.currentAction.targetX = newX;
		this.currentAction.targetY = newY;
		
		// this.plannedTarget.apply_all_effects("followTarget", {"opponent":this});
		this.apply_all_effects("follow", {"opponent":this.plannedTarget});
		
		this.moveToTarget();
		log_message(this.name +" following "+this.plannedTarget.name,0);
		log_message(this.plannedTarget.name +" at ("+this.plannedTarget.x+","+this.plannedTarget.y+")", 1);
		this.resetPlannedAction();
	}
	//todo
	action_terrain_escape(){
		this.action_move()
		this.statusMessage = "looks for safer ground";
		this.apply_all_effects("terrainEscape");
		this.resetPlannedAction()
	}
	//todo
	action_player_escape(){
		this.action_move()
		this.statusMessage = "tries to run away";
		this.apply_all_effects("playerEscape");
		this.resetPlannedAction()
	}
	//move
	//will keep moving to that spot in the next turns
	action_move(){
		this.lastAction = "moving";
		this.statusMessage = "on the move";
		//get a coordinate to move to if not currently moving
		if(this.currentAction.name != "move"){
			//clear current actions
			//this.resetPlannedAction();
			let newX = 0;
			let newY = 0;
			//get new cords to move to
			let tries = 0;
			do {
				newX = Math.floor(Math.random()*mapSize);
				newY = Math.floor(Math.random()*mapSize);
				tries++;
			} while(!safeTerrainCheck(newX,newY) && tries < 10);
			//if safe location can't be found, move to center
			if(tries>=10){
				log_message(this.name + " cant find safe location", 0);
				newX = mapSize/2
				newY = mapSize/2
			}
			this.currentAction.name = "move";
			
			//get a target location to move to
			this.currentAction.targetX = newX;
			this.currentAction.targetY = newY;
			// log_message(this.name +" plans to move to "+ newX +" " +newY);
		}
		this.moveToTarget();
		this.apply_all_effects("move");
		//if arrived on target location
		if(this.currentAction.targetX == this.x && this.currentAction.targetY == this.y){
			this.resetPlannedAction();
			// log_message(this.name + " movement finished");
		}
		else{
			//randomly stop movement
			if(safeTerrainCheck(this.x, this.y) && Math.random()<0.05){
				this.resetPlannedAction()
				// log_message(this.name + " movement finished early");
			}
			else{
				// log_message(this.name + " movement not finished");
			}
		}
	}

	//move towards target through regular means
	moveToTarget(){
		//Calculating distance from target
		let distX = this.currentAction.targetX - this.x;
		let distY = this.currentAction.targetY - this.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		let targetX = 0;
		let targetY = 0;
				
		//move towards target location
		if(dist <= this.moveSpeed * this.moveSpeedB){
			//target within reach
			targetX = this.currentAction.targetX;
			targetY = this.currentAction.targetY;
		} else {
			//target too far away
			let shiftX = distX / (dist/(this.moveSpeed * this.moveSpeedB));
			let shiftY = distY / (dist/(this.moveSpeed * this.moveSpeedB));
			//destination coords
			targetX = this.x + shiftX;
			targetY = this.y + shiftY;
			//console.log(getTerrainType(targetX,targetY));	
		
			//swim check
			if(getTerrainType(targetX,targetY) == "water" && getTerrainType(this.x + shiftX * 2, this.y + shiftY * 2)  == "water" && this.lastAction != "swimming"){
				// carried away by water
				let swimChance = roll([["yes",1],["no",50]]);
				if(swimChance == "no"){
					var redirectTimes = 0;
					var redirectDir = roll([[-1,1],[1,1]]);
					var initialDir = Math.acos(shiftY/(this.moveSpeed*this.moveSpeedB));
					var tries = 314;
					do {					
						redirectTimes++;
						let newDir = initialDir + redirectDir * redirectTimes * 0.05;
						shiftX = (this.moveSpeed * this.moveSpeedB) * Math.sin(newDir);
						shiftY = (this.moveSpeed * this.moveSpeedB) * Math.cos(newDir);
						targetX = this.x + shiftX;
						targetY = this.y + shiftY;
						tries--;
					} while (getTerrainType(targetX,targetY) == "water" && tries > 0 && safeTerrainCheck(targetX,targetY));
				}
			}
		}
		this.moveToCoords(targetX, targetY);

		this.energy -= Math.floor(Math.random()*5+2);

		//timerClick("move");
		this.apply_all_effects("endMove");
	}
	//move to given coords
	moveToCoords(targetX, targetY){
		this.x = targetX;
		this.y = targetY;
		targetX = targetX / mapSize * $('#map').width() - iconSize/2;
		targetY = targetY / mapSize * $('#map').height() - iconSize/2;
		
		//update icons on map
		let charDiv = $('#char_' + this.id);
		charDiv.css({transform:"translate(" + targetX + "px," + targetY + "px)"},function(){});
		log_message(this.name +" moves to (" +this.x +","+ this.y+")", 1);
		updatePlayerDists(this)
	}
	
	//sleep
	action_sleep(){
		//just started sleeping
		if(this.currentAction.name != "sleep"){
			this.currentAction.name = "sleep";
			this.currentAction.turnsLeft = roll_range(5,8);
			// log_message(this.name + " sleeps for the next " + this.currentAction.turnsLeft + " turns");
			this.unaware=true;
			this.incapacitated=true;
			this.actionPriority=15;
		}
		//regain health and energy
		this.currentAction.turnsLeft--;
		this.health += Math.floor(Math.random() * 2);
		this.energy += Math.floor(Math.random() * 10);
		//wake up
		if(this.currentAction.turnsLeft > 0){
			log_message(this.name + " continues sleeping");
			this.lastAction = "sleeping";			
			this.statusMessage = "sleeping";			
		} else {
			log_message(this.name + " awakens");
			this.resetPlannedAction();
			this.lastAction = "awaken";
			this.statusMessage = "woke up";
		}
	}
	//check if player is supposed to die
	limitCheck(){
		if(this.weapon != ""){
			if(this.weapon.wielder != this){
				this.weapon = "";
			}
			if(this.weapon.uses<=0){
				this.weapon.destroy();
			}
		}
		if(this.offhand != ""){
			if(this.offhand.wielder != this){
				this.offhand = "";
			}
			if(this.offhand.uses<=0){
				this.offhand.destroy();
			}
		}
		
		let tP = this;
		this.status_effects.forEach(function(eff){
			if(eff.player !=tP){
				tP.remove_status_effect(eff);
			}
			if(eff.duration<0){
				eff.wear_off();
			}
		});
		
		if (isNaN(this.health) || isNaN(this.energy)) {
			this.death = this.name + " glitched to death"
			this.die();
			this.dead = true
			return;
		}
		if (isNaN(this.x) || isNaN(this.y)) {
			this.death = this.name + " glitched out of reality";
			this.die();
			this.dead = true
			return;
		}
		
		if(this.energy<=0){
			this.energy=0;
		}
		if(this.energy > this.maxEnergy)
			this.energy = this.maxEnergy;


		if(this.health > this.maxHealth){
			this.health = this.maxHealth;
		}
		
		if(this.health <= 0){
			this.health = 0;
			this.dead = true
			this.apply_all_effects("death");	
		}
		if(this.dead){
			this.die();
		}
		//if(this.energy < 25)
			//console.log(this.name + " low on energy");
	}
	//action on death
	die(){
		// this.health=0;
		players = arrayRemove(players,this);
		dedPlayers.push(this);
		if(!this.death){
			this.death = this.name + " died of unknown causes";
		}
		$("#tbl_" + this.id).addClass("dead");
		$("#tbl_" + this.id).removeClass("alive");
		$("#char_" + this.id).addClass("dead");
		$("#tbl_" + this.id + " .status").text(/*"D" + day + " H" + hour + " " + */this.death);
		$('#table .container.alive').last().after($("#tbl_" + this.id));
		moralNum[this.moral]--;
		personalityNum[this.personality]--;
	}
}

class PlayerMod{
	constructor(name){
		this.name = name;
		this.display_name = this.name[0].toUpperCase() + this.name.substring(1);
		
		this.sightBonus = 0;
		this.visibilityB = 0;
		
		this.rangeBonus = 0;
		this.fightBonus = 1;
		this.dmgReductionB = 1;
		
		this.peaceBonus=0
		this.aggroBonus=0
		this.intimidationBonus=0;
		
		this.moveSpeedB = 1;
	}
	calc_bonuses(){
		this.wielder.sightRangeB += this.sightBonus;
		this.wielder.visibilityB += this.visibilityB;
		
		this.wielder.fightRangeB += this.rangeBonus;
		this.wielder.fightDmgB *= this.fightBonus;
		this.wielder.dmgReductionB *= this.dmgReductionB;
		
		this.wielder.peaceB += this.peaceBonus;
		this.wielder.aggroB += this.aggroBonus;
		this.wielder.intimidation += this.intimidationBonus;
				
		this.wielder.moveSpeedB *= this.moveSpeedB;
	}
	item_odds(prob,item_type){}
}