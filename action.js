class Action{
	constructor(name, player, turns=0, action_priority=1){
		this.name = name;
		this.player = player;	
		
		//if the action is completely finished
		this.complete = false;		
		//if the action can be interrupted by combat
		this.combat_interruptable = true;	
		
		
		//used for continuous actions
		this.turns = turns;
		this.action_priority = action_priority;		
		//if the action is finished for the turn
		this.turn_complete = false;		
		//if the action will be over after combat
		this.combat_cancellable = true;
	}	
	
	//prior to action planning
	turn_start(){
		this.turns-=1;
		this.action_priority = this.action_priority;
		this.turn_complete=false;
	}
	
	//performing action
	perform(){
		this.player.statusMessage = "performs a generic action";
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
				this.player.finishedAction
			}
		}
		if(this.combat_cancellable){
			this.complete = true;
			this.player.resetPlannedAction();			
		}
	}
	
	//end of turn
	turn_end(){
		if(this.turns<=0){
			this.complete = true;
			this.player.resetPlannedAction();
		}
	}	
}

class RestAction extends Action{
	constructor(player){
		super("rest", player)
	}
	perform(){
		this.player.energy += 40;
		this.player.health += 5;
		this.player.statusMessage = "rests";
	}
	
}

class MoveAction extends Action{
	constructor(player){		
		super("moving", player, 9999, 1)
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
		this.player.statusMessage = "on the move";		
		this.player.moveToTarget();
		this.player.apply_all_effects("move");
	}
	
	turn_end(){
		//if arrived on target location
		if(this.targetX == this.player.x && this.targetY == this.player.y){
			this.complete = true;
			this.player.resetPlannedAction();
			// log_message(this.name + " movement finished");
		}
		else{
			//randomly stop movement
			if(safeTerrainCheck(this.x, this.y) && Math.random()<0.05){
				this.complete = true;
				this.player.resetPlannedAction();
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
		super("following", player)
		this.target = target
	}
	
	perform(){
		let newX = 0;
		let newY = 0;
		newX = this.target.x;
		newY = this.target.y;

		this.player.statusMessage = "following " + this.plannedTarget.name;
		this.target.followers.push(this);
		
		this.targetX = newX;
		this.targetY = newY;
		
		// this.plannedTarget.apply_all_effects("followTarget", {"opponent":this});
		this.player.apply_all_effects("follow", {"opponent":this.target});
		
		this.player.moveToTarget();
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
		super("sleeping", player, roll_range(5,8), 15)
		this.player.unaware=true;
		this.incapacitated=true;
		this.player.div.find('.charText').addClass('sleep');
		this.player.tblDiv.addClass('sleep');
	}
	turn_start(){
		super.turn_start()
		this.player.unaware=true;
		this.incapacitated=true;
	}
	
	perform(){
		this.player.unaware=true;
		this.incapacitated=true;
		this.player.health += Math.floor(Math.random() * 2);
		this.player.energy += Math.floor(Math.random() * 10);
		//wake up
		if(this.turns>0){
			// log_message(this.player.name + " continues sleeping");		
			this.player.statusMessage = "sleeping";
		} 
		else {
			log_message(this.player.name + " awakens");
			this.player.statusMessage = "woke up";
			this.player.div.find('.charText').removeClass('sleep');
			this.player.tblDiv.removeClass('sleep');
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