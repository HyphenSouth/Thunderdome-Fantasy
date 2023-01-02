var controlledPlayers = [];
var controlledPlayerStatic = [];
var maxControl = 1;
var choiceDelay = 1000;
function create_choices(player, choices){
	
}
class ControlledChar extends Char{
	constructor(name,img,x,y, moral, personal){
		super(name,img,x,y, moral, personal)
		this.controlled = true;
		this.controlID = controlledPlayers.length;
		
		this.turn_alerts = [];
		this.alerts = [];
		
		this.action_options = [];
		
		this.autoplay = false;
	}
		
	async userChoice(choices){
		log_message(this.name + ' choice')
		let tP=this;
		return new Promise((resolve,reject)=>{
			console.log('set up logic to display buttons');
			setTimeout(function(){
				console.log('simulating delay in button click');
				console.log('combat decision logic');
				resolve(choices[0]);
			},choiceDelay);
		});
	}
	
	turnStart(){
		this.turn_alerts = [];
		this.action_options = [];
		
		super.turnStart()
		let tP = this
		players.forEach(function(oP){
			if(tP.awareOfPlayer(oP)){
				oP.div.css({'display':"flex"})
			}
			else{
				oP.div.css({'display':"none"})
			}
		});
		this.div.css({'display':"flex"})
	}
	
	//plan the next action
	/*
	calculate bonuses
	apply inventory effects
	choose an action
	*/
	//decide what action to take for the next turn
	planAction(){
		// super.planAction();
		// return;
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
		if(this.autoplay){
			super.planAction();
			return;
		}
				
		if(this.energy<=0){
			// this.setPlannedAction("rest", 20);
			this.setPlannedAction('rest', 20, RestAction);
			log_message('rest')
		}
		//force movement to center
		if(!safeBoundsCheck(this.x, this.y)){
			this.oobTurns = this.oobTurns+1;
		}
		else{
			this.oobTurns=0;
		}		
		
		//continue with current action if there is one
		if(this.currentAction.name){
			log_message(this.name + " continues with " + this.currentAction.name+" "+this.actionPriority, 0);
			this.plannedAction = this.currentAction.name;
		}
				
		//apply effects		
		if(this.alliance)
			this.alliance.alliance_plan_action(this)
		this.apply_all_effects("planAction");
				
		log_message(this.name+" plans to "+ this.plannedAction, "planning", 5)
		this.action_options = ['move', 'sleep']
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
		
	}
	
	async doAction(){
		if(this.autoplay){
			let choice=''
			if(this.actionPriority<11)
				choice = await this.userChoice(this.action_options)
			log_message('chosen '+choice)
			if(!this.currentAction.name){
				if(this.plannedActionClass){
					this.currentAction = new this.plannedActionClass(this, this.plannedActionData)
				}
			}
		}
		super.doAction();
		return new Promise((resolve,reject)=>{resolve('benin');});
	}
	
	die(){
		super.die();
		controlledPlayers = arrayRemove(controlledPlayers,this);
	}
}