function setEffIcon(icon){
	// return '<img class="item_img" src="' + icon +'"></img>';
	return '<img class="effect_img" src="'+icon+'"></img>';
}

class StatusEffect extends StatMod{
	constructor(name, level, duration, data={}){
		super(name)
		this.icon="❓";
		this.player="";
		this.level=level;
		this.duration=duration;
				
		//base amount, level amount
		this.data = data
		this.stack_type = '';
		this.lv_cap = 10;
		
		this.update_data()
	}
	
	update_data(){
		if("sightBonus" in this.data){this.sightBonus = this.data["sightBonus"][0]+ this.level * this.data["sightBonus"][1]}
		if("visibilityB" in this.data){this.visibilityB = this.data["visibilityB"][0]+ this.level * this.data["visibilityB"][1]}
		if("rangeBonus" in this.data){this.rangeBonus = this.data["rangeBonus"][0]+ this.level * this.data["rangeBonus"][1]}
		if("peaceBonus" in this.data){this.peaceBonus = this.data["peaceBonus"][0]+ this.level * this.data["peaceBonus"][1]}
		if("aggroBonus" in this.data){this.aggroBonus = this.data["aggroBonus"][0]+ this.level * this.data["aggroBonus"][1]}
		if("intimidationBonus" in this.data){this.intimidationBonus = this.data["intimidationBonus"][0]+ this.level * this.data["intimidationBonus"][1]}
		
		if("fightBonus" in this.data){this.fightBonus = this.data["fightBonus"][0]+ this.level * this.data["fightBonus"][1]}
		if("dmgReductionB" in this.data){this.dmgReductionB = this.data["dmgReductionB"][0]+ this.level * this.data["dmgReductionB"][1]}													   
		if("moveSpeedB" in this.data){this.moveSpeedB = this.data["moveSpeedB"][0]+ this.level * this.data["moveSpeedB"][1]}	
	}
	
	afflict(player){
		this.player=player;
	}
	
	stack_effect(eff){
		switch(this.stack_type){
			case 'lvl':
				this.level += Math.max(Math.round(eff.level/2), 1);
				this.level = Math.min(this.lv_cap, this.level);
				this.update_data();
				return true;
				break;
			case 'duration':
				this.duration += Math.max(Math.round(eff.duration/2), 1);
				return true;
				break;
			case 'unstackable':
				return false;
				break;
			case 'lvlreplace':
				if(eff.level >= this.level){
					this.replace_eff(eff)
					return true;
				}
				return false;
				break;
			default:
				case 'lvlduration':
					this.duration += Math.max(Math.round(eff.duration/2), 1);
					this.level += Math.max(Math.round(eff.level/2), 1);
					this.level = Math.min(this.lv_cap, this.level);
					this.update_data();
					return true;
					break;
		}
		
		return false;
	}
	
	replace_eff(new_eff){
		this.name=new_eff.name;
		this.display_name=new_eff.display_name;
		this.icon=new_eff.icon;
		this.duration=new_eff.duration;
		this.level=new_eff.level;		
		this.level = Math.min(this.lv_cap, this.level);
		this.data=new_eff.data;
		this.update_data()
	}
	
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
				if(this.duration <=0){
					this.wear_off();
				}
				this.duration-=1;
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
			this.stat_html()+
		"</div>"
		
		$('#extra_info_container').html(status_info);
	}
}

class Trapped extends StatusEffect{
	constructor(level, owner){
		super("trapped", level, 2000);
		this.icon="🕳"
		this.turns_trapped=0;
		this.owner=owner;
		this.death_msg = "died escaping "+ this.owner.name + "'s trap";	
	}
	
	afflict(player){	
		super.afflict(player)
		this.player.unaware=true;
		this.player.incapacitated=true;	
		// let player_action_complete = this.player.currentAction.turn_complete

		this.player.currentAction = new TrapEscapeAction(this.player, {'effect':this})
		this.player.currentAction.turn_complete = true
		this.player.div.find('.charName').addClass('trapped');
	}
	
	calc_dmg(){
		let dmg=Math.floor(Math.random() * 2 * this.level);
		if(this.player.energy==0)
			dmg = dmg + 3;
		log_message(dmg);
		return dmg
	}
	
	//cannot be stacked
	stack_effect(new_eff){
		return false;
	}
	
	/*
	escapeAction(){
		this.player.div.find('.charName').addClass('trapped');
		log_message(this.player.name + " escape attempt")
		this.player.currentAction.name="escape";
		if (roll_range(0,10) > 8){
			//escape successful
			log_message(this.player.name+" escapes");
			this.player.statusMessage = "escaped a trap";
			this.player.lastAction="escaped";
			this.player.resetPlannedAction();
			// this.player.finishedAction = true;
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
			// this.player.finishedAction = true;
		}
		
	}
	*/
	
