class Action{
	constructor(name, player, turns=1, action_priority=0){
		this.name = name;
		this.player = player;	
		
		//turns the action will last for
		this.turns = turns;
		
		//if the action is finished for the turn
		this.turn_complete = false;	
		//if the action is completely finished
		this.complete = false;		
		
		//if the action turn can be interrupted by combat
		this.combat_interruptable = true;
		//if the action will be over after combat
		this.combat_cancellable = true;
		
		//if the action turn can be interrupted by entities
		this.entity_interruptable = true;
		//if the action will be over after entities
		this.entity_cancellable = true;
		
		
		//priority when planning
		//used for continuous actions
		this.action_priority = action_priority;	
		
		
		this.interrupted = false;
		
		this.energy_cost = 0;
	}	
	
	//prior to action planning
	turn_start(){
		this.turns-=1;
		if(this.turns<=0){
			this.complete = true;
		}
		else{
			this.player.action_priority = this.player.action_priority;
			this.turn_complete=false;			
		}
	}
	
	//performing action
	perform(){
		this.player.statusMessage = "performs a generic "+this.name+" action";
	}
	
	//after successfully performing action
	action_successful(){
		this.turn_complete=true;
		this.player.apply_all_effects("doActionAfter",{'action':this});
		this.player.energy -= this.energy_cost;
		// this.player.finishedAction = true;
	}
	
	//attacked
	attacked(oP, fightMsg=[]){
		if(this.combat_interruptable){
			if(!this.turn_complete){
				this.interrupted=true;
				this.turn_complete=true;
				// this.player.finishedAction = true;
				this.player.interrupted = true;
			}
		}
		if(this.combat_cancellable){
			this.complete = true;
		}
	}
	
	//attacked by entity
	entity_attacked(oD){
		if(this.entity_interruptable){
			if(!this.turn_complete){
				this.interrupted=true;
				this.turn_complete=true;
				// this.player.finishedAction = true;
				this.player.interrupted = true;
			}
		}
		if(this.entity_cancellable){
			this.complete = true;
		}
	}
	
	//end of turn
	turn_end(){}
}

class RestAction extends Action{
	constructor(player, data){
		super("rest", player)
	}
	perform(){
		this.player.lastActionState = "resting";
		this.player.energy += 40;
		this.player.health += 5;
		this.player.statusMessage = "rests";
	}	
}

class MoveAction extends Action{
	constructor(player, data){		
		super("move", player, 9999, 1)
		this.targetX=-1
		this.targetY=-1
		//get a coordinate to move to if not currently moving
		if('targetCoords' in data){
			this.targetX = data['targetCoords'][0];
			this.targetY = data['targetCoords'][1];
			return
		}
	}
	
	get_move_target(){
		let terrain_check = 'terrain'
		if(this.player.ignore_terrain)
			terrain_check = 'safe'
		let temp_target = getRandomCoords(terrain_check, 15)
		this.targetX = temp_target[0];
		this.targetY = temp_target[1];
	}
	
	turn_start(){
		this.action_priority = this.action_priority;
		this.turn_complete=false;
	}
	
	perform(){
		if(this.targetX==-1 || this.targetY==-1){
			this.get_move_target();
		}			
		
		let moveDist = this.player.moveSpeed * this.player.moveSpeedB
		moveDist = this.player.apply_all_calcs("moveDistCalc",moveDist,{'targetX':this.targetX, 'targetY':this.targetY})
		this.player.moveToTarget(this.targetX , this.targetY, moveDist);
		this.player.lastActionState = "moving";
		this.player.statusMessage = "on the move";
		// this.player.apply_all_effects("move");
	}
	
	turn_end(){
		//if arrived on target location
		if(this.targetX == this.player.x && this.targetY == this.player.y){
			this.complete = true;
			// log_message(this.name + " movement finished");
		}
		else{
			//randomly stop movement
			if(!this.player.ignore_terrain && safeTerrainCheck(this.x, this.y) && Math.random()<0.05){
				this.complete = true;
				// log_message(this.name + " movement finished early");
			}
			else{
				// log_message(this.name + " movement not finished");
			}
		}
	}
}

