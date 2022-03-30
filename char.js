class Char {
	constructor(name,img,x,y){
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
		this.moral = roll([['Chaotic',1],['Neutral',2],['Lawful',1]]);
		this.personality = rollSpecialP(this.name);
		this.personality = roll([['Evil',1],['Neutral',2],['Good',1]]);
		//roll([['Evil',1],['Neutral',2],['Good',1]])
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
		this.fightDmgB = 1.00;
		//damage reduction
		this.dmgReductionB = 1;		
		//peacefulness
		this.aggroB = 0;
		this.peaceB = 0;
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
		//1-3 : regular actions
		//4-6 : self serving actions
		//7-9 : mind controlling actions
		//10+ : physically disabling actions
		this.actionPriority = 0;
		this.lastSlept=0;
		this.lastFight=0;
		
		
		//_______________text_______________
		//action message to be displayed
		this.statusMessage = "";
		this.statusMessageLv = 0;
		//if their current action is complete
		this.finishedAction = true;

		
		//_______________surrounding players_______________
		//players they are aware of
		this.awareOf = [];
		this.inRangeOf = [];
		
		//_______________inventory_______________
		this.weapon = "";
		this.offhand = "";

		//unused
		this.alliance = {};
		this.opinions = [];
		this.recentlySeen = [];
		this.goal = "";

	}
	draw() {
		let charDiv = $('#char_' + this.id);
		if(!charDiv.length){
			//icon 
			$('#players').append(
			"<div id='char_" + this.id + "' class='char'><div class='charName'>" + this.name + "<div class='charWeap'></div>"+
			"<div class='charEff'	style='font-size:10px;'></div></div>"+
			"<div class='healthBar' style='margin-bottom:-10px'></div>"+
			"<div class='energyBar' style='margin-bottom:-10px'></div></div>");		
			
			//status
			charDiv = $('#char_' + this.id);
			charDiv.css('background-image',"url(" + this.img + ")");
			$('#table').append(
			"<div class='container alive' id='tbl_" + this.id + "'><img src='" + this.img + "'></img><div style='position:absolute;width:50px;height:60px;z-index:1;top:0;left:0'>"+
			"<div class='healthBar'></div><div class='energyBar'></div>"+ //hp+ep bar
			"<div class='kills'></div>"+		//kill counter
			"</div><div class='info'><div>" + this.moral.substring(0,1) + this.personality.substring(0,1) + " <b>" + this.name + //name
			"</b><span class='weapon'></span></div>"+
			"<div class='status'></div>"+		//status message
			"<div class='effects'></div>"+		//status message
			"</div></div>");
			
			this.div = charDiv;
		} 
		//charDiv.css('left',this.x / 1000 * .95 * $('#map').width() - iconSize/2);
		//charDiv.css('top',this.y / 1000 * .95 * $('#map').height() - iconSize/2);
		charDiv.css({transform:"translate(" + (this.x / mapSize * $('#map').width() - iconSize/2) + "px," + (this.y / mapSize *  $('#map').height() - iconSize/2) + "px)"},function(){
		});
	}
	//calculate bonuses for combat
	calc_bonuses(){
		this.sightRangeB = 0;
		this.visibilityB = 0;

		this.fightRangeB = 0;
		this.fightDmgB = 1;
		this.dmgReductionB = 1;
		
		this.aggroB=0
		this.peaceB=0
		
		this.moveSpeedB = 1

		//apply weapon bonuses
		if(this.weapon){
			this.weapon.calc_bonuses();
		}
		if(this.offhand){
			this.offhand.calc_bonuses();
		}
		//apply bonuses from statuses
		this.status_effects.forEach(function(eff,index){
			eff.calc_bonuses();
		});
		
		//apply experience bonuses
		this.fightDmgB *= Math.pow(this.killExp,this.exp/100);
		//apply terrain bonuses
		switch(terrainCheck(this.x,this.y)){
			//mountain increases sight
			case "m":
				this.sightRangeB += 100;
				break;
			case "t":
				this.sightRangeB -= 50;
				this.fightRangeB -= 4;
				this.visibilityB -= 10;
				break;
			case "w":
				this.fightRangeB = 0;
				break;
			default:
				break;
		} 
		if(this.dmgReductionB <0){
			this.dmgReductionB = 0;
		}
	}
	awareOfPlayer(oP){
		if(this.awareOf.indexOf(oP)>=0){
			return true;
		}
		return false;
	}
	inRangeOfPlayer(oP){
		if(this.inRangeOf.indexOf(oP)>=0){
			return true;
		}
		return false;
	}
	//apply effects to self
	apply_inv_effects(state, wep_data={}, offhand_data={}){
		if(this.weapon){
			this.weapon.effect(state, wep_data)
		}
		if(this.offhand){
			if(this.offhand_data){
				this.offhand.effect(state, offhand_data)
			}
			else{
				this.offhand.effect(state, wep_data)
			}
		}
	}
	//apply status effects to self
	apply_status_effects(state, data={}){
		this.status_effects.forEach(function(eff,index){
			eff.effect(state, data);
		});		
	}	
	
	apply_all_effects(state, data={}){
		this.apply_inv_effects(state, data);
		this.apply_status_effects(state, data);
	}
	
	/*
	//apply effects to others
	apply_inv_effects_other(state, oP, wep_data={}, offhand_data={}){
		if(this.weapon){
			wep_data.opponent = oP
			this.weapon.effect(state, wep_data)
		}
		if(this.offhand){
			if(this.offhand_data){
				offhand_data.opponent = oP
				this.offhand.effect(state, oP,offhand_data)
			}
			else{
				wep_data.opponent = oP
				this.offhand.effect(state, oP, wep_data)
			}
		}
	}
	apply_status_effects_other(state, oP, data={}){
		data.opponent=oP;
		oP.status_effects.forEach(function(eff,index){
			eff.effect(state, data);
		});		
	}
	*/
	
	//equipping an item
	equip_item(item, slot){
		if(slot=="wep"){
			if(this.weapon){
				if(this.weapon.unequip()){
					this.weapon=item;
					item.equip(this);
					return true;
				}
				else{
					return false;
				}
			}
			else{
				this.weapon=item;
				item.equip(this);
				return true;
			}
		}
		if(slot=="off"){
			if(this.offhand){
				if(this.offhand.unequip()){
					this.offhand=item;
					item.equip(this);
					return true;
				}
				else{
					return false;
				}
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
				else{
					return false;
				}
			}
		}
		if(slot=="off"){
			if(this.offhand){
				if(this.offhand.unequip()){
					this.offhand=""
					return true;
				}
				else{
					return false;
				}
			}
		}
	}
	
	//adding status effect
	inflict_status_effect(status_eff){
		if(this.get_status_effect(status_eff.name)){
			//if player already has the effect
			this.get_status_effect(status_eff.name).stack_effect(status_eff);
			log_message(this.name +"'s " + status_eff.name+ " stacked");
		}
		else{
			//add new effect into list
			this.status_effects.push(status_eff);
			status_eff.afflict(this);
			this.apply_inv_effects("new status", {"eff": status_eff});
			log_message(this.name +" is afflicted with " + status_eff.name);
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
	
	
	//action planning
	setPlannedAction(action, actionPriority){
		if(actionPriority>this.actionPriority){
			log_message(this.name +"'s "+ this.plannedAction +" replaced with " +action+ " " +actionPriority);
			this.actionPriority = actionPriority;
			this.plannedAction = action;
			this.currentAction = {};
			return true;
		}
		log_message(this.name +"'s "+ this.plannedAction +" cannot be replaced with " +action);
		return false;
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
		//get opponents that are in sight 
		this.awareOf = awareOfCheck(this);		//Opponents in sight
		//if previously sleeping or trapped, clear aware list	
		if(this.lastAction == 'sleeping' || this.lastAction == 'trapped'){this.awareOf = [];}
		log_message(this.name + " aware "+this.awareOf.length)
		//apply effects from those in sight
		let temp_this=this;
		this.awareOf.forEach(function(oP,index){
			// oP.apply_inv_effects_other("op aware", temp_this);
			// oP.apply_status_effects_other("op aware", temp_this);
			oP.apply_all_effects("op aware", {"opponent":temp_this});
		});

		//get opponents that player can fight
		this.inRangeOf = inRangeOfCheck(this);	//Opponents in range
		//if previously sleeping or trapped, clear in range list	
		if(this.lastAction == 'sleeping' || this.lastAction == 'trapped'){this.awareOf = [];}
		log_message(this.name + " in range "+this.inRangeOf.length)		
		//apply effects from those in range
		temp_this=this;
		this.inRangeOf.forEach(function(oP,index){
			// oP.apply_inv_effects("op in range", {"opponent":temp_this});
			// oP.apply_status_effects_other("op in range", temp_this);
			oP.apply_all_effects("op in range", {"opponent":temp_this});
		});

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
		
	 	//apply turn start effects
		// this.apply_inv_effects("turn start");
		// this.apply_status_effects("turn start");
		this.apply_all_effects("turn start");
		
		//update some counters
		if(this.lastAction!="sleeping"){
			this.lastSlept++;
		}else{
			this.lastSlept=0;
		}
		if(this.lastAction!="fighting"){
			this.lastFight++;
		}else{
			this.lastFight=0;
		}
		
		this.checkSurroundingPlayers();
		
		//plan next action
		/*
			low health/energy and alone: forage
			another action planned: continue action
			choose options:
				move, fight, sleep
		*/		
		//continue with current action if there is one
		if(this.currentAction.name){
			log_message(this.name + " continues with " + this.currentAction.name+" "+this.actionPriority);
			this.plannedAction = this.currentAction.name;
		}
		//forage if energy is low, health is low, and is not aware of others, and not in water
		if(((this.energy/this.maxEnergy) *100 < roll_range(25,50)||(this.health/this.maxHealth)*100 < roll_range(25,50)) &&
			!this.awareOf.length && terrainCheck(this.x,this.y) != "w")
		{
			this.setPlannedAction("forage",2);
		}
		
		let options = [];
		//move 
		options.push(["move",100]);
		//fight if players in range
		if(this.inRangeOf.length > 0)
			options.push(["fight",100 + (this.aggroB - this.peaceB)]);
		//follow
		if(this.awareOf.length > 0)
			options.push(["follow",90]);
		//if it is night add sleep as an option
		if((hour >= 22 || hour < 5) && this.lastAction != "awaken" && this.lastSlept>=5 && terrainCheck(this.x,this.y) != "w")
			options.push(["sleep",90+2*this.lastSlept]);
		
		//choose option
		let o = roll(options);
		if(o == "fight"){
			//set target to the first player in range
			if(this.setPlannedAction("fight",4)){
				this.plannedTarget = this.inRangeOf[0];	   
				log_message(this.name + " targets attack "+this.plannedTarget.name)
				if(this.plannedTarget.setPlannedAction("attacked", 4)){
					log_message(this.plannedTarget.name + " action set to attacked");
				}					
			}
		}
		else if(o == "follow"){
			if(this.setPlannedAction("follow",1)){
				this.plannedTarget = this.awareOf[0];
				log_message(this.name + " targets follow "+this.plannedTarget.name)
			}
		}
		else if(o == "sleep"){
			this.setPlannedAction(o, 2)
		}
		else{
			this.setPlannedAction(o, 1)
		}
		
		//apply effects
		// this.apply_inv_effects("plan action");
		// this.apply_status_effects("plan action");
		this.apply_all_effects("plan action");
				
		log_message(this.name+" plans to "+ this.plannedAction)
	}
	
	//perform action
	//called by action in main
	doAction(){
		this.div.find('.charName').removeClass('trapped');
		// this.apply_inv_effects("do action");
		// this.apply_status_effects("do action");
		// this.apply_all_effects("do action");
		
		//perform planned action
		if(this.health > 0 && !this.finishedAction){
			//console.log(this.name + " " + this.plannedAction);
			//removing red fighting border
			this.div.removeClass("fighting");
			switch(this.plannedAction){
				case "forage":
					this.action_forage();
					break;
				case "follow":
					this.action_follow();
					break;
				case "move":
					this.action_move();
					break;
				case "fight":
					this.action_fight();
					break;
				case "attacked":
					this.action_attacked();
					break;
				case "sleep":
					this.action_sleep();
					break;
				/*
				case "trapped":
					this.action_escapeTrap();
					break;
				*/
				default:
					//console.log(this.name + " has no planned action");
					// this.statusMessage = "Does nothing";
					// this.resetPlannedAction();
					this.apply_all_effects(this.plannedAction);
					break;
			}
		}

		//toggle class for the last action
		if(this.lastAction == 'sleeping'){
			this.div.find('.charName').addClass('sleep');
		} else {
			this.div.find('.charName').removeClass('sleep');
		}
		if(this.lastAction == 'try escape'){
			this.div.find('.charName').addClass('trapped');
		} else {
			this.div.find('.charName').removeClass('trapped');
		}		
		//action completed
		this.finishedAction = true;
		// this.apply_inv_effects("end turn");
		// this.apply_status_effects("end turn");
		this.apply_all_effects("end turn");
	}
	
	//action functions
	//attempt to escape trap
	action_escapeTrap(){
		if (Math.floor(Math.random() * 10) > 8){
			log_message(this.name + " escapes");
			this.statusMessage = "escaped a trap";
			this.lastAction = "escapeS";
			this.resetPlannedAction();
		} else {
			this.energy -= 10;
			this.health -= Math.floor(Math.random() * 5);
			this.lastAction = "escapeF";
			this.statusMessage = "tried escape a trap";
			log_message(this.name + " fails to escape");
			if(this.health <= 0) 
				this.death = "died escaping a trap";
		}
	}
	
	//fight
	action_fight(){
		log_message(this.name + " fights back");
		//add red fighting border
		//this.div.addClass("fighting");
		//fight planned target
		
		if(this.plannedTarget){
			
			if(this.plannedTarget.health>0){
				this.lastAction = "fighting";
				//calculate damage for both fighters
				fight_target(this,this.plannedTarget);
			}
			//if target is already dead
			else{
				this.statusMessage = "attacks the corpse of " + this.plannedTarget.name;
			}
		}
		else{
			this.lastAction = "fighting";
			this.statusMessage = this.name + " fights their inner mind goblin";
		}
		this.energy -= 20;
		if(this.energy < 0){
			//this.death = "exhausted to death from fighting";
			//this.die();
		}
		//clear target and actions
		this.plannedTarget = "";
		this.resetPlannedAction();
	}

	//attacked
	action_attacked(){
		log_message(this.name + " attacked");
		this.lastAction = "fighting";
		this.resetPlannedAction();
	}

	//forage
	action_forage(){
		//if foraging just started, set current action to foraging and set turns
		if(this.currentAction.name != "forage"){
			log_message(this.name + " starts foraging");
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
		//get loot
		if(this.currentAction.turnsLeft == 0){
			switch(roll([["success",900],["fail",100],["poisoned",1]])){
				//if foraging is successful
				case "success":
					this.statusMessage = "forage success";
					let restore_bonus=0;
					//randomly find a weapon
					let loot_type="";
					if(!this.weapon && !this.offhand){
						loot_type=roll([["wep",3],["off",2]])
					}else{
						restore_bonus = 20
					}
					//roll weapon
					if(!this.weapon || loot_type=="wep"){
						// let weaponOdds = [["knife",30],["gun",20],["lance",25],["bow",20], ["bomb",5],["trap",10],["Nothing",500]];//nothing was 500
						let weaponOdds = [["knife",30],["gun",20],["lance",25],["bow",20],["katana", 2000], ["Nothing",0]];//nothing was 500
						if(sexSword){
							// weaponOdds.push(["nanasatsu",1]);
							weaponOdds.push(["nanasatsu",10000]);
						}
						let w = roll(weaponOdds)
						log_message(this.name +" found "+ w);
						let temp_wep = create_weapon(w); 
						//add weapon to equipped
						if(temp_wep){
							this.equip_item(temp_wep, "wep");
						}
					}
					/*
					else if(!this.offhand || loot_type=="off"){
						let offhandOdds = [];//nothing was 500
						let off = roll(offhandOdds)
						log_message(this.name +" found "+ off);
						let temp_off = create_offhand(off); 
						//add weapon to equipped
						if(temp_off){
							if(temp_off.equip(this)){
								this.offhand = temp_off;
							}
						}
					}
					*/
					
					//restore health and energy
					// this.energy += Math.floor(Math.random() * 30+30);
					this.energy += roll_range(30,60+restore_bonus)
					// this.health += Math.floor(Math.random() * 5);
					this.health += roll_range(5,10+restore_bonus/2);
					this.lastAction = "forage";
					break;
				//failed forage
				case "fail":
					this.lastAction = "forage";
					this.statusMessage = "forage fail";
					break;
				//rip
				case "poisoned":
					this.health = 0;
					this.lastAction = "forage";
					this.death = "death from poisoned berries";
					break;
			}
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
		this.currentAction.name = "";
		this.currentAction.targetX = newX;
		this.currentAction.targetY = newY;
		
		// this.plannedTarget.apply_inv_effects_other("follow target", this);
		// this.plannedTarget.apply_status_effects_other("follow target", this);
		this.plannedTarget.apply_all_effects("follow target", {"opponent":this});
		
		this.moveToTarget();
		log_message(this.name +" following "+this.plannedTarget.name);
		log_message(this.plannedTarget.name +" at ("+this.plannedTarget.x+","+this.plannedTarget.y+")");
		this.resetPlannedAction();
	}
	//move
	//will keep moving to that spot in the next turns
	action_move(){
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
			} while(!boundsCheck(newX,newY) && tries < 10);
			//is this even possible?
			if(tries>=10){
				log_message(this.name + " moving off screen?");
			}
			this.lastAction = "moving";
			this.statusMessage = "on the move";
			this.currentAction.name = "move";
			
			//get a target location to move to
			this.currentAction.targetX = newX;
			this.currentAction.targetY = newY;
		}
		this.moveToTarget();
		//if arrived on target location
		if(this.currentAction.targetX == this.x && this.currentAction.targetY == this.y){
			this.resetPlannedAction();
			log_message(this.name + " movement finished");
		}
		else{
			log_message(this.name + " movement not finished");
		}
	}
		/*
		//using doodads
		if(this.weapon){
			//if((this.weapon.name == "bomb" || this.weapon.name == "trap") && roll([['use',20],['notuse',100]]) == 'use'){
			if(this.weapon.type == "doodad" && roll([['use',20],['notuse',100]]) == 'use'){
				let tempDoodad = new Doodad(this.weapon.name,this.x,this.y,this);
				tempDoodad.draw();
				doodads.push(tempDoodad);
				this.weapon = "";
				log_message(this.name + " sets a trap");
			}
		}
		*/
	//move towards target through regular means
	moveToTarget(){
		//Calculating distance from target
		let distX = this.currentAction.targetX - this.x;
		let distY = this.currentAction.targetY - this.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		let targetX = 0;
		let targetY = 0;
		
		//factor in terrain
		if(terrainCheck(this.x,this.y)=="w"){
			this.moveSpeedB = 0.5;
		} else {
			this.moveSpeedB = 1;
		}
		
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
			//console.log(terrainCheck(targetX,targetY));	
		
			//swim check
			if(terrainCheck(targetX,targetY) == "w" && terrainCheck(this.x + shiftX * 2, this.y + shiftY * 2)  == "w" && this.lastAction != "swimming"){
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
					} while (terrainCheck(targetX,targetY) == "w" && tries > 0 && boundsCheck(targetX,targetY));
				}
			}
		}
		this.moveToCoords(targetX, targetY);
	}
	//move to given coords
	moveToCoords(targetX, targetY){
		this.x = targetX;
		this.y = targetY;
		targetX = targetX / mapSize * $('#map').width() - iconSize/2;
		targetY = targetY / mapSize * $('#map').height() - iconSize/2;
		
		//update icons on map
		let charDiv = $('#char_' + this.id);
		charDiv.css({transform:"translate(" + targetX + "px," + targetY + "px)"},function(){
		});
		log_message(this.name +" moves to (" +this.x +","+ this.y+")");
		
		//look for doodads
		doodadCheck(this);
		
		this.energy -= Math.floor(Math.random()*5+2);
		
		//terrain action
		if(terrainCheck(this.x,this.y)=="w"){
			this.lastAction = "swimming";
			this.statusMessage = "swimming";
		} else if(terrainCheck(this.x,this.y)!="w" && this.lastAction == "swimming"){
			this.lastAction = "moving";
			this.statusMessage = "moving";
		}
		//terrain death
		if(roll([["die",1],["live",2000]]) == "die" && terrainDeath > 0 ){
			switch(terrainCheck(this.x,this.y)){
				case "️⛰️":
					this.health = 0;
					this.death = "Fell off a cliff";
					terrainDeath--;
					break;
				case "w":
					this.health = 0;
					this.death = "Drowned";
					terrainDeath--;
					break;
				default:
					break;
			}
		}
		//timerClick("move");
	}
	//sleep
	action_sleep(){
		//just started sleeping
		if(this.currentAction.name != "sleep"){
			this.currentAction.name = "sleep";
			this.currentAction.turnsLeft = roll_range(5,8);
			log_message(this.name + " sleeps for the next " + this.currentAction.turnsLeft + " turns");
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
		if(this.energy <= 0){
			//if(!this.death) this.death = "death from exhaustion";
			//this.die();
			this.energy = 0;
		}
		if(this.energy > this.maxEnergy)
			this.energy = this.maxEnergy;
		if(this.health <= 0){
			this.health = 0;
			this.die();
		}
		if(this.health > this.maxHealth){
			this.health = this.maxHealth;
		}
		//if(this.energy < 25)
			//console.log(this.name + " low on energy");
	}
	//action on death
	die(){
		this.health=0;
		// this.apply_inv_effects("death");
		// this.apply_status_effects("death");
		this.apply_all_effects("death");
		players = arrayRemove(players,this);
		dedPlayers.push(this);
		$("#tbl_" + this.id).addClass("dead");
		$("#tbl_" + this.id).removeClass("alive");
		$("#char_" + this.id).addClass("dead");
		$("#tbl_" + this.id + " .status").text(/*"D" + day + " H" + hour + " " + */this.death);
		$('#table .container.alive').last().after($("#tbl_" + this.id));
		moralNum[this.moral]--;
		personalityNum[this.personality]--;
		if(this.weapon){
			//drop bomb on death
			if(this.weapon.name == "bomb"){
				let tempBomb = new Doodad("bomb",this.x,this.y,this);
				tempBomb.draw();
				doodads.push(tempBomb);
				tempBomb.trigger();
				this.weapon = "";
			}
		}
	}
}