	effect(state, data={}){
		let oP="";
		switch(state){
			/*
			case "turnStart":
				if(this.player.lastActionState=="escaped"){
					this.wear_off();
				}
				else{
					this.player.lastActionState="trapped";
					this.player.unaware = true;
					this.player.incapacitated = true;
					this.player.currentAction.name="escape"
				}
				break;
			*/
			case "planAction":
				// if(this.player.lastAction="trapped"){
				log_message(this.player.name + " escape planning")
				if(this.player.currentAction.name!='escape')
					this.player.setPlannedAction("escape", 22, TrapEscapeAction, {'effect':this});
				// this.player.setPlannedAction("escape", 22);
				// this.player.awareOf=[];
				// this.player.inRangeOf=[];
				// }
				break;
			/*
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
			*/
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
			this.stat_html()+
		"</div>"
		
		$('#extra_info_container').html(status_info);
	}
	
	stat_html(){
		let html = "<span><b>Turns Trapped:</b>"+this.turns_trapped+"</span><br>"
		if(this.player.energy==0){
			html = html+"<span><b>Dmg Range:</b>3"+"-"+(2 * this.level+3)+"</span><br>"
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

class TrapEscapeAction extends ImmobileAction{
	constructor(player, data){		
		super("trap escape", player, 999, 22, 'tried to escape a trap', 'trapped')
		this.effect = data.effect
	}
	
	perform(){
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.turns = 999
		this.player.div.find('.charName').addClass('trapped');
		log_message(this.player.name + " escape attempt")
		this.player.currentAction.name="escape";
		
		if (roll_range(0,10) > 8){
			//escape successful
			log_message(this.player.name+" escapes");
			this.player.statusMessage = "escaped a trap";
			this.player.lastActionState="escaped";
			// this.player.resetPlannedAction();
			// this.player.finishedAction = true;
			this.player.div.find('.charName').removeClass('trapped');
			this.effect.wear_off();
			this.turns=0
		}
		else{
			//escape failed
			this.player.energy -= 10;
			
			this.player.take_damage(this.effect.calc_dmg(), this.effect, "none")
			// this.player.health -= Math.floor(Math.random() * 5);
			this.player.lastActionState = "trapped";
			this.player.statusMessage = "tried to escape a trap";
			this.effect.turns_trapped++;
			log_message(this.player.name + " fails to escape");
			if(this.player.health <= 0){
				this.player.death = this.effect.death_msg;
				if(this.effect.owner)
					this.effect.owner.kills++;
			}
			// this.player.finishedAction = true;
		}
	}
}	

class Charm extends StatusEffect{
	constructor(target, level, aggro=false, duration=1){
		super("charm", level, duration);
		this.target=target;
		this.icon="💗";
		this.aggro=aggro;	//whether target will be attacked
		this.follow_message="";
		this.dmgReductionB = 1.1;
	}
	replace_eff(new_eff){
		this.aggro=new_eff.aggro;
		this.target=new_eff.target;
		this.follow_message=new_eff.follow_message;
	}
	stack_effect(new_eff){
		//replace charm with stronger charm
		if(new_eff.level>=this.level){
			if(Math.random() < 0.05+(new_eff.level - this.level)*0.1){
				this.replace_eff(new_eff);
				log_message("replaced charm");
			}
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
				if(this.aggro && this.player.inRangeOfPlayer(this.target) && this.level * 10 >roll_range(0,105)){
					log_message(this.player.name +" forced to fight " + this.target.name)
					this.player.setPlannedAction("fight", 11, FightAction, {'target':this.target});
					/*
					if(this.player.setPlannedAction("fight", 11)){
						log_message(this.player.name +" forced to fight " + this.target.name)
						this.player.plannedTarget = this.target;
					}
					*/
				}
				//force player to follow target
				else if(this.player.awareOfPlayer(this.target) && this.level * 9 >roll_range(0,100)){
					log_message(this.player.name +" forced to follow " + this.target.name)
					this.player.setPlannedAction("follow", 11, FollowAction, {'target':this.target});
					/*
					if(this.player.setPlannedAction("follow", 11)){
						log_message(this.player.name +" forced to follow " + this.target.name)
						this.player.plannedTarget = this.target;
					}
					*/
				}
				break;
			case "follow":
				oP=data['opponent'];
				//set custom follow message
				if(oP==this.target && this.follow_message != ""){
					this.player.statusMessage = this.follow_message;
				}
			/*
			case "aggroCheck":
				oP=data['opponent'];
				log_message("charm aggro check");
				//if target is in range, force aggro onto them
				if(this.aggro && oP==this.target){
					log_message(this.player.name +" found target")
					this.player.aggroB += this.level*10;
					this.player.peaceB -= this.level*10
				}
				break;
			*/
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
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

class Berserk extends StatusEffect{
	constructor(level, duration){
		super("berserk",level, duration, {'aggroBonus':[0,20]});
		this.icon="😡";
		this.moveSpeedB = 1.5
	}
	calc_bonuses(){
		// this.player.aggroB +=(this.level*40);
		// this.player.peaceB -=(this.level*40);
		// this.fightBonus = 1 + (this.level/50) + Math.min(this.player.lastFight/50, 0.5) ;
		this.fightBonus = 1 + (this.level/50) + (1-this.player.health/this.player.maxHealth) ;
		this.dmgReductionB = 1+(this.level/50);
		super.calc_bonuses()
	}

	effect(state, data={}){
		let oP="";
		switch(state){
			case "planAction":
			/*
				//fight last attacker
				if(this.player.attackers.length>0){
					let tP = this.player
					tP.attackers.forEach(function(oP){
						if(tP.inRangeOfPlayer(oP)){
							if(tP.setPlannedAction("fight", 12)){
								log_message(tP.name +" goes berserk " + oP.name)
								tP.plannedTarget = oP
							}
						}
						else if(tP.awareOf(oP)){
							if(tP.setPlannedAction("follow", 12)){
								log_message(tP.name +" angrily follows " + oP.name)
								tP.plannedTarget = oP
							}
						}
					});				
				}
				*/
				//forced attack
				if(this.player.inRangeOf.length>0){
					log_message(this.player.name +" angrily attacks " + this.player.inRangeOf[0].name)
					this.player.setPlannedAction("fight", 12,FightAction, {'target':this.player.inRangeOf[0]});					
					/*
					if(this.player.setPlannedAction("fight", 12)){
						// log_message(this.player.name +" angrily attacks " + this.player.inRangeOf[0].name)
						this.player.plannedTarget = this.player.inRangeOf[0]
					}
					*/
				}
				//forced follow
				else if(this.player.awareOf.length>0){
					log_message(this.player.name +" angrily follows " + this.player.awareOf[0].name)
					this.player.setPlannedAction("follow", 12, FollowAction, {'target':this.player.awareOf[0]});
					/*
					if(this.player.setPlannedAction("follow", 12)){
						// log_message(this.player.name +" angrily follows " + this.player.awareOf[0].name)
						this.player.plannedTarget = this.player.awareOf[0]
					}
					*/
				}
				break;
			/*
			case "attack":
				oP = data['opponent']
				if(oP == this.player.plannedTarget){
					this.player.fightDmgB *=1.05
				}
				break;
			*/
			default:
				super.effect(state, data);
				break;
		}
	}
}

//increase peace bonus
class Peace extends StatusEffect{
	constructor(level, duration){
		super("peace", level, duration, {'peaceBonus':[0,20],});
		this.icon="☮";
	}
	calc_bonuses(){
		// this.player.aggroB -=(this.level*40);
		// this.player.peaceB +=(this.level*50);
		this.dmgReductionB = 1- ((this.level/50) + Math.min(this.player.lastFight/50, 0.2));
		super.calc_bonuses()
	}
}

//peace with increased health regen
class Comfy extends Peace{
	constructor(level, duration){
		super(level, duration);
		this.name="comfy"
		this.display_name="Comfy"
		this.icon = setEffIcon('./icons/campfire.png');
		this.heal_range = [Math.round(this.level/2), this.level*2]
	}
	
	replace_eff(eff){
		super.replace_eff(eff)
		this.heal_range = eff.heal_range
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(this.player.lastSlept>12)
					this.player.setPlannedAction("sleep", 8,SleepAction, {'min_duration':6})
					// this.player.setPlannedAction("sleep", 8)				
				break;
			case "turnEnd":
				if(this.player.lastActionState=="rest"){
					this.player.health+=roll_range(this.heal_range[0]+1, this.heal_range[1]+2)
					this.player.energy+=roll_range(this.heal_range[0]+5, this.heal_range[1]*2+2)
					this.player.statusMessage="has a comfy rest"
				}
				else if(this.player.lastActionState=="sleeping"){
					this.player.health+=roll_range(this.heal_range[0]+3, this.heal_range[1]+4)
					this.player.energy+=roll_range(this.heal_range[0]+5, this.heal_range[1]*3+5)
					this.player.statusMessage="sleeps cozily"
				}
				else if(this.player.lastActionState!="fighting" || this.player.lastActionState!="attacked"){
					this.player.health+=roll_range(this.heal_range[0], this.heal_range[1])
					this.player.energy+=roll_range(this.heal_range[0], this.heal_range[1]*2)
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = 
			"<span><b>Heal Range:</b>"+this.heal_range[0]+"-"+this.heal_range[1]+"</span><br>"+
			super.stat_html();
		return html;
	}	
}

//follows and attacks decoy of the owner
class DecoyEffect extends StatusEffect{
	constructor(level, duration, owner, decoy){
		super("decoy_"+owner.name,level, duration);
		this.display_name = decoy.name
		this.icon="👻";
		this.decoy = decoy;
	}

	//cannot be stacked
	stack_effect(new_eff){
		this.duration = new_eff.duration;
	}
	
	effect(state, data={}){
		let decoy_dist = playerDist(this.player, this.decoy);
		switch(state){
			case "surroundingCheck":
				//add decoy to awareness list
				if(decoy_dist <= (this.player.sightRange + this.player.sightRangeB)){
					if(Math.random()<0.75){
						this.player.awareOf.push(this.decoy)
						if(decoy_dist <= (this.player.fightRange + this.player.fightRangeB) && Math.random()<0.5){
							this.player.inRangeOf.push(this.decoy)
							this.player.attackable.push(this.decoy)
							log_message(this.player.name+" replaced fight")
						}
						log_message(this.player.name+" replaced awareness")
					}
					//remove awareness for owner
					if(this.player.awareOfPlayer(this.owner)){
						this.player.awareOf = arrayRemove(this.player.awareOf, this.owner)
						this.player.inRangeOf = arrayRemove(this.player.inRangeOf, this.owner)
						this.player.attackable = arrayRemove(this.player.attackable, this.owner)
						log_message(this.player.name+" remove awareness")
					}
				}
				break;
			case "planAction":
				if(this.player.awareOfPlayer(this.decoy) && Math.random()<0.5){
					if(this.player.setPlannedAction("follow",4)){
						this.player.plannedTarget=this.decoy;
						log_message(this.player.name+" decoy follow")
					}
				}
				if(this.player.inRangeOfPlayer(this.decoy) && Math.random()<0.7){
					if(this.player.setPlannedAction("fight",7)){
						this.player.plannedTarget=this.decoy;
						log_message(this.player.name+" decoy attack")
					}					
				}
				break;
			case "doAction":
				if(this.player.plannedAction=="fight" && this.player.plannedTarget==this.decoy){
					// this.player.statusMessage = "attacks "+this.decoy.name;
					this.decoy.attacked(this.player)
					this.player.plannedTarget = "";
					this.player.resetPlannedAction();
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = 
			"<span><b>Decoy location:</b>("+ Math.round(this.decoy.x) + " , "+Math.round(this.decoy.y)+")</span><br>"+
			"<span><b>Decoy duration:</b>"+ this.decoy.duration +"</span><br>"
		return html;
	}	
}

class FrozenAction extends ImmobileAction{
	constructor(player, data){		
		super("frozen", player, data.effect.duration, 22, "frozen in ice", "frozen");
		this.effect = data.effect
	}

	perform(){
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.turns = this.effect.duration;
		// this.effect.frozenAction();
		
		if(this.turns<=0 || this.player.status_effects.indexOf(this.effect)<0){
			this.player.statusMessage = "thaws out";
			// this.player.finishedAction = true;	
			this.player.lastActionState ="thaw";
			if(!this.player.status_effects.indexOf(this.effect)<0)
				this.effect.wear_off();
		}
		else{
			//take damage
			this.player.take_damage(this.effect.calc_dmg(), this.effect, 'ice');
			if(this.player.health<=0){
				this.player.death = this.effect.death_msg
				if(this.effect.owner)
					this.effect.owner.kills++;
			}
			this.player.lastActionState ="frozen";
			this.player.statusMessage = "frozen in ice";
			// this.player.finishedAction = true;					
		}
		
	}
}

class Frozen extends StatusEffect{
	constructor(level, duration, owner){
		super("frozen",level, duration);
		this.icon="🧊";
		this.owner=owner;
		this.death_msg = 'froze to death'
		this.dmgReductionB = 0.5
	}
	
	afflict(player){
		super.afflict(player)
		this.player.unaware=true;
		this.player.incapacitated=true;	
		let player_action_complete = this.player.currentAction.turn_complete

		this.player.currentAction = new FrozenAction(this.player, {'effect':this})
		this.player.currentAction.turn_complete = player_action_complete
	}
	
	stack_effect(new_eff){
		this.duration += Math.round(new_eff.duration/2)
		this.level += Math.round(new_eff.level/2)
		return true;
	}
	
	calc_dmg(){
		return roll_range(0, 2 * this.level);
	}

	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.player.unaware = true;
				this.player.incapacitated = true;
				// this.player.currentAction.name="frozen"
				this.duration -= 1;
				break;
			case "planAction":
				if(this.player.currentAction.name!='frozen')
					this.player.setPlannedAction("frozen", 22, FrozenAction, {'effect':this});
				// this.player.awareOf=[];
				// this.player.inRangeOf=[];
				break;
				
			case "turnEnd":
				//campfire
				if(this.player.get_status_effect('comfy')){
					let comf = this.player.get_status_effect('comfy')
					this.duration -= Math.max(comf.level/2 - Math.round(this.level/4), 0)
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "newStatus":
				let eff = data["eff"]
				//burn reduces duration
				if(eff.name == "burn"){
					this.duration -= Math.max(eff.level - Math.round(this.level/2), 1)
					return false
				}
				break;
		}
		return x;
	}
	stat_html(){
		let html = "<span><b>Dmg Range:</b>0"+"-"+(2 * this.level)+"</span><br>"
		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}	
		html = html + super.stat_html();
		return html;
	}
}

class Skulled extends StatusEffect{
	constructor(duration){
		super("skulled",1,duration);
		this.icon = setEffIcon('./icons/skulled.png');
		this.visibilityB = 50;
		this.aggroBonus = 30;
		this.intimidationBonus = 50;
		this.dmgReductionB = 1.1;
	}
	stack_effect(new_eff){
		this.duration = new_eff.duration
	}
	
	effect(state, data={}){
		switch(state){
			case "lose":
				let oP = data['opponent']
				let tP = this.player
				if(tP.offhand && tP.offhand.stealable){
					let temp_off = tP.offhand
					tP.unequip_item("off");
					oP.equip_item(temp_off, 'value', -5)
				}
				if(tP.weapon && tP.weapon.stealable){
					let temp_wep = tP.weapon
					tP.unequip_item("wep");
					oP.equip_item(temp_wep, 'value', -5)
				}
				oP.health += 5;
				oP.energy += 20;
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}

//ignores terrain
//gives random dodge chance
class Flight extends StatusEffect{
	constructor(duration){
		super("flight", 1, duration);
		this.icon="🐦"
		this.moveSpeedB = 1.5;
		this.sightBonus = 24;
		this.rangeBonus = 24;
		//actions that allow flying
		this.flight_actions = [MoveAction, FightAction, AllianceAction]
		this.flight_time = 0; 
		this.dodge_chance = 40;
		this.fall_chance = 60;
		// this.attack_dodged = false;
	}
	afflict(player){
		this.player=player;
		this.player.ignore_terrain = true;
	}
	stack_effect(eff){
		this.duration += eff.duration
	}
	wear_off(){
		this.player.ignore_terrain = false;
		super.wear_off()
	}
	
	effect(state, data={}){
		let oP='';	
		switch(state){
			case "turnStart":
				super.effect("turnStart",data);
				this.flight_time++;
				break;
			case "fightStart":
				//random chance to dogdge
				if(roll_range(1,100)<=this.dodge_chance){
					log_message('dodge')
					this.player.defend_action = new FlightDodgeAttack(this.player, this);
				}
				break;
			case "defend":
				oP = data.opponent;
				let fightMsg = data.fightMsg;
				//knocked out
				if(roll_range(1,100)<=this.fall_chance){
					if(fightMsg.events)
						fightMsg.events.push(this.player.name + ' knocked out of the sky by '+oP.name)
					let fall_dmg = roll_range(10,50);
					// let fall_dmg =100;
					this.player.take_damage(fall_dmg, oP, 'fall')
					if(this.player.health<=0){
						if(fightMsg.events)
							fightMsg.events.push(this.player.name + ' breaks every bone in their body and dies a slow painful death')
						this.player.death = "falls to their death"
						oP.kills++;
					}
					else{
						if(fightMsg.events)
							fightMsg.events.push(this.player.name + ' hits the ground and takes '+fall_dmg+' damage')
					}
					this.player.fight_back = false;
					this.player.currentAction.turn_complete = true;
					this.wear_off()
				}
				else{
					if(fightMsg.events)
						fightMsg.events.push(this.player.name + ' lands')
					this.wear_off()
				}
				break;
			case "doActionBefore":
				//check if action disables flying
				let action = data.action
				let flight_continue = false;
				this.flight_actions.forEach(function(a){
					if(action instanceof a)
						flight_continue = true;
				});
				if(!flight_continue){
					this.wear_off();
				}
				break;
			case "doActionAfter":
				//change status text for movement
				switch(this.player.lastActionState){
					case "moving":
						this.player.statusMessage = "flies"
						if(this.new_flight)
							this.player.statusMessage = "takes flight"
						break;						
					case "following":
						this.player.statusMessage = "flies after " + data.action.target.name;
						if(this.new_flight)
							this.player.statusMessage = "takes flight after " + data.action.target.name;
						break;
					case "terrain escape":
					case "player escape":
						this.player.statusMessage = "flies to safety"
						if(this.new_flight)
							this.player.statusMessage = "takes flight to safety"
						break;
				}
				break;
			// case "fightEnd":
				// oP = data.opponent;
				// if(this.attack_dodged)
					// this.player.statusMessage = "flies out of the way of "+oP.name+" attack";
				// this.attack_dodged = false;
				// this.player.fight_back = true;
				// break;
			default:
				super.effect(state, data)
				break;
		}
	}
	
	stat_html(){
		let html= super.stat_html() +
		"<span class='desc'>"+
			"<span>They fly now</span><br>"+
		"</span>"		
		return html;
	}
}

class FlightDodgeAttack extends CombatAction{
	constructor(player, attr){
		super("flight dodge", player, false, 6);
		this.player = player;
		this.attr = attr;
		this.dodged_atk = '';
	}
	
	get_priority_score(action){
		if(action)
			this.dodged_atk = action;
		return this.priority;
	}
	
	execution_fail(action, attacker, defender, counter, fightMsg){
		if(fightMsg.events)
			fightMsg.events.push(this.player.name + ' unable to dodge ' + attacker.name + "'s " + action.display_name);
	}
	
	fight_target(attacker, defender, counter, fightMsg){
		let dash_target = getRandomCoords('terrain')
		this.player.moveToTarget(dash_target[0] , dash_target[1]);
		if(fightMsg.events){
			if(this.dodged_atk)
				fightMsg.events.push(defender.name + ' flies out of the way of ' + attacker.name + "'s " + this.dodged_atk.display_name);	
			else
				fightMsg.events.push(this.player.name + ' flies out of the way of '+attacker.name + "'s attack");
		}	
		attacker.statusMessage = "tries to attack "+defender.name + " but misses";
		if(this.dodged_atk)
			defender.statusMessage = "dodges " + attacker.name + "'s " + this.dodged_atk.display_name
		else
			defender.statusMessage = "dodges "+attacker.name+" attack";
		
		// defender.fight_back = false;
		defender.attack_action = "none";
		defender.currentAction.turn_complete = true;
	}
}

class AidsStatus extends StatusEffect{
	constructor(level, source="", patient_zero=""){
		super("aids", level, 9999, {'dmgReductionB':[1,0.02]});
		this.icon = "🎗️";
		this.source = source;
		this.patient_zero = patient_zero;
		if(patient_zero=="parent")
			this.patient_zero = this;
		this.infections = 0;
		this.original_max_health = 0;
		this.infected_time = 0;
	}
	afflict(player){
		this.player=player;
		this.original_max_health = player.maxHealth;
		if(this.source)
			this.source.infections++;
		if(this.patient_zero && this.patient_zero!=this)
			this.patient_zero.infections++;
	}
	
	stack_effect(eff){
		if(eff.level > this.level){
			this.level++;
			this.update_data();
		}		
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.infected_time++;
				if(this.level>5){
					if(roll_range(0,this.level+10)>14){
						this.player.health-=roll_range(1,this.level/2)
						if(this.player.maxHealth>5 && roll_range(0,this.level+100)>104){
							this.player.maxHealth-=1;
						}
						if(this.player.health<=0){
							this.player.death = "died of aids"
						}
					}
				}
				if(this.level<8){
					if(this.infected_time%40==0){
						this.level++;
						this.update_data();
					}
				}
				else{
					if(this.infected_time%60==0){
						this.level++;
						this.update_data();
					}
				}				
				break;
			case "defend":
				if(!data.opponent.get_status_effect("aids"))
					data.opponent.inflict_status_effect(new AidsStatus(1, this, this.patient_zero))
				else
					data.opponent.inflict_status_effect(new AidsStatus(this.level, this, this.patient_zero))
				break;
		}
	}
	
	show_info(){
		let status_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Infection Duration:</b>"+this.infected_time+"</span><br>"+
			"<span><b>Level:</b>"+this.level+"</span><br>"+
			this.stat_html()+
		"</div>"
		
		$('#extra_info_container').html(status_info);
	}
	
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Infections:</b>"+this.infections+"</span><br>"			
		if(this.source)
			html+="<span><b>Infected by:</b>"+this.source.player.name+"</span><br>"
		if(this.patient_zero && this.patient_zero!=this){
			html+="<span><b>Patient Zero:</b>"+this.patient_zero.player.name+"</span><br>"
		}
		return html;
	}
}

class Chopped extends StatusEffect{
	constructor(limb='random'){
		super("chopped", 1, 9999);
		this.limbs = {
			'left arm':{'health':100,'chopped': false},
			'right arm':{'health':100,'chopped': false},
			'left leg':{'health':100,'chopped': false},
			'right leg':{'health':100,'chopped': false}
		}
		this.limb_names = ['left arm','right arm','left leg','right leg']
		
		if(!(limb in this.limbs)){
			limb = roll([['left arm',1],['right arm',1],['left leg',1],['right leg',1]]);
		}
		this.next_limb = limb;
		this.icon = "🔪";
		this.arms_chopped = 0;
		this.legs_chopped = 0;
	}
	
	afflict(player){
		this.player=player;
		this.chop(this.next_limb)
		this.next_limb = '';
	}
	
	chop(limb){
		if(!this.limbs[limb].chopped){
			if(limb == 'left arm' || limb == 'right arm'){
				this.arms_chopped++;
			}
			else if(limb == 'left leg' || limb == 'right leg'){
				this.legs_chopped++;
			}
		}
		this.limbs[limb].health = 0;
		this.limbs[limb].chopped = true;
		this.update_chop_effects();
		
		this.last_chopped = 0;		
	}
	/*
		1 arm: 
			x0.6 dmg
			no offhand
		2 arms: 
			x0.4 dmg
			x1.2 dmg taken
			-15 range
			no items
		1 leg:
			x0.6 move speed
		2 legs:
			x0.4 move speed	
			
		1 arm 2 legs: 
			x0.6 dmg
			no offhand
			x0.3 move speed
		2 arms 1 leg: 
			x0.3 dmg
			x0.6 move speed
			-15 range
			x1.3 dmg taken
			no items
		2 arms 2 legs: 
			x0.1 dmg
			x0.1 move speed
			x1.4 dmg taken
			-20 range
			no items
	*/
	update_chop_effects(){
		if(this.arms_chopped==2 && this.legs_chopped==2){
			this.fightBonus = 0.1;
			this.moveSpeedB = 0.1;
			this.dmgReductionB = 1.4;
			this.rangeBonus = -20;
		}
		else if(this.arms_chopped==1 && this.legs_chopped==2){
			this.fightBonus = 0.6;
			this.moveSpeedB = 0.3;
			this.dmgReductionB = 1.1;		
		}
		else if(this.arms_chopped==2 && this.legs_chopped==1){
			this.fightBonus = 0.3;
			this.moveSpeedB = 0.6;
			this.dmgReductionB = 1.3;
			this.rangeBonus = -15;			
		}
		else if(this.arms_chopped==2){
			this.fightBonus = 0.4;
			this.dmgReductionB = 1.2;
			this.rangeBonus = -15;		
		}
		else if(this.legs_chopped==2){
			this.moveSpeedB = 0.4;		
		}
		else if(this.arms_chopped==1){
			this.fightBonus = 0.6;			
		}
		else if(this.legs_chopped==1){
			this.fightBonus = 0.6;			
		}
		
		if(this.arms_chopped>0){
			if(this.player.offhand)
				this.player.unequip_item("off")
		}
		if(this.arms_chopped>1){
			if(this.player.weapon)
				this.player.unequip_item("wep")
		}		
	}
	
	stack_effect(eff){
		this.chop(eff.next_limb);
	}
	effect(state, data={}){
		let tP = this.player;
		switch(state){
			case "turnStart":
				if(this.arms_chopped>0){
					if(this.player.offhand)
						this.player.unequip_item("off")
				}
				if(this.arms_chopped>1){
					if(this.player.weapon)
						this.player.unequip_item("wep")
				}	
				let limbs = this.limbs;
				let healed = true;
				let tE = this;
				this.limb_names.forEach(function(limb){
					if(limbs[limb].chopped){
						limbs[limb].health+=roll_range(2,6);
						if(tP.lastActionState == 'sleeping' || tP.lastActionState == 'resting'){
							limbs[limb].health+=3;
						}					
						if(limbs[limb].health>=100){
							limbs[limb].health=100;
							limbs[limb].chopped=false;
							if(limb == 'left arm' || limb == 'right arm'){
								tE.arms_chopped--;
							}
							else if(limb == 'left leg' || limb == 'right leg'){
								tE.legs_chopped--;
							}
							tE.update_chop_effects();
						}
						else{
							healed = false;
						}
					}
				});
				if(healed)
					this.wear_off();
				break;
			case "win":
				if(this.arms_chopped>0){
					if(this.player.offhand)
						this.player.unequip_item("off")
				}
				if(this.arms_chopped>1){
					if(this.player.weapon)
						this.player.unequip_item("wep")
				}
				break;
			case "doActionAfter":
				//remove equipment
				if(this.arms_chopped>0){
					if(this.player.offhand)
						this.player.unequip_item("off")
				}
				if(this.arms_chopped>1){
					if(this.player.weapon)
						this.player.unequip_item("wep")
				}
				if(this.player.get_status_effect('flight'))
					return;
				if(this.legs_chopped<1)
					return;
				switch(this.player.lastActionState){
					//change movement text
					case "moving":
						if(this.legs_chopped==1){
							this.player.statusMessage = "hops"
						}
						else if(this.legs_chopped==2){
							if(this.arms_chopped==2){
								this.player.statusMessage = "flops on the ground";
							}
							else{
								this.player.statusMessage = "crawls on the ground";								
							}
						}
						break;						
					case "following":
						if(this.legs_chopped==1){
							this.player.statusMessage = "hops after " + data.action.target.name;
						}
						else if(this.legs_chopped==2){
							if(this.arms_chopped==2){
								this.player.statusMessage = "flops towards "  + data.action.target.name;;
							}
							else{
								this.player.statusMessage = "crawls towards " + data.action.target.name;;								
							}
						}
						break;
					case "terrain escape":
					case "player escape":
						if(this.legs_chopped==1){
							this.player.statusMessage = "hops to safety";
						}
						else if(this.legs_chopped==2){
							if(this.arms_chopped==2){
								this.player.statusMessage = "tries to flop to safety";
							}
							else{
								this.player.statusMessage = "crawls to safety";								
							}
						}
						break;
				}				
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = ""
		let limbs = this.limbs;
		this.limb_names.forEach(function(limb){
			if(limbs[limb].chopped){
				let n = limb;
				n = n.charAt(0).toUpperCase() + n.slice(1)
				html += "<span><b>"+ n + ":</b>"+ limbs[limb].health +"%</span><br>"
			}
		});
		html = html + super.stat_html();
		return html;
	}
}

class RetardationEffect extends StatusEffect{}

//class for dot effects
class DotEffect extends StatusEffect{
	constructor(name, level, duration, owner, dmg_type, death_msg, data){
		super(name, level, duration, data);
		this.owner=owner;
		this.dmg_type = dmg_type
		this.death_msg = death_msg
		this.dmg_turn = "turnStart"
		this.dmg_range = [1,1]
	}
	calc_dmg(){
		return roll_range(this.dmg_range[0], (this.level/2)+this.dmg_range[1]);
	}
		
	effect(state, data={}){
		switch(state){
			case this.dmg_turn:
				// deal damage
				let dmg = this.calc_dmg();
				this.player.take_damage(dmg, this, this.dmg_type);
				if(this.player.health<=0){
					this.player.death = this.death_msg
					if(this.owner)
						this.owner.kills++;					
				}
				super.effect(state, data);
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = "";		
		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}
		// html += "<span><b>Dmg Range:</b>"+(this.dmg_range[0])+"-"+((this.level/2)+this.dmg_range[1])+"</span><br>";
		html = html + super.stat_html()
		return html;
	}
}

class Burn extends DotEffect{
	constructor(level, duration, owner){
		super("burn", level, duration, owner, "fire", "burnt to a crisp");
		this.icon="🔥";
		this.dmg_range = [1,1.5] //base damage range at level 1
		this.visibilityB = 20;
	}
	
	calc_dmg(){
		return roll_range(this.dmg_range[0], this.level*this.dmg_range[1]);
	}

	stack_effect(eff){
		//replace weaker burn
		if(eff.level >= this.level){
			this.replace_eff(eff)
			this.owner = eff.owner;
			this.death_msg = eff.death_msg;
			// this.duration = eff.duration 
			// this.level = eff.level 
			// this.owner = eff.owner
		}
		//increase burn
		if(eff.level < this.level){
			this.duration = this.duration + Math.round(eff.duration*(eff.level/this.level)) ;
			this.level = this.level + Math.round(eff.level*0.25);
		}
	}
	effect(state, data={}){
		switch(state){
			case "turnEnd":
				if(getTerrainType(this.player.x,this.player.y)=="water"){
					this.wear_off();
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}

	effect_calc(state, x, data={}){
		switch(state){
			case "newStatus":
				let eff = data["eff"]
				//burn reduces duration
				if(eff.name == "frozen"){
					this.duration -= Math.max(eff.level - Math.round(this.level/3), 1)
					return false;
				}
				break;
		}
		return x;
	}
	
	stat_html(){
		let html = "<span><b>Dmg Range:</b>"+(this.dmg_range[0])+"-"+(this.dmg_range[1]*this.level)+"</span><br>"
		html = html+super.stat_html()
		return html;
	}
}

//reduced stats and dot
class Smoke extends DotEffect{
	constructor(level, duration, owner){
		super("smoke", level, duration, owner, "poison", "choked to death",  {'sightBonus' : [-10,-20],'fightBonus' : [1,-0.05],'moveSpeedB' : [1,-0.05]});
		this.icon="🚬";
		this.dmg_range = [2,2] //base damage range at level 1

	}
	calc_dmg(){
		return roll_range(this.dmg_range[0], (this.level/2)+this.dmg_range[1]);
	}
		
	stack_effect(eff){
		//replace weaker eff
		if(eff.level >= this.level){
			this.replace_eff(eff);
			this.duration = eff.duration; 
			this.level = eff.level;
			this.owner = eff.owner;
			this.death_msg = eff.death_msg;
		}
		//increase dot
		if(eff.level < this.level){
			this.duration = this.duration + Math.round(eff.duration*(eff.level/this.level)) ;
			this.level = this.level + Math.round(eff.level*0.2);
		}
		this.update_data();
	}

	stat_html(){
		let html = 
			"<span><b>Dmg Range:</b>"+(this.dmg_range[0])+"-"+((this.level/2)+this.dmg_range[1])+"</span><br>"
		html = html+super.stat_html()
		return html;
	}
}

//endless dot until successful save
//gets stronger as bleed stacks
class Bleed extends DotEffect{
	constructor(level, owner){
		super("bleed", level, 9999,owner, "none", "bleeds to death");
		this.icon="🩸";
		this.turns = 0;
		this.max_dmg = 5
	}
	
	calc_dmg(){
		return roll_range(1, Math.round(this.max_dmg));
	}
	
	stack_effect(eff){
		this.max_dmg = this.max_dmg + eff.level
		this.level += eff.level;
		if(eff.level >= this.level){
			this.owner = eff.owner;
			this.death_msg = eff.death_msg;
		}
	}
	
	effect(state, data={}){
		switch(state){
			case 'turnStart':
				// deal damage
				if(roll_range(0,100) < this.level * 1.5 + 70){
					let dmg = this.calc_dmg();
					this.player.take_damage(dmg, this, this.dmg_type);
					this.turns++;
					if(this.player.health<=0){
						this.player.death = this.death_msg
						if(this.owner)
							this.owner.kills++;	
					}
					this.max_dmg*=1.2;
				}
				else{
					this.wear_off();
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
			this.stat_html()+
		"</div>"
		$('#extra_info_container').html(status_info);
	}
	
	stat_html(){
		let html = "<span><b>Max Dmg:</b>"+ Math.round(this.max_dmg)+"</span><br>" + 
		"<span>Bleeding for "+this.turns+" turns</span><br>"
		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}	
		return html;
	}	
}
class Poison extends DotEffect{
	constructor(level, duration, owner){
		super("poison", level, duration, owner, "poison", "poisoned to death");
		this.icon="☣️";
		this.max_dmg = this.level*this.duration+2;
	}
	
	calc_dmg(){
		return roll_range(0, this.max_dmg);
	}
	
	stack_effect(eff){
		if(eff.level > this.level){
			this.owner = eff.owner;
			this.level += Math.round(eff.level/2);
			this.max_dmg += eff.level/2;
			this.duration += eff.duration;
			this.death_msg = eff.death_msg;
		}
		else if(eff.level < this.level){
			this.duration += Math.round(eff.duration/4);			
		}
		else{
			this.max_dmg += eff.level/3;
			this.duration += Math.round(eff.duration/4);
		}
	}
	effect(state, data={}){
		switch(state){
			case 'turnStart':
				this.max_dmg = Math.max(2, this.max_dmg-0.5)
				super.effect(state, data);
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = 
			"<span><b>Dmg Range:</b>0-"+roundDec(this.max_dmg)+"</span><br>";
		html = html + super.stat_html();
		return html;
	}
}

class Clamped extends StatusEffect{
	constructor(level, duration, owner){
		super("clamp", level, duration);
		this.icon="🗜"
		this.moveSpeedB=0;
		this.owner=owner;
	}
	
	effect(state, data={}){
		let oP="";
		switch(state){
			case "endMove":
				this.player.statusMessage = "clamped down";
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html= super.stat_html() +
		"<span class='desc'>"+
			"<span>CLAMPED</span><br>"+
		"</span>"		
		return html;
	}
}
