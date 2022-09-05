class Action{
	constructor(name, player, turns=1, action_priority=0){
		this.name = name;
		this.player = player;	
		
		//if the action is completely finished
		this.complete = false;
		
		//if the action can be interrupted by combat
		this.combat_interruptable = true;			
		
		//used for continuous actions
		//turns the action will last for
		this.turns = turns;
		//priority when planning
		this.action_priority = action_priority;		
		//if the action is finished for the turn
		this.turn_complete = false;
		//if the action will be over after combat
		this.combat_cancellable = true;
		
		this.interrupted = false;
	}	
	
	//prior to action planning
	turn_start(){		
		this.action_priority = this.action_priority;
		this.turn_complete=false;
	}
	
	//performing action
	perform(){
		this.player.statusMessage = "performs a generic "+this.name+" action";
	}
	
	//after successfully performing action
	action_successful(){
		this.turn_complete=true;
		this.player.lastAction = this;
		this.player.finishedAction = true;
	}
	
	//attacked
	attacked(oP){
		if(this.combat_interruptable){
			if(!this.turn_complete){
				this.interrupted=true;
				this.turn_complete=true;
				this.player.finishedAction = true;
				this.interrupted = true;
				this.player.interrupted = true;
			}
		}
		if(this.combat_cancellable){
			this.complete = true;
		}
	}
	
	//end of turn
	turn_end(){
		this.turns-=1;
		if(this.turns<=0){
			this.complete = true;
		}
	}	
}

class RestAction extends Action{
	constructor(player){
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
	constructor(player){		
		super("move", player, 9999, 1)
		//get a coordinate to move to if not currently moving
		
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
			log_message(this.player.name + " cant find safe location", 0);
			newX = mapSize/2
			newY = mapSize/2
		}
		
		//get a target location to move to
		this.targetX = newX;
		this.targetY = newY;
		// log_message(this.player.name +" plans to move to "+ newX +" " +newY);
		
	}
	turn_start(){
		this.action_priority = this.action_priority;
		this.turn_complete=false;
	}
	
	perform(){
		this.player.lastActionState = "moving";
		this.player.statusMessage = "on the move";		
		this.player.moveToTarget();
		this.player.apply_all_effects("move");
	}
	
	turn_end(){
		//if arrived on target location
		if(this.targetX == this.player.x && this.targetY == this.player.y){
			this.complete = true;
			// log_message(this.name + " movement finished");
		}
		else{
			//randomly stop movement
			if(safeTerrainCheck(this.x, this.y) && Math.random()<0.05){
				this.complete = true;
				// log_message(this.name + " movement finished early");
			}
			else{
				// log_message(this.name + " movement not finished");
			}
		}
	}
	
	/*
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
	*/
}

class FollowAction extends Action{
	constructor(player, target){		
		super("follow", player);
		this.target = target;
	}
	
	perform(){
		if(!this.target){
			this.player.statusMessage = "following their instincts"
			return
		}		
		let newX = 0;
		let newY = 0;
		newX = this.target.x;
		newY = this.target.y;

		this.player.statusMessage = "following " + this.target.name;
		this.target.followers.push(this);
		
		this.targetX = newX;
		this.targetY = newY;
		
		// this.plannedTarget.apply_all_effects("followTarget", {"opponent":this});
		this.player.apply_all_effects("follow", {"opponent":this.target});
		
		this.player.moveToTarget();
		this.player.lastActionState = "following"
	}
	/*
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
	*/
}

class SleepAction extends Action{
	constructor(player){		
		super("sleep", player, roll_range(5,8), 15)
		this.player.unaware=true;
		this.incapacitated=true;
	}
	turn_start(){
		super.turn_start()
		this.player.unaware=true;
		this.incapacitated=true;
		this.player.div.find('.charText').removeClass('sleep');
		this.player.tblDiv.removeClass('sleep');
	}
	
	perform(){
		this.player.unaware=true;
		this.incapacitated=true;
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
	
	/*
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
	*/
}

class AllianceAction extends Action{
	constructor(player, target){		
		super("alliance", player);
		this.target = target;
	}
	