class FollowAction extends MoveAction{
	constructor(player, data){
		let target = data.target;
		super(player,{});
		this.name = "follow"
		this.turns = 1
		this.action_priority = 3
		this.target = target;
	}
	
	perform(){
		if(!this.target){
			this.player.statusMessage = "following their instincts"
			this.player.lastActionState = "following fail"
			return
		}
		this.targetX = this.target.x;
		this.targetY = this.target.y;
		super.perform()
		
		this.target.followers.push(this);
		this.player.statusMessage = "following " + this.target.name;
		this.player.lastActionState = "following"
	}
	
	turn_end(){
		//randomly continue following
		if(this.targetX != this.player.x || this.targetY != this.player.y){
			if(Math.random()<0.4)
				this.turns+=1;
			else
				this.complete = true;
			// log_message(this.name + " movement finished");
		}
		else{
			//randomly stop movement
			
		}
	}
}

class TerrainEscapeAction extends MoveAction{
	constructor(player, data){		
		super(player, data);
		this.name = "terrainEscape"
		this.turns = 1;
	}
	
	turn_end(){
		this.complete = true;
	}
	get_move_target(){
		let newX = mapSize/2;
		let newY = mapSize/2;
		let searches = 0
		do{
			newX = roll_range(0,mapSize)
			newY = roll_range(0,mapSize)
			searches++
		}while(!this.player.ignore_terrain && !safeTerrainCheck(newX, newY, 1) &&searches<10)
			
		if(searches>10){
			searches = 0
			do{
				newX = roll_range(0,mapSize)
			newY = roll_range(0,mapSize)
				searches++
			}while(!safeBoundsCheck(newX, newY) &&searches<10)
		}
		if(searches>10){
			newX = mapSize/2;
			newY = mapSize/2;
		}
		this.targetX = newX
		this.targetY = newY
	}
	
	perform(){		
		super.perform()
		this.player.statusMessage = "looks for safer ground";
		this.player.lastActionState = "terrain escape"
	}
}
var escape_searach_radius = 200
class PlayerEscapeAction extends MoveAction{
	constructor(player, data){		
		super(player, data);
		this.turns
		this.name = "playerEscape"
		this.turns = 1;
		this.escape_player = ""
	}
	get_move_target(){		
		//find player to escape from
		let nearby = this.player.nearbyPlayers(75);
		let highest_threat = 150;
		let escape_player = ""
		let tP = this.player;
		nearby.forEach(function(oP){
			let player_danger_score = get_player_danger_score(tP,oP)
			if(player_danger_score>highest_threat){
				highest_threat = player_danger_score;
				escape_player = oP;
			}
		});
		log_message(escape_player.name)
		//escape angle
		let dir_range = [0,359]
		if(escape_player){
			let player_dir = entityAngle(this.player, escape_player)
			log_message(player_dir+'player degrees')
			if(!isNaN(player_dir)){
				player_dir = player_dir + 180
				// log_message(player_dir+'escape degrees')
				dir_range = [player_dir-45, player_dir+45]
			}			
		}		
		let searches = 5
		let lowest_option = [500,500]
		let lowest_score = 50000		
		//choose 5 random locations
		//the lowest one will be chosen
		for(let i=0; i<searches; i++){
			let newDir = roll_range(dir_range[0],dir_range[1])
			log_message(newDir+'degrees')
			newDir = newDir * (Math.PI/180);
			let newDist = roll_range(50, escape_searach_radius)
			let newCoord = [this.player.x + newDist * Math.sin(newDir), this.player.y + newDist * Math.cos(newDir)]
			let score = this.player.get_danger_level(50, newCoord)
			if(score<lowest_score && safeBoundsCheck(newCoord[0],newCoord[1]))
				lowest_option = newCoord
		}
		log_message(lowest_option)
		this.targetX = lowest_option[0]
		this.targetY = lowest_option[1]
		this.escape_player = escape_player
	}
	
