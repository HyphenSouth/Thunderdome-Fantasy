var off_prob = 2;
var defaultOffhandOdds = [["bomb",5],["trap",10],["shield",10],["recoil", 15],["food",250],["vape",0],["campfire",15],["mirror",40],["Nothing",200]];
function get_offhand_odds(tP){
	let offhandOdds = defaultOffhandOdds.slice();
	if(!doll)
		offhandOdds.push(["doll",5]);
	offhandOdds = tP.apply_all_calcs('itemOdds', offhandOdds, {'item_type':'off'})
	return offhandOdds;
}

class Offhand extends Item{
	constructor(name){
		super(name);
		//when to use item
		this.useStates = [];

		if(name in offhand_data){
			let data = offhand_data[name];
			
			if("icon" in data){
				if(data.icon_type=="img"){
					this.icon = setItemIcon(data["icon"]);
				}
				else{
					this.icon=data["icon"];
				}
			}
			if("sightBonus" in data){this.sightBonus = processDataNum(data["sightBonus"])}
			if("visibilityB" in data){this.visibilityB = processDataNum(data["visibilityB"])}
			
			if("rangeBonus" in data){this.rangeBonus = processDataNum(data["rangeBonus"])}
			if("fightBonus" in data){this.fightBonus = processDataNum(data["fightBonus"])}
			if("dmgReductionB" in data){this.dmgReductionB = processDataNum(data["dmgReductionB"])}
			
			if("peaceBonus" in data){this.peaceBonus = processDataNum(data["peaceBonus"])}
			if("aggroBonus" in data){this.aggroBonus = processDataNum(data["aggroBonus"])}
			
			if("moveSpeedB" in data){this.moveSpeedB = processDataNum(data["moveSpeedB"])}
			
			if("uses" in data){this.uses = processDataNum(data["uses"])}
			if("useStates" in data){this.useStates = data["useStates"]}
		}		
	}
	
	replace_offhand(new_item){
		this.player.offhand=new_item;
		new_item.equip(this.player);
		this.player=""
		return true;
	}
	unequip(){
		this.destroy();
		return true;
	}

	/*
	Effects on wielder:
		planning
		moving
		foraging
		sleeping
		escaping
		defend
		take damage
		death
	*/
	/*
	Effects on others:
		in range
		aware
		attack
		deal damage
		win
		lose
	*/		
	effect(state, data={}){
		if(this.useStates.includes(state)){
			log_message(this.player.name +" uses "+this.name)
			this.use();
		}
		let oP="";
		switch(state){			
			case "turnStart":
				break;
			case "death":
				break;

		}
	}
    destroy(){
		log_message(this.player.name +"'s " + this.name+" breaks");
		this.player.offhand = "";   
		super.destroy();
	}
	
}

class Bomb extends Offhand {
	constructor() {
		super("bomb");
	}	
	use(){
		let tempBomb = new BombEntity(this.player.x, this.player.y, this.player);
		tempBomb.draw();
		doodads.push(tempBomb);
		this.destroy()
		// this.player.offhand="";
		// this.player="";
	}
	
