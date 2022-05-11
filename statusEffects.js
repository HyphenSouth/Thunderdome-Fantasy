class StatusEffect{
	constructor(name){
		this.name=name;
		this.display_name=this.name[0].toUpperCase() + this.name.substring(1);
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
		if(extra_info_obj==this){
			deselect_extra_info()
		}
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
	
	show_info(){
		let status_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Duration:</b>"+this.duration+"</span><br>"+
			"<span><b>Level:</b>"+this.level+"</span><br>"+
			this.effect_html()+
		"</div>"
		
		$('#extra_info_container').html(status_info);
	}
	effect_html(){
		return "";
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
	
	level_up(){
		let temp_status = new RePlaceholder(1)
		temp_status.test_data='replace'
		this.player.inflict_status_effect(temp_status)
		this.wear_off()
	}	
}
class RePlaceholder extends StatusEffect{
	constructor(){
		super("replaceholder");
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
re1= new RePlaceholder(1)
re1.test_data='replace'

class Trapped extends StatusEffect{
	constructor(level, owner){
		super("trapped");
		this.icon="🕳"
		this.duration=20;
		this.turns_trapped=0;
		this.owner=owner;
		this.level = level;
		this.death_msg = "died escaping "+ this.owner.name + "'s trap";	
	}
	
	afflict(player){
		super.afflict(player)
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.player.lastAction = "trapped";
		this.player.currentAction.name = "trapped";
		this.player.div.find('.charName').addClass('trapped');
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
					this.player.currentAction.name="escape"
				}
				break;
			case "planAction":
				// if(this.player.lastAction="trapped"){
				log_message(this.player.name + " escape planning")
				this.player.setPlannedAction("escape", 22);
				this.player.awareOf=[];
				this.player.inRangeOf=[];
				// }
				break;
			case "escape":
				this.player.div.find('.charName').addClass('trapped');
				log_message(this.player.name + " escape attempt")
				this.player.currentAction.name="escape";
				if (roll_range(0,10) > 8){
					//escape successful
					log_message(this.player.name+" escapes");
					this.player.statusMessage = "escaped a trap";
					this.player.lastAction="escaped";
					this.player.resetPlannedAction();
					this.player.finishedAction = true;
					this.player.div.find('.charName').removeClass('trapped');
					this.wear_off();
				}
				else{
					//escape failed
					this.player.energy -= 10;
					let dmg=Math.floor(Math.random() * 2 * this.level);
					if(this.player.energy==0){
						dmg = dmg + 3;
					}
					log_message(dmg);
					this.player.take_damage(dmg, this, "none")
					// this.player.health -= Math.floor(Math.random() * 5);
					this.player.lastAction = "trapped";
					this.player.statusMessage = "tried to escape a trap";
					this.turns_trapped++;
					log_message(this.player.name + " fails to escape");
					if(this.player.health <= 0){
						this.player.death = this.death_msg;	
						this.owner.kills++;
					}
					this.player.finishedAction = true;
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	show_info(){
		let status_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Level:</b>"+this.level+"</span><br>"+
			this.effect_html()+
		"</div>"
		
		$('#extra_info_container').html(status_info);
	}
	
	effect_html(){
		let html = "<span><b>Turns Trapped:</b>"+this.turns_trapped+"</span><br>"
		if(this.player.energy==0){
			html = html+"<span><b>Dmg Range:</b>0"+"-"+(2 * this.level+3)+"</span><br>"
		}
		else{
			html = html+"<span><b>Dmg Range:</b>0"+"-"+(2 * this.level)+"</span><br>"
		}
	

		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}	
		return html;
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
		this.player.dmgReductionB *=1.1;
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
					if(this.player.setPlannedAction("fight", 11)){
						log_message(this.player.name +" forced to fight " + this.target.name)
						this.player.plannedTarget = this.target;
						this.target.attackers.push(this);
					}
				}
				//force player to follow target
				else if(this.player.awareOfPlayer(this.target)){
					if(this.player.setPlannedAction("follow", 11)){
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
	effect_html(){
		let html = "<span><b>Target:</b>"+this.target.name+"</span><br>"
		if(this.aggro){
			html = html + "<span>Aggressive</span><br>"+
			"<span class='desc'>"+
				"<span>Forced to follow and attack target</span><br>"+	
			"</span>"
		}
		else{
			html = html+"<span class='desc'>"+
				"<span>Forced to follow target</span><br>"+	
			"</span>"
		}		
		return html;
	}	
}

class Burn extends StatusEffect{
	constructor(level, duration, owner){
		super("burn");
		this.owner=owner;
		this.icon="🔥";
		this.duration=duration;
		this.level = level;
		this.dmg_range = [1,1.5]
		this.death_msg = "burnt to a crisp"
	}
	calc_bonuses(){
		this.player.visibility +=10;
	}
	stack_effect(eff){
		//replace weaker burn
		if(eff.level >= this.level){
			this.duration = eff.duration 
			this.level = eff.level 
			this.owner = eff.owner
		}
		//increase burn
		if(eff.level < this.level){
			this.duration = this.duration + Math.round(eff.duration*(eff.level/this.level)) ;
			this.level = this.level + Math.round(eff.level*0.5);
		}
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			/*
			case "turnStart":
				// deal damage
				let dmg = this.level * 5
				this.player.take_damage(dmg, this.owner, "fire");
				if(this.player.health<=0){
					this.player.death = this.death_msg
					if(this.owner)
						this.owner.kills++;					
				}
				super.effect("turnStart");
				break;			
			*/
			case "turnEnd":
				// deal damage
				let dmg = roll_range(this.dmg_range[0], this.level*this.dmg_range[1])
				this.player.take_damage(dmg, this, "fire");
				if(this.player.health<=0){
					this.player.death = this.death_msg
					if(this.owner)
						this.owner.kills++;					
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	effect_html(){
		let html = "<span><b>Dmg Range:</b>"+(this.dmg_range[0])+"-"+(this.dmg_range[1]*this.level)+"</span><br>"
		
		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}	
		return html;
	}	
}
test_burn = new Burn(1,200, '')













