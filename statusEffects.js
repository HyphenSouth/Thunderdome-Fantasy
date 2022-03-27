class StatusEffect{
	constructor(name){
		this.name=name;
		this.icon="❓";
		this.player="";
		this.duration=1;
		this.level=0;
	}
	afflict(player){
		//if player already has the status
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
			case "turn start":
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
			case "plan action":
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
					console.log("charm follow")
					if(this.player.setPlannedAction("follow", 7)){
						log_message(this.player.name +" forced to follow " + this.target.name)
						this.player.plannedTarget = this.target;
					}
				}
			case "aggro check":
				if(this.aggro && oP==this.target){
					oP=data['opponent'];
					oP.aggroB +=200;
					oP.peaceB -= 200
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}





