	turn_end(){
		this.complete = true;
	}
	
	perform(){		
		super.perform()
		if(this.escape_player){
			this.player.statusMessage = "runs away from "+this.escape_player.name;
			this.player.lastActionState = "player escape"
		}
		else{
			this.player.statusMessage = "tries to run away";
			this.player.lastActionState = "danger escape"			
		}

	}
}

class SleepAction extends Action{
	constructor(player, data){
		let min_duration = 5
		if('minDuration' in data)
			min_duration = data.minDuration
		let max_duration = 8
		if('maxDuration' in data)
			max_duration = data.maxDuration
		super("sleep", player, roll_range(min_duration,max_duration), 15)
		this.player.unaware=true;
		this.player.incapacitated=true;
	}
	turn_start(){
		super.turn_start()
		if(this.complete){
			this.player.div.find('.charText').removeClass('sleep');
			this.player.tblDiv.removeClass('sleep');
			return;			
		}
		this.player.unaware=true;
		this.player.incapacitated=true;
	}
	
	perform(){
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.player.health += Math.floor(Math.random() * 2);
		this.player.energy += Math.floor(Math.random() * 10);
		//wake up
		if(this.turns>1){
			// log_message(this.player.name + " continues sleeping");		
			this.player.statusMessage = "sleeping";
			this.player.div.find('.charText').addClass('sleep');
			this.player.tblDiv.addClass('sleep');
			this.player.lastActionState = "sleeping";
		} 
		else {
			log_message(this.player.name + " awakens");
			this.player.statusMessage = "woke up";
			this.player.div.find('.charText').removeClass('sleep');
			this.player.tblDiv.removeClass('sleep');
			this.player.lastActionState = "awaken";
		}
	}
}

class AllianceAction extends Action{
	constructor(player, data){		
		super("alliance", player);
		this.target = data.target;
	}
	
	perform(){
		this.player.tblDiv.addClass("allyEvent");
		log_message(this.player.name+' alliance ' + this.target.name)
		
		//no target planned
		if(!this.target){
			// this.player.lastAction = "alliance fail";
			this.player.statusMessage = "has no friends";
			this.player.lastActionState = "alliance null";			
			return;
		}
		
		//if target is already dead
		if(this.target.health<=0){
			this.player.statusMessage = "tries to befriend " + this.target.name + "'s corpse";
			this.player.lastActionState = "alliance dead";		
			return;
		}
		let decision = this.target.alliance_offer(this.player)
		if(decision){
			//accepted		
			if(this.player.alliance){
				//add into alliance
				this.player.alliance.add_member(this.target)
				this.player.statusMessage = "invites " + this.target.name+" into "+this.player.alliance.name;
				this.player.lastActionState = "alliance invitation success";		
			}
			else if(this.target.alliance){
				//join alliance
				this.target.alliance.add_member(this.player)
				this.player.statusMessage = "accepted into " + this.player.alliance.name +" by "+ this.target.name;
			this.player.lastActionState = "alliance join success";		
			}
			else{				
				//create alliance
				create_alliance(this.player, this.target)
				this.player.statusMessage = "starts "+this.player.alliance.name+" with " + this.target.name;
			this.player.lastActionState = "alliance creation success";		
			}
		}
		else{
			//rejected		
			if(this.player.inAlliance(this.target)){
				this.player.statusMessage = "teams up with " + this.target.name;	
				this.player.lastActionState = "alliance mutual";	
			}
			else if(this.player.alliance){
				//add into alliance
				this.player.statusMessage = "unable to get " + this.target.name + " to join "+this.player.alliance.name;
				this.player.lastActionState = "alliance invitation fail";	
			}
			else if(this.target.alliance){
				//join alliance
				this.player.statusMessage = "denied entry into " +this.target.alliance.name +" by "+ this.target.name;
				this.player.opinions[this.target.id] -= 25
				this.player.lastActionState = "alliance join fail";	
			}
			else{
				//create alliance
				this.player.statusMessage = "alliance offer to " + this.target.name + " rejected";
				this.player.opinions[this.target.id] -= 20
				this.player.lastActionState = "alliance creation fail";		
			}			
		}
		log_message(decision)
	}
}

