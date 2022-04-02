class StatusEffect{
	constructor(name){
		this.name=name;
		this.icon="❓";
		this.player="";
		this.duration=1;
		this.level=0;
	}
	afflict(player){
		this.player=player;		
	}
	calc_bonuses(){}
	stack_effect(new_eff){return true}
	
	wear_off(){
		this.player.remove_status_effect(this);
		log_message(this.player.name +"'s " + this.name+" wears off");
		this.player="";
	}

	effect(state, data={}){
		switch(state){			
			case "turnStart":
				this.duration-=1;
				if(this.duration <=0){
					this.wear_off();
				}
				break;
			case "death":
				break;
			case "attack":
				break;
		}
	}
	
}
//placeholder effect for testing purposes
class Placeholder extends StatusEffect{
	constructor(){
		super("placeholder");
		this.duration=1000;
		this.test_data="";
	}
	
	stack_effect(new_eff){
		if(new_eff.level>=this.level){
			//override
			//if(Math.random() < 0.05+(new_eff.level - this.level)*1){
				this.level = new_eff.level;
				this.test_data = new_eff.test_data;
				return true;
			//}
			//return false;
		}
		else{
			return false;
		}
	}	
}
function placeholder_effect(lv){
	let ph = new Placeholder();
	ph.level=lv;
	return ph;
}
ph1=placeholder_effect(1);
ph1.test_data="test1"
ph2=placeholder_effect(1);
ph2.test_data="test2"
ph3=placeholder_effect(3);
ph3.test_data="test3"


class Trapped extends StatusEffect{
	constructor(level, owner){
		super("trapped");
		this.icon="🕳"
		this.duration=20;
		this.turns_trapped=0;
	}
	
	afflict(player){
		super.afflict(player)
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.player.lastAction = "trapped";
		this.player.currentAction.name = "trapped";
	}
	
	//cannot be stacked
	stack_effect(new_eff){
		return false;
	}
	
	effect(state, data={}){
		let oP="";
		switch(state){
			case "turnStart":
				if(this.player.lastAction=="escaped"){
					this.wear_off();
				}
				else{
					this.player.lastAction="trapped";
					this.player.unaware = true;
					this.player.incapacitated = true;
					this.player.currentAction.name="trapped"
				}
				break;
			case "planAction":
				// if(this.player.lastAction="trapped"){
				log_message(this.player.name + " escape planning")
				this.player.setPlannedAction("escape", 10);
				this.player.awareOf=[];
				this.player.inRangeOf=[];
				// }
				break;
			case "escape":
				log_message(this.player.name + " escape attempt")
				this.player.currentAction.name="escape";
				if (roll_range(0,10) > 800){
					//escape successful
					log_message(this.player.name+" escapes");
					this.player.statusMessage = "escaped a trap";
					this.player.lastAction="escaped";
					this.player.resetPlannedAction();
					this.player.finishedAction = true;
					this.wear_off();
				}
				else{
					//escape failed
					this.player.energy -= 10;
					this.player.take_damage(Math.floor(Math.random() * 5), this, "none")
					// this.player.health -= Math.floor(Math.random() * 5);
					this.player.lastAction = "trapped";
					this.player.statusMessage = "tried to escape a trap";
					this.turns_trapped++;
					log_message(this.player.name + " fails to escape");
					if(this.player.health <= 0) 
						this.player.death = "died escaping a trap";		
					this.player.finishedAction = true;
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}


class Charm extends StatusEffect{
	constructor(target, level){
		super("charm");
		this.target=target;
		this.icon="💗";
		this.duration=1;
		this.aggro=false;	//whether target will be attacked
		this.level = level;
	}
	calc_bonuses(){
		this.player.dmgReductionB -=0.1;
	}
	stack_effect(eff){
		if(eff.level>=this.level){
			//if(Math.random() < 0.05+(eff.level - this.level)*0.1){
				this.target = eff.target;
				this.icon = eff.icon;
				this.duration = eff.duration;
				this.aggro=eff.false;	
				this.level = eff.level;
				log_message("replaced charm");
			//}
		}
		else{
			log_message("cannot override charm")
			return false;
		}
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "planAction":
				log_message(this.player.name + " charm planning");
				//force player to attack target
				if(this.aggro && this.player.inRangeOfPlayer(this.target)){
					if(this.player.setPlannedAction("fight", 7)){
						log_message(this.player.name +" forced to fight " + this.target.name)
						this.player.plannedTarget = this.target;
						this.target.setPlannedAction("attacked", 4);
					}
				}
				//force player to follow target
				else if(this.player.awareOfPlayer(this.target)){
					if(this.player.setPlannedAction("follow", 7)){
						log_message(this.player.name +" forced to follow " + this.target.name)
						this.player.plannedTarget = this.target;
					}
				}
				break;
			case "aggroCheck":
				oP=data['opponent'];
				log_message("charm aggro check");
				//if target is in range, force aggro onto them
				if(this.aggro && oP==this.target){
					log_message(this.player.name +" found target")
					this.player.aggroB +=200;
					this.player.peaceB -= 200
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}





















