var off_prob = 2;
var defaultOffhandOdds = [["bomb",5],["trap",10],["shield",10],["recoil", 15],["food",30],["campfire",15],["mirror",20],["dinh",0]];
function get_offhand_odds(tP){
	let offhandOdds = defaultOffhandOdds.slice();
	if(!doll && tP.get_status_effect("hellbound")=="")
		offhandOdds.push(["doll",0]);
	offhandOdds = tP.apply_all_calcs('itemOdds', offhandOdds, {'item_type':'off'})
	offhandOdds = getTerrain(tP.x, tP.y).forageOdds(tP, 'off', offhandOdds);
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
			if("value" in data){this.value = processDataNum(data["value"])}
			if("useStates" in data){this.useStates = data["useStates"]}
		}		
	}
	
	replace_offhand(new_item, drop = false){
		if(!this.replacable)
			return false;
		let tP = this.player;
		let uneq = false;
		if(drop){
			uneq = this.drop();
		}
		else{
			uneq = this.unequip();
		}
		if(!uneq)
			return false;
		tP.offhand=new_item;
		new_item.equip(tP);
		return true;
	}
	
	unequip(){
		this.destroy();
		if(this.player)
			this.player.offhand = '';
		this.player = '';
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
		//deselect
		super.destroy();
	}
	
}

class Bomb extends Offhand {
	constructor() {
		super("bomb");
	}	
	use(){
		let tempBomb = new BombEntity(this.player.x, this.player.y, this.player);
		createDoodad(tempBomb);
		this.destroy();
	}
	
