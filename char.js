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
		this.maxHealth = 100;
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
		// this.sightRange = 2000;
		this.sightRangeB = 0;
		//how far they can attack
		this.fightRange = 24;
		this.fightRangeB = 0;
		//damage dealt
		this.fightDmg = 25;
		// this.fightDmg = 0;
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
		//the action performed in the previous turn
		//used to plan current action
		this.plannedAction="";
		this.plannedActionClass = "";
		this.plannedActionData = {};
		this.currentAction = {};
		this.lastAction={};

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
		// this.finishedAction = true;
		this.interrupted = false;

		//_______________surrounding players_______________
		//players they are aware of
		this.awareOf = [];
		//players within attack range
		this.inRangeOf = [];
		//players that can be attacked
		//decrepit 
		this.attackable = [];
		//players that can be allied
		//decrepit 
		this.allyable = []
		
		this.plannedTarget = "";
		
		this.fight_target = "";
		this.follow_target = "";
		this.ally_target = "";
		
		this.danger_score = 0;
		
		this.opponents = [];
		this.last_opponent = "";
		this.followers = [];
				
		this.rival = "";
		
		//_______________inventory_______________
		this.weapon = "";
		this.offhand = "";

		this.alliance = "";
		this.opinions = [];	
		//unused					
		this.recentlySeen = [];
		this.goal = "";

		this.unaware = false;
		this.incapacitated = false;
		//if the player can fight back when attacked
		this.fight_back = true;
		
		//ignores terrain
		this.ignore_terrain = false;
		
		this.death = "Cast in the name of God, Ye Guilty";
		this.dead = false;
	}

	//other players
	inAlliance(oP){
		if(this.alliance)
			if(this.alliance.members.indexOf(oP)>=0)
				return true
		return false;		
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
	//decrepit 
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
			this.intimidation += 20;
		}
		this.intimidation += this.kills * 5

		//chaotic = more likely to be aggro
		//lawful = more likely to be peaceful
		// if(this.moral == 'Lawful')
		if(this.personality == 'Good')
			this.peaceB = 75;
		// if(this.moral == 'Chaotic'){
		if(this.personality == 'Evil'){
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
		if(!this.ignore_terrain && getTerrain(this.x,this.y)){
			getTerrain(this.x,this.y).calc_bonuses(this)
		}

		if(this.fightDmgB <0){
			this.fightDmgB = 0;
		}
		if(this.dmgReductionB <0){
			this.dmgReductionB = 0;
		}	
	}

	apply_all_effects(state, data={}){
		if(this.weapon)
			this.weapon.effect(state, data)
		if(this.offhand)
			this.offhand.effect(state, data)
		this.status_effects.forEach(function(eff,index){
			eff.effect(state, data);
		});	
		this.attributes.forEach(function(attr,index){
			attr.effect(state, data);
		});		
	}
	apply_all_calcs(state, x, data={}){
		if(this.weapon)
			x=this.weapon.effect_calc(state, x, data)
		if(this.offhand)
			x=this.offhand.effect_calc(state, x, data)
		this.status_effects.forEach(function(eff,index){
			x=eff.effect_calc(state, x, data);
		});	
		this.attributes.forEach(function(attr,index){
			x=attr.effect_calc(state, x, data);
		});	
		return x
	}

	apply_player_effects(state, data={}){
		if(this.weapon)
			this.weapon[state](data)
		if(this.offhand)
			this.offhand[state](data)
		this.attributes.forEach(function(attr,index){
			attr[state](data);
		});	
		this.attributes.forEach(function(attr,index){
			attr[state](data);
		});	
	}

	apply_player_calcs(state, x, data={}){
		if(this.weapon)
			x=this.weapon[state](x, data)
		if(this.offhand)
			x=this.offhand[state](x, data)
		this.attributes.forEach(function(attr,index){
			x=attr[state](x, data);
		});	
		this.attributes.forEach(function(attr,index){
			x=attr[state](x, data);
		});	
		return x
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
		else if(item instanceof Offhand){
			if(this.offhand){
				return this.offhand.replace_offhand(item);
			}
			else{
				this.offhand=item;
				item.equip(this);
				return true;
			}
		}
		else{
			if(item=='Nothing')
				return false
			this.apply_all_effects("equipItem",{'item':item})
			return false;
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
	
	//adding status effect
	inflict_status_effect(status_eff){
		let apply = true
		apply = this.apply_all_calcs("newStatus", apply, {"eff": status_eff});
		if(!apply){
			log_message(this.name +" cannot be afflicted with " + status_eff.name, 1);
			return;
		}
		if(this.get_status_effect(status_eff.name)){
			//if player already has the effect
			this.get_status_effect(status_eff.name).stack_effect(status_eff);
			log_message(this.name +"'s " + status_eff.name+ " stacked", 1);
		}
		else{
			//add new effect into list
			this.status_effects.push(status_eff);
			status_eff.afflict(this);			
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
	
	take_damage(dmg, source, dmg_type, fightMsg={}){
		this.apply_all_effects("takeDmg", {"source":source, "damage":dmg, "dmg_type":dmg_type, "fightMsg":fightMsg});
		this.health -= dmg;
		if(source instanceof Char){
			if(source != this)
				this.opinions[source.id] -= Math.max(Math.round(dmg/2), 1);
		}
	}
	
	heal_damage(dmg, source, dmg_type, fightMsg={}){
		this.apply_all_effects("healDmg", {"source":source, "damage":dmg, "dmg_type":dmg_type, "fightMsg":fightMsg});
		this.health += dmg;
	}	
		
	//action planning
	setPlannedAction(action, actionPriority, actionClass, data={}){
		if(actionPriority<this.actionPriority){
			log_message(this.name +"'s "+ this.plannedAction +" cannot be replaced with " +action, 0);
			return false
		}			
		//chance to replace if priority is same
		if(actionPriority==this.actionPriority){
			if(Math.random()>=0.05)
				return false
			log_message(this.name +"'s "+ this.plannedAction +" cannot be replaced with " +action, 0);
		}
		log_message(this.name +"'s "+ this.plannedAction +" replaced with " +action+ " " +actionPriority, 0);
		this.actionPriority = actionPriority;
		this.plannedAction = action;
		this.plannedActionData = data;		
		this.plannedActionClass = actionClass
		this.currentAction = {};
		return true;
	}
	//reset planned action
	resetPlannedAction(){
		this.actionPriority=0;
		this.plannedAction="";
		this.plannedActionClass = "";
		this.plannedActionData ={};
		
		// this.lastAction = this.currentAction;
		this.currentAction = {};
		// this.plannedTarget = "";
	}
	
	//check for aware and in range players
	checkSurroundingPlayers(){
		this.calc_bonuses();
		
		//action check update
		if(this.lastActionState=='sleeping'){
			this.unaware = true;
			this.incapacitated = true;
		}
		
		let tP=this;
		this.awareOf = [];
		if(!this.unaware){
			players.forEach(function(oP){
				if(oP == tP)
					return
				let aware = awareOfCheck(tP,oP);
				if(aware){
					//apply effects from those in sight
					oP.apply_all_effects("opAware", {"opponent":tP});
					tP.awareOf.push(oP)
				}
			});	
		}
		this.inRangeOf = [];
		if(!this.incapacitated){
			this.inRangeOf = this.nearbyPlayers(tP.fightRange + tP.fightRangeB);
			this.inRangeOf.forEach(function(oP){
				oP.apply_all_effects("opInRange", {"opponent":tP});
			});
		}
		
		this.opinionUpdate();
		this.danger_score = this.get_danger_level();
		
		this.follow_target = "";
		this.fight_target = "";		
		this.ally_target = "";
		if(this.awareOf.length>0){
			this.follow_target = this.choose_follow_target();
			this.fight_target = this.choose_fight_target();		
			this.ally_target = this.choose_alliance_target();	
		}
		
		this.apply_all_effects("surroundingCheck");	
	}
	
	opinionUpdate(){
		//rival update
		if(this.rival){
			if(this.rival.dead){
				this.rival=""
			}
			if(roll_range(-80, -20) < this.opinions[this.rival.id]){
				this.rival=""
			}
		}
		
		let tP=this;
		//update opinions
		players.forEach(function(oP){
			if(oP==tP){
				tP.opinions[tP.id] = 0;
				return
			}						
			opinion_calc(tP, oP)
			
			//find rival
			if(!tP.rival){
				if(roll_range(-50, -300) >  tP.opinions[oP.id]){
					// log_message(tP.name + ' rival ' +oP.name + ' ' + tP.opinions[oP.id])
					tP.rival = oP;
					tP.opinions[oP.id] -= 50;
				}				
			}
			else{
				if(tP.opinions[tP.rival.id] - tP.opinions[oP.id]>roll_range(50,150)){
					tP.rival = oP;
					tP.opinions[oP.id] -= 50;
				}
			}
		});
		
		this.apply_all_effects("opinionUpdate");
	}
	
	//get the level of danger at a given point
	get_danger_level(dist=75, coords=[]){
		let danger_score = 0
		let nearby=[];
		let x=-1;
		let y=-1;
		if(coords.length<2){
			nearby = this.nearbyPlayers(dist)
			x=this.x
			y=this.y
		}
		else{
			nearby = nearbyPlayers(x,y, dist)
			x=coords[0]
			y=coords[1]
		}
		let tP = this;
		nearby.forEach(function(oP){
			let player_danger_score = get_player_danger_score(tP,oP)
			danger_score += player_danger_score
			if(player_danger_score>200)
				danger_score += 50
		});
		
		if(nearby.length>0)
			danger_score = danger_score/Math.min(nearby.length,5)
		//terrain
		if(!this.ignore_terrain)
			danger_score += (Math.pow(3,getTerrain(x,y).danger)-1)*12
		if(!safeBoundsCheck(x,y))
			danger_score += 100
		
		danger_score = this.apply_all_calcs('dangerCalc', danger_score, {'coords':coords})
		// danger_score -= Math.min(this.aggroB/10, 200)
		danger_score = Math.round(danger_score)
		
		return danger_score;
	}
		
	//offered to join alliance
	alliance_offer(oP){
		//already in alliance
		if(this.alliance && oP.alliance){
			return false
		}		
		let score = get_ally_score(this, oP);		
		let tP = this;
		if(this.rival==oP)
			score -= 100;		
		if(this.ally_target == oP)
			score += 500;
		
		//accepting another player into alliance
		if(this.alliance){
			log_message('alliance invite offer')
			// accept into alliance
			if(this.alliance.members.length>=max_alliance_size)
				return false
			
			//check alliance member opinions
			this.alliance.members.forEach(function(member){
				if(member==tP)
					return				
				score += get_ally_score(member,oP)/(tP.alliance.members.length*2);
			});
			score -= ((this.alliance.members.length-2)/max_alliance_size * 100)
			log_message(score)
			if(score>roll_range(150,300))
				return true;			
		}
		//joining someone else's alliance
		else if(oP.alliance){
			log_message('alliance join offer')
			//join existing alliance
			if(oP.alliance.members.length>=max_alliance_size)
				return false
			
			//check alliance member opinions
			oP.alliance.members.forEach(function(member){
				if(member==oP)
					return				
				score += get_ally_score(member,oP)/(oP.alliance.members.length*3);
			});
			if(this.moral=='Chaotic')
				score -= 10;
			else if(this.moral=='Lawful')
				score += oP.alliance.unity-100;
			log_message(score)
			if(score>roll_range(150,250))				
				return true;	
		}
		//starting a new alliance
		else{
			log_message('alliance start offer')
			//starting new alliance
			if(alliances.length>=max_alliance_count)
				return false
			if(this.personality == oP.personality){
				//same personality
				score *= 1.5
			} else if (this.personality != 'Neutral' && oP.personality != 'Neutral'){
				//opposing personality
				score *= 0.5
			}
			else{
				score += 50
			}
			
			log_message(score)
			if(score>roll_range(150,250))	
				return true;					
		}
		return false;
	}
	
	//choose a player to follow
	choose_follow_target(){
		if(this.awareOf.length==0){
			return
		}
		let follow_type = roll([['aggro',50+this.aggroB],['neu',100],['def',50+this.peaceB]])
		let tP = this
		let target = '';
		let target_score = 0
		//choose highest target score
		this.awareOf.forEach(function(oP){
			let score = get_follow_score(tP,oP,follow_type);
			if(!target){
				target = oP
				target_score = score;
			}
			else{
				if(score > target_score){
					target = oP
					target_score = score;
				}
			}	
		});	
		log_message(this.name + ' ' + follow_type + ' ' + target.name + ' ' + target_score)
		return target;
	}
	
	//choose a player to fight
	choose_fight_target(){
		if(this.inRangeOf.length==0){
			return ""
		}
		let tP = this
		let target_lst = [['',Math.min(this.peaceB/3,200)]]
		
		this.inRangeOf.forEach(function(oP){
			if(tP==oP)
				return
			//calculate aggro score
			let score = get_fight_score(tP,oP);
			if(score>0)
				target_lst.push([oP,score])
		});
		if(target_lst.length==0){
			return
		}
		log_message(this.name + ' fight')
		log_message(target_lst)
		let target = roll(target_lst)
		return target;
	}
	
	//choose a player to ally with
	choose_alliance_target(){
		if(this.awareOf.length==0){
			return ""
		}
		let tP = this
		let target_lst = [['',150]]
		
		this.awareOf.forEach(function(oP){
			if(tP==oP)
				return
			//calculate aggro score
			let score = get_ally_score(tP,oP)		
			if(score>0)
				target_lst.push([oP,score])
		});
		if(target_lst.length==0){
			return ''
		}
		log_message(this.name + ' alliance')
		log_message(target_lst)
		let target = roll(target_lst)
		return target;
	}
	
	turnStart(){
		//calculate bonuses
		this.calc_bonuses();
		//reset variables
		this.current_turn_fights = 0;
		this.unaware = false;
		this.incapacitated = false;
		this.fight_back = true;
		this.statusMessage = "";
		this.interrupted = false;
		
		this.lastAction = this.currentAction;
		if(this.currentAction.name){
			this.currentAction.turn_start();			
			if(this.currentAction.complete)
				this.resetPlannedAction();
		}
		
	 	//apply turn start effects
		this.apply_all_effects("turnStart");
		
		//update some counters
		//action check update
		if(this.lastAction instanceof SleepAction == false)
			this.lastSlept++;
		else
			this.lastSlept=0;
		//action check update
		if(this.lastActionState!="fighting" && this.lastActionState!="attacked")
			this.lastFight++;
		else
			this.lastFight=0;		
				
		this.checkSurroundingPlayers();				
		this.opinionUpdate();
		this.planAction()
	}
	
	//plan the next action
	/*
	calculate bonuses
	apply inventory effects
	choose an action
	*/
	//decide what action to take for the next turn
	planAction(){		
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
			// this.setPlannedAction("rest", 20);
			this.setPlannedAction('rest', 20, RestAction);
			log_message('rest')
		}
		//force movement to center
		if(!safeBoundsCheck(this.x, this.y)){
			this.oobTurns = this.oobTurns+1;
			// this.setPlannedAction("move", 9,{'targetX':mapSize/2, 'targetY':mapSize/2});
			this.setPlannedAction('move', 9, MoveAction, {'targetCoords':[mapSize/2,mapSize/2]});
			// this.currentAction.targetX=mapSize/2;
			// this.currentAction.targetY=mapSize/2;
			log_message(this.name +" moving to center", 1)
		}
		else{
			this.oobTurns=0;
		}

		//forage if energy is low
		if((this.ignore_terrain || getTerrain(this.x,this.y).danger==0) && this.danger_score<roll_range(150, 500)){
			//action check update
			if(this.lastActionState!="foraging" && this.lastActionState != "sleeping"){
				let energy_percent = (this.energy/this.maxEnergy) *100;
				if(energy_percent < roll_range(25,50)){
					//set priority for foraging depending on energy
					let forageLv=2;
					if(energy_percent<20){forageLv = 7;}
					if(energy_percent < 10){forageLv = 14;}
					if(energy_percent < 5){forageLv = 19;}
					this.setPlannedAction('forage', forageLv, ForageAction);
				}
				//forage if health is low and alone
				else if((Math.pow(this.maxHealth - this.health,2) > Math.random() * 2500+ 2500  /*&& this.awareOf.length==0*/)){
					this.setPlannedAction('forage', 2, ForageAction);
				}
			}
		}		
		
		//fight
		if(this.fight_target){
			let fightChance = baseFightChance+this.aggroB;
			let peaceChance = basePeaceChance+this.peaceB;	
			if(fightChance<1)
				fightChance=1;
			if(peaceChance<1)
				peaceChance=1;	
			if(roll([['fight',fightChance],['peace',peaceChance]]) == 'fight'){
				/*
				if(this.setPlannedAction("fight",6)){  
					this.plannedTarget = this.fight_target;
				}*/
				this.setPlannedAction('fight', 6, FightAction, {'target':this.fight_target})
			}
			if(!fight_target)
				log_message('no target found')
		}
		
		//move away from danger
		if(!this.ignore_terrain && getTerrain(this.x,this.y).danger>1){
			// this.setPlannedAction("terrainEscape", 7)
			this.setPlannedAction("terrainEscape", 7, TerrainEscapeAction)
			log_message('terrain escape')
		}
		if((this.danger_score - this.aggroB + this.peaceB/2) > roll_range(100+ Math.max((this.lastFight - 30 ) * 10, 0), 500) ){
		// if(this.danger_score>roll_range(-1000, -1000)){
			this.setPlannedAction("playerEscape", 6, PlayerEscapeAction)
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
						
			//follow
			if(this.follow_target){
				let follow_chance = Math.floor((total_players - players.length)/total_players *80) + 20
				options.push(["follow", follow_chance]);
			}
			//if it is night add sleep as an option
			//action check update
			if((hour >= 22 || hour < 5) && this.lastAction instanceof SleepAction == false && this.lastSlept>=12 && getTerrain(this.x,this.y).danger==0)
				options.push(["sleep",10+5*this.lastSlept]);
			
			//alliance
			if(this.ally_target){
				let ally_chance = 50 + this.peaceB/5 - this.aggroB/20
				if(ally_chance>100)
					ally_chance = 100
				if(ally_chance<10)
					ally_chance = 10
				options.push(["ally", ally_chance])
			}			
			//choose new action
			let action_option = roll(options);
			if(action_option == "follow"){
				this.setPlannedAction("follow" ,1, FollowAction, {'target':this.follow_target})
			}
			else if(action_option == "ally"){
				this.setPlannedAction("ally", 5, AllianceAction, {'target':this.ally_target})
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
				this.setPlannedAction("sleep", sleepLv, SleepAction)
			}
			else{
				this.setPlannedAction("move", 1, MoveAction)
			}
		}
		
		//apply effects		
		if(this.alliance)
			this.alliance.alliance_plan_action(this)
		this.apply_all_effects("planAction");
				
		log_message(this.name+" plans to "+ this.plannedAction, "planning", 5)
		
		//preparing to do action
		this.opponents = [];
		// this.last_opponent = "";
		this.followers = [];
		// this.lastAction = "";
		// this.lastActionState = "";
		//removing red fighting border
		this.div.removeClass("fighting");
		this.tblDiv.removeClass("fighting");
		this.tblDiv.removeClass("forage");
		this.tblDiv.removeClass("allyEvent");
		this.div.find('.charText').removeClass('sleep');
		this.tblDiv.removeClass('sleep');
		
				
		//set action
		if(!this.currentAction.name){
			if(this.plannedActionClass){
				this.currentAction = new this.plannedActionClass(this, this.plannedActionData)
			}
		}
		if(!this.currentAction.name){
			this.currentAction = new Action(this.plannedAction, this, 0, 0)
		}
	}
	
	//perform action
	//called by action in main
	doAction(){
		// this.finishedAction = false;
		//perform planned action
		if(this.health > 0 && !this.currentAction.turn_complete)
			this.apply_all_effects("doActionBefore",{'action':this.currentAction});
		
		if(this.health > 0 && !this.currentAction.turn_complete){
			//console.log(this.name + " " + this.plannedAction);
			this.currentAction.perform()
			this.currentAction.action_successful()
		}
		// this.apply_all_effects("doActionAfter",{'action':this.currentAction});
		// this.finishedAction = true;
		//toggle class for the last action
		/*
		if(this.lastAction == 'sleeping'){
			this.div.find('.charText').addClass('sleep');
			this.tblDiv.addClass('sleep');
		} else {
			this.div.find('.charText').removeClass('sleep');
			this.tblDiv.removeClass('sleep');
		}
		*/
	}
	
	turnEnd(){
		if(this.statusMessage==""){
			this.statusMessage = "does nothing"
		}
		if(this.currentAction.name)
			this.currentAction.turn_end()		
				
		if(!this.ignore_terrain && getTerrain(this.x,this.y)){
			getTerrain(this.x,this.y).turn_end_effects(this)
		}
		if(this.health > 0)
			this.apply_all_effects("turnEnd");		
	}
		
	//move towards target through regular means
	moveToTarget(actionTargetX, actionTargetY, moveDist=this.moveSpeed * this.moveSpeedB){
		// log_message(this.name+' moves')
		//Calculating distance from target
		let distX = actionTargetX - this.x;
		let distY = actionTargetY - this.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		let targetX = 0;
		let targetY = 0;
		// log_message(moveDist)
		//move towards target location
		if(dist <= moveDist){
			//target within reach
			targetX = actionTargetX;
			targetY = actionTargetY;
		} else {
			//target too far away
			let shiftX = distX / (dist/(moveDist));
			let shiftY = distY / (dist/(moveDist));
			//destination coords
			targetX = this.x + shiftX;
			targetY = this.y + shiftY;
			//console.log(getTerrainType(targetX,targetY));	
		
			//swim check
			if(!this.ignore_terrain && 
			getTerrainType(targetX,targetY) == "water" && 
			getTerrainType(this.x + shiftX * 2, this.y + shiftY * 2)  == "water" && 
			this.lastActionState != "swimming"){
				// carried away by water
				let swimChance = roll([["yes",1],["no",50]]);
				if(swimChance == "no"){
					var redirectTimes = 0;
					var redirectDir = roll([[-1,1],[1,1]]);
					var initialDir = Math.acos(shiftY/(moveDist));
					var tries = 314;
					do {
						redirectTimes++;
						let newDir = initialDir + redirectDir * redirectTimes * 0.05;
						shiftX = (moveDist) * Math.sin(newDir);
						shiftY = (moveDist) * Math.cos(newDir);
						targetX = this.x + shiftX;
						targetY = this.y + shiftY;
						tries--;
					} while (!this.ignore_terrain && getTerrainType(targetX,targetY) == "water" && tries > 0 && safeBoundsCheck(targetX,targetY));
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
	
	//check if player is supposed to die
	limitCheck(){
		if(this.weapon != ""){
			if(this.weapon.player != this){
				this.weapon = "";
			}
			if(this.weapon.uses<=0){
				this.weapon.destroy();
			}
		}
		if(this.offhand != ""){
			if(this.offhand.player != this){
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
			// this.death = this.name + " died of unknown causes";
			this.death = "Cast in the name of God, Ye Guilty";
		}
		$("#tbl_" + this.id).addClass("dead");
		$("#tbl_" + this.id).removeClass("alive");
		$("#char_" + this.id).addClass("dead");
		$("#tbl_" + this.id + " .status").text(/*"D" + day + " H" + hour + " " + */this.death);
		$('#table .container.alive').last().after($("#tbl_" + this.id));
		moralNum[this.moral]--;
		personalityNum[this.personality]--;
		this.dead = true;
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
					"<div class='kills'></div>"+ //kill counter
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
				"<div style='position:absolute; width:185px; height:100%; top:0; left:0; margin-left:50px;' onclick='toggle_show_info("+this.id+")'></div>"+	//clickable div
			"</div>");
			let tblDiv = $('#tbl_' + this.id);
			this.tblDiv = tblDiv;
		} 
		//charDiv.css('left',this.x / 1000 * .95 * $('#map').width() - iconSize/2);
		//charDiv.css('top',this.y / 1000 * .95 * $('#map').height() - iconSize/2);
		charDiv.css({transform:"translate(" + (this.x / mapSize * $('#map').width() - iconSize/2) + "px," + (this.y / mapSize *  $('#map').height() - iconSize/2) + "px)"},function(){
		});
	}
	
	change_img(new_img){
		this.img = new_img;
		this.div.css('background-image', 'url("'+new_img+'")');
		this.tblDiv.find('img').attr("src", new_img)
	}
	
	change_name(new_name){
		this.name = new_name;
		this.div.find('.charText').text(new_name)
		this.tblDiv.find('.info div:first-child b').text(new_name)
	}
	
	show_main_info(){
		//prepare clickable icons
		let terrain_icon = ""
		if(getTerrain(this.x, this.y)){
			terrain_icon = getTerrain(this.x, this.y).icon
		}		
		let weaponHtml="<span'>Weapon:None</span>";
		if(this.weapon){
			weaponHtml = "<span onClick='player_extra_info("+this.id+",\"wep\")'><u>Weapon</u>:"+this.weapon.icon+"</span>"
		}
		let offhandHtml="<span>Offhand:None</span>";
		if(this.offhand){
			offhandHtml = "<span onClick='player_extra_info("+this.id+",\"off\")'><u>Offhand</u>:"+this.offhand.icon+"</span>"
		}
		let statusHtml="None";
		let tP=this
		if(this.status_effects.length>0){
			statusHtml="";
			this.status_effects.forEach(function(eff, eff_id){
				statusHtml=statusHtml+"<span onClick='player_extra_info("+tP.id+",\"eff\","+eff_id+")'>"+eff.icon+"</span>"
			});
		}
		let attrHtml="";
		if(this.attributes.length>0){
			this.attributes.forEach(function(attr,attr_id){
				if(attr.display){
					// attrHtml=attrHtml+attr.name+",";
					if(attr.has_info){
						attrHtml=attrHtml+"<span onClick='player_extra_info("+tP.id+",\"attr\","+attr_id+")'><u>"+attr.display_name+"</u>,</span>"
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
		fightChance = Math.max(fightChance+this.aggroB, 1);
		peaceChance = Math.max(peaceChance+this.peaceB, 1);
		let opinion_txt = 'Opinions'
		if(this.rival)
			opinion_txt +='🥊'
		let alliance_html = "<span style='color:gray;'><u>Alliance</u></span>"
		if(this.alliance)
			alliance_html = "<span onclick='player_extra_info("+this.id+",\"alliance\")'><u>Alliance</u></span>"
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
						"<span>Fight Chance: "+roll_probs([['fight',fightChance],['peace',peaceChance]])[0][1]+"%</span><br>"+
						"<span>Intimidation: "+(this.intimidation)+"</span><br>"+
						"<span onclick='player_extra_info("+this.id+",\"more info\")'><u>More Info</u></span><br>"+
						
					"</div>"+
					"<div style='float:right;  width: 115px; position:absolute; right:0px;'>"+
						offhandHtml+"<br>"+
						"<span>Speed: "+roundDec(this.moveSpeed* this.moveSpeedB)+"</span><br>"+
						"<span>Move Bonus: x"+roundDec(this.moveSpeedB)+"</span><br>"+
						"<span>Fight Range: "+(this.fightRange+this.fightRangeB)+"</span><br>"+
						"<span>Vision: "+(this.sightRange+this.sightRangeB)+"</span><br>"+
						"<span>Visibility: "+(this.visibility+this.visibilityB)+"</span><br>"+
						"<span onclick='player_extra_info("+this.id+",\"opinions\")'><u>"+opinion_txt+"</u></span><br>"+
						alliance_html+"<br>"+
						
				"</div>"+
			"</div>"+
		"</div>"
		$('#char_info_container').html(char_info);
	}
	
	show_more_info(){
		let extra_info = 
		"<div class='info' style='font-size:12px'>"+
			"<b style='font-size:18px'>"+this.name+"</b><br>"+
			"<span>Kills: "+this.kills+"</span><br>"+
			"<span>Exp: "+roundDec(this.exp)+"</span><br>"+
			"<span>Exp Dmg: x"+roundDec(Math.pow(this.killExp,this.exp/100))+"</span><br>"+
			"<span>Last Fight: "+this.lastFight+"</span><br>"+
			"<span>Last Slept: "+this.lastSlept+"</span><br>"+
			"<span>Area Danger Levels: "+this.danger_score+"</span><br>"+
			"<span>Aware Of: "+this.awareOf.length+"</span><br>"+
			"<span>In Range: "+this.inRangeOf.length+"</span><br>"+
			"<span>Followers: "+this.followers.length+"</span><br>"+
			"<span>Attackers: "+this.opponents.length+"</span><br>"+
			"<span>Last Opponent: "+this.last_opponent.name +"</span><br>"
			
			// "<span>Attackable: "+this.attackable.length+"</span><br>"
		/*
		if(this.lastAction){
			extra_info +="<span>Last Action: "+this.lastActiont+"</span><br>"			
		}
		else
			extra_info +="<span>Last Action: None</span><br>"
		*/
		extra_info +="<span>Last Action: "+this.lastAction.name+"</span><br>"
		if(this.currentAction.name){
			extra_info += "<span>Current Action: "+this.currentAction.name + ' ('+ this.lastActionState +")</span><br>" +
			"<span>Turns Left: "+this.currentAction.turns +"</span><br>"
		}
		
		if(this.oobTurns>0)
			extra_info = extra_info +"<span>Out of Bounds: "+this.oobTurns+"</span><br>"
		if(this.unaware){
			extra_info= extra_info + "<span>Unaware</span><br>"
		}
		if(this.incapacitated){
			extra_info= extra_info + "<span>Incapacitated</span><br>"
		}

		extra_info += "</div>"
		$('#extra_info_container').html(extra_info);
	}
	
	show_opinions(){
		let extra_info = 
		"<div class='info' style='font-size:12px'>"+
			"<b style='font-size:18px'>"+this.name+"</b><br>"
			
		if(this.rival)
			extra_info += "<b style='font-size:14px'>Rival: "+this.rival.name+"</b><br>"
		else
			extra_info += "<span><b style='font-size:14px'>Rival:</b> None</span><br>"
		
		extra_info += "<div style='max-height:400px; overflow-y:auto;'>"+
			"<table style='font-size:12px; color:white;border-spacing: 0 2px;'>"		
		
		let tP = this;
		this.opinions.forEach(function(opinion, oPiD){		
			let oP = playerStatic[oPiD];
			if(oPiD != tP.id && !oP.dead){
				extra_info += "<tr class='"
				if(oP == tP.rival)
					extra_info += " rival";
				if(tP.opponents.indexOf(oP)>=0)
					extra_info += " fought"
				else if(tP.inRangeOfPlayer(oP))
					extra_info += " inRange"
				else if(tP.awareOfPlayer(oP))
					extra_info += " seen"
					
				if(tP.inAlliance(oP))
					extra_info += " ally"			
				
							
				extra_info += "'>"+			
				"<td style='margin-right:20px; width:100px; word-wrap:break-word; float:left;'>"+ playerStatic[oPiD].name + "</td>"+
				"<td style='float:right;'>"+ opinion + "</td>"+
				"</tr>"
			}
		});
		
		extra_info = extra_info + "</div></table></div>"
		$('#extra_info_container').html(extra_info);
	}
	
}
