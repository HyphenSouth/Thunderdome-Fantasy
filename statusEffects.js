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
		if(eff.level >= this.level){
			this.replace_eff(eff)
		}
	}
	
	replace_eff(new_eff){
		this.name=new_eff.name;
		this.display_name=new_eff.display_name;
		this.icon=new_eff.icon;
		this.duration=new_eff.duration;
		this.level=new_eff.level;
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

class Charm extends StatusEffect{
	constructor(target, level){
		super("charm", level, 1);
		this.target=target;
		this.icon="💗";
		this.aggro=false;	//whether target will be attacked
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
					if(this.player.setPlannedAction("fight", 11)){
						log_message(this.player.name +" forced to fight " + this.target.name)
						this.player.plannedTarget = this.target;
					}
				}
				//force player to follow target
				else if(this.player.awareOfPlayer(this.target) && this.level * 9 >roll_range(0,100)){
					if(this.player.setPlannedAction("follow", 11)){
						log_message(this.player.name +" forced to follow " + this.target.name)
						this.player.plannedTarget = this.target;
					}
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
		this.fightBonus = 1 + (this.level/50) + (this.player.lastFight/50) ;
		this.dmgReductionB = 1+(this.level/50) + (this.player.lastFight/50);
		super.calc_bonuses()		
		// this.player.moveSpeedB *= this.speed_bonus;
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
				
				if(this.player.inRangeOf.length>0){
					if(this.player.setPlannedAction("fight", 12)){
						log_message(this.player.name +" angrily attacks " + this.player.inRangeOf[0].name)
						this.player.plannedTarget = this.player.inRangeOf[0]
					}
				}
				else if(this.player.awareOf.length>0){
					if(this.player.setPlannedAction("follow", 12)){
						log_message(this.player.name +" angrily follows " + this.player.awareOf[0].name)
						this.player.plannedTarget = this.player.awareOf[0]
					}
				}
				break;
			case "attack":
				oP = data['opponent']
				if(oP == this.player.plannedTarget){
					this.player.fightDmgB *=1.05
				}
				break;
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
		this.dmgReductionB = 1-((this.player.lastFight/10+this.level)/50);
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
				if(this.player.lastSlept>12){
					this.player.setPlannedAction("sleep", 8)
				}
				break;
			case "turnEnd":
				if(this.player.lastAction=="rest"){
					this.player.health+=roll_range(this.heal_range[0]+1, this.heal_range[1]+2)
					this.player.energy+=roll_range(this.heal_range[0]+5, this.heal_range[1]*2+2)
					this.player.statusMessage="has a comfy rest"
				}
				else if(this.player.lastAction=="sleeping"){
					this.player.health+=roll_range(this.heal_range[0]+3, this.heal_range[1]+4)
					this.player.energy+=roll_range(this.heal_range[0]+5, this.heal_range[1]*3+5)
					this.player.statusMessage="sleeps cozily"
				}
				else if(this.player.lastAction!="fighting"){
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
	}
	
	stack_effect(new_eff){
		this.duration += Math.round(new_eff.duration/2)
		this.level += Math.round(new_eff.level/2)
		return true;
	}

	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.player.lastAction="frozen";
				this.player.unaware = true;
				this.player.incapacitated = true;
				this.player.currentAction.name="frozen"
				this.duration -= 1;
				break;
			case "planAction":
				this.player.setPlannedAction("frozen", 22);
				this.player.awareOf=[];
				this.player.inRangeOf=[];
				break;
			case "frozen":
				if(this.duration<=0){
					this.player.statusMessage = "thaws out";
					this.player.resetPlannedAction();
					this.player.finishedAction = true;		
					this.wear_off();
				}
				else{
					//take damage
					this.player.take_damage(roll_range(0, 2 * this.level), this, 'ice');
					if(this.player.health<=0){
						this.player.death = this.death_msg
						if(this.owner)
							this.owner.kills++;
					}
					this.player.statusMessage = "frozen in ice";
					this.player.resetPlannedAction();
					this.player.finishedAction = true;					
				}				
				break;
			case "newStatus":
				let eff = data["eff"]
				//burn reduces duration
				if(eff.name == "burn"){
					this.duration -= Math.max(eff.level - Math.round(this.level/2), 1)
					this.player.remove_status_effect(eff);
				}
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
				if(tP.offhand){
					let temp_off = tP.offhand
					tP.unequip_item("off");
					oP.equip_item(temp_off)
				}
				if(tP.weapon){
					let temp_wep = tP.weapon
					tP.unequip_item("wep");
					oP.equip_item(temp_wep)
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

//class for dot effects
class DotEffect extends StatusEffect{
	constructor(name, level, duration, owner, dmg_type, death_msg, data){
		super(name, level, duration, data);
		this.owner=owner;
		this.dmg_type = dmg_type
		this.death_msg = death_msg
		this.dmg_turn = "turnStart"
	}
	calc_dmg(){
		return 1;
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
		html = html + super.stat_html()
		return html;
	}
}

class Burn extends DotEffect{
	constructor(level, duration, owner){
		super("burn", level, duration, owner, "fire", "burnt to a crisp");
		this.icon="🔥";
		this.dmg_range = [1,1.5] //base damage range at level 1
		this.visibilityB =10;
	}
	
	calc_dmg(){
		return roll_range(this.dmg_range[0], this.level*this.dmg_range[1]);
	}

	stack_effect(eff){
		//replace weaker burn
		if(eff.level >= this.level){
			this.replace_eff(eff)
			this.duration = eff.duration 
			this.level = eff.level 
			this.owner = eff.owner
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
			case "newStatus":
				let eff = data["eff"]
				//burn reduces duration
				if(eff.name == "frozen"){
					this.duration -= Math.max(eff.level - Math.round(this.level/3), 1)
					this.player.remove_status_effect(eff);
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
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
		super("smoke", level, duration, owner, "poison", "choked to death",  {'sightBonus' : [-10,-20],'fightBonus' : [1,-0.1],'moveSpeedB' : [1,-0.1]});
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
		this.dmg_range = [2,5]
	}
	
	calc_dmg(){
		return roll_range(this.dmg_range[0], this.dmg_range[1]);
	}
	
	stack_effect(eff){
		this.dmg_range[1] = this.dmg_range[1] + eff.level
		this.level += eff.level;
		if(eff.level >= this.level){
			this.owner = eff.owner;
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
					this.dmg_range[1]*=1.5;
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
		let html = "<span><b>Dmg Range:</b>"+this.dmg_range[0] + "-" + this.dmg_range[1]+"</span><br>" + 
		"<span>Bleeding for "+this.turns+" turns</span><br>"
		if(this.owner instanceof Char){
			html = html + "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		}	
		return html;
	}	
}
class Poison extends DotEffect{
	
}