class FightAction extends Action{
	constructor(player, data){
		super("fight", player);
		this.target = data.target;
	}
	
	perform(){
		//add red fighting border
		// this.player.div.addClass("fighting");
		
		//no target planned
		if(!this.target){
			// this.player.lastAction = "fighting fail";
			this.player.statusMessage = "fights their inner mind goblin";
			this.player.lastActionState = "fighting null";
			return;
		}
		if(this.player.inAlliance(this.target))
			this.player.alliance.unity -= 100;
		
		//if target is already dead
		if(this.target.health<=0){
			this.player.statusMessage = "attacks the corpse of " + this.target.name;
			this.player.lastActionState = "fighting dead";
			return;
		}
			
		//make sure target is still in range
		let dist = playerDist(this.player, this.target);
		if(this.player.fightRange + this.player.fightRangeB < dist){
			this.player.statusMessage = "tries to fight "+ this.target.name +" but they escape"
			this.player.lastActionState = "fighting range fail";
			return;
		}
				
		//calculate damage for both fighters
		// this.target.opponents.push(this);
		fight_target(this.player, this.target);
		this.player.lastActionState = "fighting";
		this.player.energy -= 20;
		/*
		if(this.energy < 0){
			this.death = "exhausted to death from fighting";
			this.die();
		}*/
		
	}
}

class ForageAction extends Action{
	constructor(player, data){
		super("forage", player, 2, 7);
		this.forage_state=''
		this.foraged_item=''
		this.success_prob=[["success",900],["fail",100],["poisoned",1],["aids",0]]
	}
	
	perform(){
		//lose energy and stamina
		this.player.energy -= 5;
		//if foraging just started
		if(this.turns==2){
			this.player.lastActionState = "foraging";
			this.player.statusMessage = "starts foraging";
		}
		//once foraging is done
		//foraging loot
		if(this.turns==1){
			switch(roll(this.success_prob)){
				//if foraging is successful
				case "success":
					this.player.statusMessage = "forage success";
					this.player.lastActionState = "forage success";
					this.forage_state='success'
					//randomly find a weapon
					let type_prob = [];
					if(!this.player.weapon)
						type_prob.push(["wep", wep_prob])
					if(!this.player.offhand)
						type_prob.push(["off", off_prob])
					let loot_type=roll(type_prob);
					this.foraged_item = get_random_item(this.player,loot_type)
					if(this.foraged_item){
						this.player.equip_item(this.foraged_item);
						this.player.tblDiv.addClass("forage");
						if(loot_type == 'wep'){
							this.player.lastActionState = "forage weapon";
							this.forage_state='wep'
						}
						if(loot_type == 'off'){
							this.player.lastActionState = "forage offhand";
							this.forage_state='off'
						}
					}
					//restore health and energy
					this.player.energy += roll_range(30,60)
					this.player.health += roll_range(5,10);
					break;
				//failed forage
				case "fail":
					this.forage_state='fail'
					this.player.lastActionState = "forage fail";
					this.player.statusMessage = "forage fail";
					break;
				//rip
				case "poisoned":
					this.player.health = 0;
					this.player.lastActionState = "forage death";
					// this.death = "death from poisoned berries";
					this.player.death = "poisoned by a poisy (poisonous flower)";
					break;
				//aids
				case "aids":
					this.player.lastActionState = "forage aids";
					this.player.statusMessage = "forages a dirty aids needle";
					let eff = this.player.get_status_effect("aids")
					if(!eff)
						this.player.inflict_status_effect(new AidsStatus(1, "", "parent"))
					else{
						eff.level++;
						eff.update_data();
					}
						
					break;
			}
			// this.player.apply_all_effects("forage");
		}	
	}
}