	drop(){
		let coords = [500,500];
		if(this.player)
			coords = [this.player.x, this.player.y];		
		let uneq = this.unequip();
		if(uneq && this.tradable){
			let drop = '';
			drop = new BombEntity(coords[0], coords[1], this.player);
			drop.duration=roll_range(1,5);
			createDoodad(drop);
		}
		return uneq;
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
					createDoodad(tempBomb);
					// tempBomb.draw();
					// doodads.push(tempBomb);
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
				tempBomb.trigger("");
				createDoodad(tempBomb);
				// tempBomb.draw();
				// doodads.push(tempBomb);
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
		// tempTrap.draw();
		// doodads.push(tempTrap);
		
		createDoodad(tempTrap);
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
					if(data.fightMsg.events)
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
					// tempDecoy.draw();
					// doodads.push(tempDecoy);
					createDoodad(tempDecoy);
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
		// tempCamp.draw();
		// doodads.push(tempCamp);
		createDoodad(tempCamp);
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
	
	drop(){
		let coords = [500,500];
		if(this.player)
			coords = [this.player.x, this.player.y];		
		let uneq = this.unequip();
		if(uneq && this.tradable){
			let drop = new MirrorEntity(coords[0], coords[1], '');
			createDoodad(drop);
		}
		return uneq;
	}
	
	effect(state, data={}){
		switch(state){
			case "defend":
				if(this.broken == false && Math.random()<0.8){
					let oP=data["opponent"];
					pushMessage(this.player, oP.name + " breaks "+this.player.name+"'s scrying mirror");
					this.icon = setItemIcon("./icons/mirror_broken1.png");
					let tempMirror = new MirrorEntity(this.player.x, this.player.y,this.player);
					// tempMirror.draw();
					// doodads.push(tempMirror);
					createDoodad(tempMirror);
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
		this.replacable = false;
		this.value = 10000;
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

class MeatShieldAction extends ImmobileAction{
	constructor(player, data){		
		super("meat shield", player, 999, 50)
		this.effect = data.effect;
		this.owner = this.effect.owner;
		this.item = this.effect.item;
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

var doll=false;
var AIDIV = "<img id='ai_img' src='icons/ai.png' style='opacity:0.4; position:absolute; bottom:0px; transform: scale(0.3) translate(-120%, 130%); '></img>"
class Doll extends Offhand{
	constructor() {
		super("doll");
		this.target = "";
		this.tradable = false;
		this.stealable = false;
		this.replacable = false;
		this.turns = 0;
	}
	
	equip(wielder){
		super.equip(wielder);
		this.target = this.choose_target();
		doll = true;
		//set ai
		$('#effects').append(AIDIV);
		this.wanyuudou = new WanyuudouEntity(this.target);
		createDoodad(this.wanyuudou);
		return true;
	}
	
	choose_target(){
		let tP = this.player;
		let chosen = "";
		let chosen_score = 50000;
		players.forEach(function(oP){
			if(oP==tP)
				return
			let oP_score = tP.opinions[oP.id]
			if(oP==tP.rival)
				oP_score -= 50
			if(oP_score < chosen_score){
				chosen_score = oP_score;
				chosen = oP;
			}
		});
		return chosen;
	}	
	
	effect(state, data={}){
		let oP="";
		switch(state){			
			case "turnStart":
				if(!this.target){
                    pushMessage(this.player, this.player.name + " has no one to kill (no pull)");
					this.destroy();
					return;
				}
				if(this.target.dead){
                    pushMessage(this.player, this.target.name + " dies before "+this.player.name+" can pull (no pull)");
					this.destroy();
				}
				this.turns+=1;
				break;
			case "defend":
				oP = data.opponent;
				if(oP == this.target)
					this.use();
				break;
			case "turnEnd":
				// if(this.turns>=3){
					let decision = this.decision()
					if(decision == "pull"){
						this.use();
					}
					else if (decision == "discard"){
						this.discard();
					}
				// }
				break;
			case "death":
				this.destroy();				
				break;
			default:
				super.effect(state, data);
				break;
		}
	}	
	
	decision(){
		let pull_chance = 30;
		let no_pull_chance = 100;
		let discard_chance = 5;
		let target_opinion = this.player.opinions[this.target.id];
		if(target_opinion>50){
			discard_chance+=target_opinion/10;
			no_pull_chance+=target_opinion/2;
		}
		else if(target_opinion<-100){
			pull_chance-=target_opinion/4;
		}
		return roll([["pull", pull_chance], ["no pull", no_pull_chance],["discard", discard_chance]])
	}
	
	use(){
		if(this.target){
			// this.player.lastActionState = "doll pull";
			this.player.statusMessage = "sends " + this.target.name + " to hell";
            if(this.turns==0){                
                pushMessage(this.player, this.player.name + " sends " + this.target.name + " to hell (insta pull)");
            }
            else{
                pushMessage(this.player, this.player.name + " sends " + this.target.name + " to hell ("+this.turns+" turns)");
            }
			this.player.kills++;
			this.player.inflict_status_effect(new HellBound())
			this.target.health = 0;
			this.target.death = "gives death a try";
			this.wanyuudou.activate();
		}
		this.uses = 0;
		this.destroy();
	}
	
	discard(){
		pushMessage(this.player, this.player.name + " gives up on revenge (no pull)");
		this.uses = 0;
		this.destroy();
	}					

	destroy(){ 
		super.destroy();
		// this.wanyuudou.destroy();
		this.wanyuudou.duration=1;
		//remove ai
		$('#ai_img').remove();
		doll=false;		
	}
	
	stat_html(){
		let html = 	
		"<span><b>Target:</b>" + this.target.name + "</span><br>" + 
		super.stat_html()+		
		"<span class='desc'>" +
			"Ippen" +
		"</span>"		
		return html;
	}		
}

class WanyuudouEntity extends MovableEntity{
	constructor(target){
		super("wanyuudou",0,0,target);
		this.img = 'https://cdn.discordapp.com/attachments/998843166138572821/1034708217441288222/WANYUUDOU_FIRE2.png';

		this.duration=99999;
		
		this.triggerRange = 0;
		this.triggerChance=0;
		this.ownerTriggerChance = 0;
				
		this.moveSpeed = 0;
		
		let corner = roll_range(0,3);
		let pos = roll_range(0,1000);
		switch(corner){
			//left
			case 0:
				this.moveToCoords(0, pos);
				break;
			//right
			case 1:
				this.moveToCoords(1000, pos);
				break;
			//top
			case 2:
				this.moveToCoords(pos, 0);
				break;
			//bottom
			case 3:
				this.moveToCoords(pos, 1000);
				break;
		}		
		this.active=true;
	}
	
	draw(){
		// super.draw();
		let doodDiv = $('#doodad_' + this.id)
		if(!doodDiv.length){
			$('#doodads').append(
			"<div id='doodad_" + this.id + "' class='doodad round' style='border:solid 2px red; z-index:5; transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px);'>" + 
			"</div>");
			doodDiv = $('#doodad_' + this.id);
			doodDiv.css('background-image',"url(" + this.img + ")");
			this.div = doodDiv;
		}
		this.div.css('display','none');
	}
	
	activate(){	
		let starting_point = [this.x, this.y];
		let move_dist = hypD(this.owner.x - starting_point[0], this.owner.y - starting_point[1])
		let move_line = new Line({"p1":starting_point,"p2":[this.owner.x, this.owner.y]})
		this.div.css('display','block');
		this.moveToCoords(this.owner.x, this.owner.y);		
		
		let fire_count = move_dist/10 + roll_range(5,10);
		for(let i=0; i<fire_count; i++){
			let rand_x = roll_range(starting_point[0], this.owner.x);
			let rand_y = move_line.getY(rand_x)
			let tempFire = new FireEntity(rand_x, rand_y, '');
			tempFire.duration = 2;
			createDoodad(tempFire);
		}	
	}
	
	update(){		
		if(this.duration<=0){
			this.expire();
			return;
		}
		this.duration--;
	}
}

class HellBound extends StatusEffect{
	constructor(){
		super("hellbound", 666, 200000);
		this.icon = setEffIcon("icons/hell.png")
		this.intimidationBonus = 30;
		this.dmgReductionB = 1.05;
	}
	
	effect(state, data={}){
		let oP="";
		switch(state){
			case "attack":
				this.dmgReductionB += 0.02;
				this.fightBonus -= 0.01;
				break;
			case "death":
				this.player.death = this.player.death + " and goes to hell"
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = 	super.stat_html()+		
		"<span class='desc'>"+
			"Curses come home to roost"+
		"</span>"		
		return html;
	}	
}

class Dinh extends Offhand {
	constructor() {
		super("dinh");
		this.display_name = "Dinh's Bulwark"
        this.dmgReductionB = 0.75
        this.moveSpeedB = 0.5
        this.fightBonus = 0.5
        this.spec=100;
        this.spec_range=50;
	}	
    
       
	effect(state, data={}){
		switch(state){
            case "turnStart":
                if(this.spec<100){this.spec+=10}
                if(this.spec>100){this.spec=100}
                break;
            case "fightStart":
				if(this.spec>=50 && playerDist(this.player, data.opponent)<=this.spec_range){
                    this.player.attack_action = new DinhSpec(this.player, this);
				}
				break; 
			case "takeDmg":
				let dmg = data["damage"];
				this.uses = roundDec(this.uses - dmg);
                //this.spec+=roundDec(dmg/5,0);
				if(this.uses<=0){
					this.destroy();
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
    
    stat_html(){
		let html = 	
		super.stat_html()+
        "<span><b>Spec:</b>x"+this.spec+"</span><br>"+
		"<span class='desc'>" +
			"I hate Maple so much" +
		"</span>"		
		return html;
	}		

}

class DinhSpec extends CombatAction{
	constructor(player, item){
		super("dinh spec", player, true, 4);
		this.display_name = "Shield Bash"
		this.player = player;
		this.item = item;
	}
	
	execution_fail(action, attacker, defender, counter, fightMsg){
		if(fightMsg.events)
			fightMsg.events.push(this.player.name + ' whiffs their shield attack');
		this.item.spec-=50;
	}
	
	fight_target(attacker, defender, counter, fightMsg){
		if(playerDist(attacker, defender)>this.item.spec_range){
			fightMsg.events.push(attacker.name + " is too slow to attack " + defender.name);
			attacker.statusMessage = "too slow to attack " + defender.name;
			return
		}
		
		let dmg = roll_range(10, 30);
		dmg = dmg * defender.dmgReductionB*2;
        dmg = dmg * 2-attacker.dmgReductionB;
        
        if(counter==true){
            dmg=dmg*1.05
        }
		
		defender.take_damage(dmg, attacker, "melee", fightMsg)
		fightMsg.events.push(attacker.name + " bashes "+ defender.name +" with their shield for "+ roundDec(dmg) + " damage" );
		
		
		//aoe
		let tP= attacker;
		players.forEach(function(oP){
			if(oP==defender || oP==attacker)
				return
			if(playerDist(tP, oP)<50){
                let dmg = roll_range(1,10)
                dmg = dmg * 2-attacker.dmgReductionB;
				oP.take_damage(dmg, tP, "unarmed");
				oP.currentAction.turn_complete = true;
				oP.statusMessage = "hit by " +tP.name+ "'s shield";
				pushMessage(oP, oP.name + " hit by " +tP.name+ "'s shield for " + dmg)
				if(oP.health<=0){
					tP.kills++;
					oP.death = "killed by" +tP.name+ "'s shield"
				}
			}
		});
		attacker.statusMessage = "bashes "+defender.name +" with their Dinh's Bulwark";
		if(defender.health<=0){
			defender.death = "bashed to death by " + attacker.name;
		}
        this.item.spec-=50;
    }
	
	kill(attacker, defender, counter, fightMsg){
		defender.death = "bashed to death by " + attacker.name;
		attacker.statusMessage = "bashes " + defender.name + " to death";
	}
}