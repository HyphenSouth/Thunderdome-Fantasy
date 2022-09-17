class Action{
	constructor(name, player, turns=1, action_priority=0){
		this.name = name;
		this.player = player;	
		
		//if the action is completely finished
		this.complete = false;
		
		//if the action can be interrupted by combat
		this.combat_interruptable = true;
		
		//if the action is finished for the turn
		this.turn_complete = false;	
		
		//used for continuous actions
		//turns the action will last for
		this.turns = turns;
		//priority when planning
		this.action_priority = action_priority;	
		//if the action will be over after combat
		this.combat_cancellable = true;
		
		this.interrupted = false;
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
		// this.player.finishedAction = true;
	}
	
	//attacked
	attacked(oP){
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
		//get a coordinate to move to if not currently moving
		if('targetCoords' in data){
			this.targetX = data['targetCoords'][0];
			this.targetY = data['targetCoords'][1];
			return
		}
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
		this.player.moveToTarget(this.targetX , this.targetY);
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
			if(safeTerrainCheck(this.x, this.y) && Math.random()<0.05){
				this.complete = true;
				// log_message(this.name + " movement finished early");
			}
			else{
				// log_message(this.name + " movement not finished");
			}
		}
	}
}

class FollowAction extends Action{
	constructor(player, data){		
		super("follow", player);
		this.target = data.target;
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
		// this.player.apply_all_effects("follow", {"opponent":this.target});
		
		this.player.moveToTarget(this.targetX, this.targetY);
		this.player.lastActionState = "following"
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
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.player.div.find('.charText').removeClass('sleep');
		this.player.tblDiv.removeClass('sleep');
	}
	
	perform(){
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
}

class ForageAction extends Action{
	constructor(player, data){
		super("forage", player, 2, 6);
		this.forage_state=''
		this.foraged_item=''
		this.success_prob=[["success",900],["fail",100],["poisoned",1]]
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
			}
			// this.player.apply_all_effects("forage");
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