	perform(){
		this.player.tblDiv.addClass("allyEvent");
		log_message(this.player.name+' alliance ' + this.target.name)
		
		//no target planned
		if(!this.target){
			this.player.lastAction = "alliance fail";
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
	/*
	
	//offer to join alliance
	action_alliance(){
		this.tblDiv.addClass("allyEvent");
		log_message(this.name+' alliance ' + this.plannedTarget.name)
		
		//no target planned
		if(!this.plannedTarget){
			this.lastAction = "alliance fail";
			this.statusMessage = "has no friends";
			this.resetPlannedAction();
			return;
		}
		
		//if target is already dead
		if(this.plannedTarget.health<=0){
			this.statusMessage = "tries to befriend " + this.plannedTarget.name + "'s corpse";
			this.resetPlannedAction();
			return;
		}
		let decision = this.plannedTarget.alliance_offer(this)
		if(decision){
			//accepted		
			if(this.alliance){
				//add into alliance
				this.alliance.add_member(this.plannedTarget)
				this.statusMessage = "invites " + this.plannedTarget.name+" into "+this.alliance.name;
			}
			else if(this.plannedTarget.alliance){
				//join alliance
				this.plannedTarget.alliance.add_member(this)
				this.statusMessage = "accepted into " + this.alliance.name +" by "+ this.plannedTarget.name;
			}
			else{				
				//create alliance
				create_alliance(this, this.plannedTarget)
				this.statusMessage = "starts "+this.alliance.name+" with " + this.plannedTarget.name;
			}
		}
		else{
			//rejected		
			if(this.inAlliance(this.plannedTarget)){
				this.statusMessage = "teams up with " + this.plannedTarget.name;
			}
			else if(this.alliance){
				//add into alliance
				this.statusMessage = "unable to get " + this.plannedTarget.name + " to join "+this.alliance.name;
			}
			else if(this.plannedTarget.alliance){
				//join alliance
				this.statusMessage = "denied entry into " +this.plannedTarget.alliance.name +" by "+ this.plannedTarget.name;
				this.opinions[this.plannedTarget.id] -= 25
			}
			else{
				//create alliance
				this.statusMessage = "alliance offer to " + this.plannedTarget.name + " rejected";
				this.opinions[this.plannedTarget.id] -= 20
			}			
		}
		log_message(decision)
		this.resetPlannedAction();	
	}
	*/
}

class FightAction extends Action{
	constructor(player, target){		
		super("fight", player);
		this.target = target;
	}
	
	perform(){
		//add red fighting border
		// this.player.div.addClass("fighting");
		
		//no target planned
		if(!this.target){
			this.player.lastAction = "fighting fail";
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
		if(this.fightRange + this.fightRangeB < dist){
			this.player.lastAction = "fighting fail";
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
	
/*
	action_fight(){
		//add red fighting border
		//this.div.addClass("fighting");
		
		//no target planned
		if(!this.plannedTarget){
			this.lastAction = "fighting fail";
			this.statusMessage = "fights their inner mind goblin";
			this.resetPlannedAction();
			return;
		}
		if(this.inAlliance(this.plannedTarget))
			this.alliance.unity -= 100;
		
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
		// this.plannedTarget.opponents.push(this);
		fight_target(this,this.plannedTarget);
		this.lastAction = "fighting";
		this.energy -= 20;
		/*
		if(this.energy < 0){
			this.death = "exhausted to death from fighting";
			this.die();
		}
		//clear target and actions
		this.plannedTarget = "";
		this.resetPlannedAction();
	}
*/	
}

class ForageAction extends Action{
	constructor(player){		
		super("forage", player, 2, 6);
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
			switch(roll([["success",900],["fail",100],["poisoned",1]])){
				//if foraging is successful
				case "success":
					this.player.statusMessage = "forage success";
					this.player.lastActionState = "forage success";
					//randomly find a weapon
					let type_prob = [];
					if(!this.player.weapon)
						type_prob.push(["wep", wep_prob])
					if(!this.player.offhand)
						type_prob.push(["off", off_prob])
					let loot_type=roll(type_prob);
					let loot = get_random_item(this.player,loot_type)
					if(loot){
						this.player.equip_item(loot);
						this.player.tblDiv.addClass("forage");
						if(loot_type == 'wep')
							this.player.lastActionState = "forage weapon";
						if(loot_type == 'off')
							this.player.lastActionState = "forage offhand";
					}
					//restore health and energy
					this.player.energy += roll_range(30,60)
					this.player.health += roll_range(5,10);
					
					break;
				//failed forage
				case "fail":
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
			}
			this.player.apply_all_effects("forage");
			//clear current action
		}	
	}
		
	/*
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
					let loot = get_random_item(this,loot_type)
					if(loot){
						this.equip_item(loot);
						this.tblDiv.addClass("forage");
						if(loot_type == 'wep')
							this.lastAction = "forage weapon";
						if(loot_type == 'off')
							this.lastAction = "forage offhand";
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
	*/
}