	effect(state, data={}){
		let oP="";
		let tempBomb="";
		switch(state){
			//drop bomb
			case "defend":
				if(Math.random()<0.1){
					oP=data["opponent"];
					pushMessage(this.player, this.player.name + "'s bomb is knocked out of their hands by "+oP.name);
					tempBomb = new BombEntity(this.player.x, this.player.y,this.player);
					tempBomb.duration=1;
					tempBomb.draw();
					doodads.push(tempBomb);
					this.player.offhand="";
					this.player="";
				}				
				break;
			case "endMove":
				if(roll([['use',10],['notuse',100]]) == 'use'){
					log_message(this.player.name + " plants a bomb");
					pushMessage(this.player, this.player.name + " plants a bomb")
					this.use();
				}
				break;
			case "death":
				//drop bomb on death
				pushMessage(this.player, this.player.name + " drops their bomb as they die");
				tempBomb = new BombEntity(this.player.x, this.player.y,this.player);
				tempBomb.draw();
				tempBomb.trigger("");
				doodads.push(tempBomb);
				this.player.offhand="";				
				this.player="";			
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}

class Trap extends Offhand {
	constructor() {
		super("trap");
	}
	use(){
		let tempTrap = new TrapEntity(this.player.x, this.player.y,this.player);
		tempTrap.draw();
		doodads.push(tempTrap);
		// this.player.offhand="";
		// this.player="";
		this.destroy();
	}
	effect(state, data={}){
		let oP="";
		switch(state){		
			case "endMove":
				if(roll([['use',10],['notuse',100]]) == 'use'){
					log_message(this.player.name + " sets a trap");
					pushMessage(this.player, this.player.name + " sets a trap")
					this.use();
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}

class Recoil extends Offhand{
	constructor() {
		super("recoil");
		this.display_name = "Ring of Recoil"
	}
	
	effect(state, data={}){
		switch(state){
			case "takeDmg":
				let oP=data["source"];
				let dmg = data["damage"];
				if(oP instanceof Char){
					let recoil_dmg = dmg*0.25;
					if(recoil_dmg>oP.health){
						recoil_dmg = oP.health;
					}
					if(recoil_dmg>this.uses){
						recoil_dmg=this.uses;
					}
					oP.take_damage(recoil_dmg, this, "recoil")
					data.fightMsg.events.push(oP.name + " takes "+roundDec(recoil_dmg)+ " recoil damage from " + this.player.name);
					log_message(this.player.name + " recoil on " + oP.name + " "+ recoil_dmg);
					if(oP.health<=0){
						oP.death = "killed by recoil damage from " + this.player.name;
						// pushMessage(oP, oP.name + " killed by recoil damage from " + this.player.name);
						this.player.kills++;
					}
					this.uses = this.uses - recoil_dmg;
					if(this.uses<=0)
						this.destroy();
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}

	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"	+
			"<span><b>Uses:</b>"+roundDec(this.uses)+"hp</span><br>"+
			"<span><b>Dmg Reduction:</b>x"+this.dmgReductionB+"</span><br>"+
			
			"<span class='desc'>"+
				"<span>Reflects some damage back onto attacker</span>"+
			"</span>"+	
		"</div>"
		$('#extra_info_container').html(item_info);
	}	
}

class Vape extends Offhand{
	constructor() {
		super("vape");
		this.vape_radius = 24;
	}
	
	effect(state, data={}){
		switch(state){
			case "playerEscape":
				if(decoy_count<max_decoys){
					this.player.statusMessage="vapes and escapes"
					let tempDecoy = new DecoyEntity(this.player.x, this.player.y, this.player)
					tempDecoy.name = this.player.name+"'s vape illusion";
					tempDecoy.attack_func = function(attacker, tD){
						if(Math.random()<2){
							attacker.statusMessage = "destroys "+ tD.name;
							tD.icon = "☁️";
							tD.active=false
							// let choke_eff = new Buff("vaped", 2, 8, {"fightBonus":[1,-0.1],"moveSpeedB":[1,-0.1]},false, tD.player)
							let choke_eff = new Smoke(2, 4, this.player)
							choke_eff.icon = "☁️";
							choke_eff.display_name = "Vaped"
							attacker.inflict_status_effect(choke_eff)
							players.forEach(function(oP,index){
								let dist = hypD(oP.x - tD.x,oP.y - tD.y);
								if(dist <= 50 && oP.health>0 && oP!=attacker && oP!=tD.owner){
									// let choke_eff = new Buff("vaped", 1, 5, {"fightBonus":[1,-0.1],"moveSpeedB":[1,-0.1]},false, tD.player)
									let choke_eff = new Smoke(1, 3, tD.player)
									choke_eff.icon = "☁️";
									choke_eff.display_name = "Vaped"
									oP.inflict_status_effect(choke_eff)
								}
							});
						}
						else{
							attacker.statusMessage = "attacks "+ tD.name;
						}
					}
					tempDecoy.draw();
					doodads.push(tempDecoy);
					this.use()			
				}
				break;
			case "turnEnd":
				//apply peace effect to nearby players
				let nearby_lst = this.player.nearbyPlayers(this.vape_radius);
				nearby_lst.forEach(function(oP,index){
					let tempEff = new Peace(2, 2);
					oP.inflict_status_effect(tempEff);
				});
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}
	
class Campfire extends Offhand{
	constructor() {
		super("campfire");
	}
	use(){
		let tempCamp = new CampfireEntity(this.player.x, this.player.y,this.player);
		tempCamp.duration = roll_range(8,12);
		tempCamp.draw();
		doodads.push(tempCamp);
		this.destroy();
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "endMove":
				if(getTerrain(this.player.x, this.player.y).danger==0 &&(hour >= 20 || hour < 5)){
					if(roll([['use',1],['notuse',2]]) == 'use'){
						pushMessage(this.player, this.player.name + " sets a campfire")
						this.use();
					}	
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}
class Mirror extends Offhand{
	constructor() {
		super("mirror");
		this.display_name = "Scrying Mirror"
		//tele target
		this.target=""
		this.broken=false;
	}
	
	effect(state, data={}){
		switch(state){
			case "defend":
				if(this.broken == false && Math.random()<0.8){
					let oP=data["opponent"];
					pushMessage(this.player, oP.name + " breaks "+this.player.name+"'s scrying mirror");
					this.icon = setItemIcon("./icons/mirror_broken1.png");
					let tempMirror = new MirrorEntity(this.player.x, this.player.y,this.player);
					tempMirror.draw();
					doodads.push(tempMirror);
				}				
				break;
			case "planAction":
				//oob
				if(!safeBoundsCheck(this.player.x, this.player.y) && this.player.plannedAction=="move"){
					this.player.plannedAction = "mirrorTeleportEscape"
					this.player.plannedActionClass = MirrorTeleportAction
					this.player.plannedActionData = {"tele_goal":"escape", "mirror":this};
				}
				//player/terrain escape
				if(this.player.plannedAction=="playerEscape" || this.player.plannedAction=="terrainEscape"){
					this.player.plannedAction = "mirrorTeleportEscape"
					this.player.plannedActionClass = MirrorTeleportAction
					this.player.plannedActionData = {"tele_goal":"escape", "mirror":this};
				}
				//low hp after fight
				if(this.player.lastActionState =="fighting" || this.player.lastActionState=="attacked" || this.player.health < roll_range(20,40)){
					// this.player.setPlannedAction("mirrorTeleportEscape", 6);
					this.player.setPlannedAction("mirrorTeleportEscape", 6, MirrorTeleportAction, {"tele_goal":"escape", "mirror":this});
				}
				//look for fight				
				if((this.player.aggroB - this.player.peaceB)+this.player.lastFight*2 > roll_range(100,400)){
					// this.player.setPlannedAction("mirrorTeleportAttack", 4); 
					this.player.setPlannedAction("mirrorTeleportAttack", 4,MirrorTeleportAction,{"tele_goal":"attack", "mirror":this});
				}				
				// random
				if(Math.random()<0.1){
					// this.player.setPlannedAction("mirrorTeleport", 4);
					this.player.setPlannedAction("mirrorTeleport", 4, MirrorTeleportAction, {"tele_goal":"neutral", "mirror":this});
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}

class MirrorTeleportAction extends Action{
	constructor(player, data){		
		super("teleport", player)
		this.tele_goal = data.tele_goal
		this.mirror = data.mirror
		//get a coordinate to move to if not currently moving
		if('targetCoords' in data)
			this.target = data['targetCoords']
	}
	
	//choose random coords on the map
	choose_random_dest(){
		let newX = 0;
		let newY = 0;
		//get new cords to move to
		let tries = 0;
		do {
			newX = Math.floor(Math.random()*mapSize);
			newY = Math.floor(Math.random()*mapSize);
			tries++;
		} while(!safeBoundsCheck(newX,newY) && tries < 5);
		return [newX, newY];
	}
			
	can_choose(){
		let choose = false
		//check if user can choose target
		if(this.player.has_attr('magic', 'demon')){
			choose=true;
		}
		//sword force attack if user cannot choose
		if(this.player.weapon){
			if(this.player.weapon.name=="nanasatsu" && !choose){
				this.tele_goal="attack"
				choose = true
			}
		}
		return choose
	}
	perform(){
		//choose target
		let choose = this.can_choose()
		if(!this.target){
			if(choose)
				this.target = this.choose_dest()
			else
				this.target = this.choose_random_dest()
		}		
		
		//oob coords
		if(!inBoundsCheck(this.target[0], this.target[1])){
			this.player.health=0
			this.player.death = "teleports into space and dies"
			this.player.lastActionState = "teleport"
		}
		else{
			//teleport
			this.player.statusMessage = "teleports using their scrying mirror"
			if(this.tele_goal=="escape"){
				log_message(this.player.name +" tele escape")
				if(choose)
					this.player.statusMessage = "teleports to safer ground"
				else
					this.player.statusMessage = "teleports away from danger"
			}
			else if(this.tele_goal=="attack"){
				log_message(this.player.name +" tele attack")
				if(choose)
					this.player.statusMessage = "teleports to " + this.tele_target.name
				else
					this.player.statusMessage = "teleports to hunt for prey"
			}
			this.player.lastActionState = "teleport"			
		}
		this.player.moveToCoords(this.target[0], this.target[1]);
		this.mirror.use();
	}
	
	//choose a specific target based on player
	choose_dest(){
		let newX = mapSize/2;
		let newY = mapSize/2;
		let tries = 0;
		//aggressive teleport
		if(this.tele_goal=="attack"){
			//go to random player
			do {
				//select a target
				let target_id = roll_range(0,players.length-1)
				let target_player = players[target_id]
				//if self is selected
				if(target_player==this.player && players.length>1){
					if(target_id==0){
						target_player = players[target_id+1]
					}
					else{
						target_player = players[target_id-1]
					}
				}
				newX = target_player.x
				newY = target_player.y
				this.tele_target=target_player
				tries++;
			} while(!safeBoundsCheck(newX,newY) && tries < 10);
		}
		//defensive teleport
		else if(this.tele_goal=="escape"){
			let safe_location=false
			do {
				newX = Math.floor(Math.random()*mapSize);
				newY = Math.floor(Math.random()*mapSize);
				//check for terrain safety
				if(safeTerrainCheck(newX,newY)){
					//check nearby players
					//becomes more lenient as tries increases
					if(nearbyPlayers(newX,newY, 25).length<=tries/2){
						safe_location=true
					}
				}
				tries++;
			} while(!safe_location && tries < 15);
			//if safe location cannot be found
			if(!safeTerrainCheck(newX,newY,1)){
				log_message("default tele"+newX+" "+newY)
				newX = mapSize/2;
				newY = mapSize/2;
			}
		}
		else{
			do {
				newX = Math.floor(Math.random()*mapSize);
				newY = Math.floor(Math.random()*mapSize);
				tries++;
			} while(!safeTerrainCheck(newX,newY) && tries < 10);
		}
		return [newX, newY];
	}
}


class MeatShield extends Offhand {
	constructor(hostage, power, max_duration) {
		super("meat shield");
		this.hostage = hostage;
		this.display_name = this.hostage.name;
		this.power = power;
		this.max_duration = max_duration;
		
		this.icon = "🧍";
		this.uses = max_duration;
		this.tradable = false;
		this.stealable = false;
	}
	
	equip(wielder){
		super.equip(wielder);
		this.player.statusMessage = "uses " + this.hostage.name + " as a meat shield"
		this.hostage.inflict_status_effect(new MeatShieldEff(this.power, this.max_duration, this, this.player))
		return true;
	}
	unequip(){
		// if(this.hostage){
			// if(this.hostage.get_status_effect("meat shield")){
				// let temp_hostage = this.hostage;
				// this.hostage = "";
				// temp_hostage.get_status_effect("meat shield").wear_off();
			// }
		// }
		if(this.hostage){
			let temp_h = this.hostage;
			this.hostage = "";
			let eff = temp_h.get_status_effect("meat shield")
			if(eff){
				eff.item = "";
				eff.wear_off();
			}
		}
		this.destroy();
		return true;
	}
	effect(state, data={}){
		let oP="";
		switch(state){		
			case "surroundingCheck":
				if(this.player.follow_target==this.hostage)
					this.player.follow_target = "";
				if(this.player.fight_target==this.hostage)
					this.player.fight_target = "";
				if(this.player.ally_target==this.hostage)
					this.player.ally_target = "";			
				break;
			case "turnEnd":
				if(!this.hostage)
					this.unequip();
				else if(this.hostage.health<=0)
					this.unequip();
				break;			
			default:
				super.effect(state, data);
				break;
		}
	}
	
	effect_calc(state, x, data={}){
		switch(state){
			case "playerDangerCalc":
				if(data.opponent==this.hostage)
					x=-500;
				break;
			case "dmgCalcIn":
				if(this.hostage.health<=0){
					this.unequip();
					return x;
				}
				let shield_dmg = x * 0.75;
				data.fightMsg.events.push(this.hostage.name + " takes "+ roundDec(shield_dmg)+ " for " + this.player.name);
				this.hostage.take_damage(shield_dmg, data.opponent, data.dmg_type, data.fightMsg);
				if(this.hostage.health<=0){
					this.hostage.death = "killed by " + data.opponent.name;
					data.opponent.kills++;
					this.unequip();					
				}
				x = x * 0.25;
				break;
		}
		return x
	}	
}

class MeatShieldEff extends StatusEffect{
	constructor(level, duration, item, owner){
		super("meat shield", level, duration);
		this.icon = "🧍";
		this.item = item;
		this.owner = owner;
	}
	
	afflict(player){	
		super.afflict(player)
		this.player.unaware=true;
		this.player.incapacitated=true;	
		// let player_action_complete = this.player.currentAction.turn_complete

		this.player.currentAction = new MeatShieldAction(this.player, {'effect':this})
		this.player.currentAction.turn_complete = true
		this.player.statusMessage = "becomes " + this.owner.name + "'s meat shield"
	}	

	//cannot be stacked
	stack_effect(new_eff){
		return false;
	}	
	wear_off(){
		if(this.item){
			this.item.unequip();	
			this.item = "";		
		}
		if(this.player){
			this.player.unaware=false;
			this.player.incapacitated=false;
			this.player.currentAction.complete = true;
			super.wear_off();
		}
	}
	
	effect(state, data={}){
		let oP="";
		switch(state){
			case "turnStart":
				let tP = this.player
				if(this.owner.dead){
					if(this.player)
						this.wear_off();
					break;
				}
				if(this.item.hostage!=this.player){
					if(this.player)
						this.wear_off();
					break;
				}
				super.effect("turnStart", data);
				if(this.player!=tP)
					tP.resetPlannedAction();
				break;
			case "planAction":
				// if(this.player.lastAction="trapped"){
				if(this.player.currentAction.name!='meat shield')
					this.player.setPlannedAction('meat shield', 50, MeatShieldAction, {'effect':this});
				break;
			case "death":
				this.item.unequip()
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
		
	stat_html(){
		let html = "<span><b>Origin:</b>"+this.owner.name+"</span><br>"
		return html;
	}
	
	effect_calc(state, x, data={}){
		switch(state){
			case "followCalcOthers":
			case "aggroCalcOthers":
			case "allyCalcOthers":
				return -500;
				break;
		}
		return x
	}
}

class MeatShieldAction extends Action{
	constructor(player, data){		
		super("meat shield", player, 999, 50)
		this.effect = data.effect;
		this.owner = this.effect.owner;
		this.item = this.effect.item;
		
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.combat_interruptable = false;	
		this.combat_cancellable = false;
	}
	
	turn_start(){
		if(this.owner.dead){
			if(this.effect.player)
				this.effect.wear_off();
			this.turns=0;
			this.complete = true;
			return;
		}
		if(this.item.hostage!=this.player){
			if(this.effect.player)
				this.effect.wear_off();
			this.turns=0;
			this.complete = true;
			return;
		}
		super.turn_start()
		this.player.unaware=true;
		this.player.incapacitated=true;
	}
	
	perform(){
		this.player.unaware=true;
		this.player.incapacitated=true;
		this.turns = 999

		this.player.currentAction.name="meat shield";
		let escape_chance = 29+this.effect.level*2;
		if(this.owner.unaware)
			escape_chance -= 10
		if(this.owner.incapacitated)
			escape_chance -= 20
		if (roll_range(0,50) > escape_chance){
			//escape successful
			log_message(this.player.name+" escapes");
			this.player.statusMessage = "escapes from " + this.owner.name;
			this.player.lastActionState="meat shield escaped";
			// this.player.finishedAction = true;
			this.effect.wear_off();
			this.complete=true;
			this.turn_complete=true;
			this.turns=0;
		}
		else{
			this.player.lastActionState = "meat shield";
			this.player.statusMessage = "forced to be " + this.owner.name + "'s meat shield";
		}
	}

	turn_end(){
		this.player.moveToCoords(this.owner.x, this.owner.y)
	}
}	

var doll=true;
class Doll extends Offhand{}
