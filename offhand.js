var offhand_data = {
	"bomb" : {
		"icon":"💣",
		"uses": 1
	},
	"trap" : {
		"icon":"🕳", 
		"uses" : 1		
	},
	"shield" : {
		// "icon":"🛡️",
		"icon" : "./icons/shield.png",
		"icon_type" : "img",
		"uses": [1,3],
		"dmgReductionB":0.5,
		"useStates":["defend"]
	},
	"recoil" : {
		"icon" : "./icons/recoil.png",
		"icon_type" : "img",
		"dmgReductionB":0.75,
		"uses": 10,
	},
	"vape" : {
		"icon" : "./icons/vape.png",
		"icon_type" : "img",
		"peaceBonus":40,
		"visibilityB":-20,
		"uses": 1,
	},
	"campfire" : {
		"icon" : "./icons/campfire.png",
		"icon_type" : "img", 
		"uses" : 1		
	},	
	"mirror" : {
		"icon" : "./icons/mirror.png",
		"icon_type" : "img",
		"uses" : 1		
	},
}
function create_offhand(offhand_name){
	switch(offhand_name){
		case "Nothing":
			return "";
			break;
		case "trap":
			return new Trap();
			break;		
		case "bomb":
			return new Bomb();
			break;
		case "recoil":
			return new Recoil();	
			break;			
		case "vape":
			return new Vape();		
			break;
		case "campfire":
			return new Campfire();
			break;
		case "mirror":
			return new Mirror();
			break;
		case "food":
			let foodOdds = [["apple",10],["pie",10],["banana",10],["ebiroll",5]];
			let food_name = roll(foodOdds)
			return create_food(food_name);
		default:
			if(offhand_name in offhand_data){
				return new Offhand(offhand_name);
			}
			else{
				return "";
			}
			break;		
	}
}
var off_prob = 2;
function get_offhand_odds(tP){
	let offhandOdds = [["bomb",5],["trap",10],["shield",10],["recoil", 15],["food",25],["vape",20],["campfire",15],["mirror",40],["Nothing",200]];
	// let offhandOdds = [["bomb",5],["trap",20],["shield",20],["recoil", 15000],["Nothing",400]];
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
		this.wielder.offhand=new_item;
		new_item.equip(this.wielder);
		this.wielder=""
		return true;
	}
	unequip(){
		this.wielder="";
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
			log_message(this.wielder.name +" uses "+this.name)
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
		log_message(this.wielder.name +"'s " + this.name+" breaks");
		this.wielder.offhand = "";   
		super.destroy();
	}
	
}

class Bomb extends Offhand {
	constructor() {
		super("bomb");
	}	
	use(){
		let tempBomb = new BombEntity(this.wielder.x, this.wielder.y, this.wielder);
		tempBomb.draw();
		doodads.push(tempBomb);
		this.destroy()
		// this.wielder.offhand="";
		// this.wielder="";
	}
	
	effect(state, data={}){
		let oP="";
		let tempBomb="";
		switch(state){		
			case "defend":
				if(Math.random()<0.1){
					oP=data["opponent"];
					pushMessage(this.wielder, this.wielder.name + "'s bomb is knocked out of their hands by "+oP.name);
					tempBomb = new BombEntity(this.wielder.x, this.wielder.y,this.wielder);
					tempBomb.maxDuration=1;
					tempBomb.draw();
					doodads.push(tempBomb);
					this.wielder.offhand="";
					this.wielder="";
				}				
				break;
			case "endMove":
				if(roll([['use',5],['notuse',100]]) == 'use'){
					log_message(this.wielder.name + " plants a bomb");
					pushMessage(this.wielder, this.wielder.name + " plants a bomb")
					this.use();
				}
				break;
			case "death":
				//drop bomb on death
				pushMessage(this.wielder, this.wielder.name + " drops their bomb as they die");
				tempBomb = new BombEntity(this.wielder.x, this.wielder.y,this.wielder);
				tempBomb.draw();
				tempBomb.trigger("");
				doodads.push(tempBomb);
				this.wielder.offhand="";				
				this.wielder="";			
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
		let tempTrap = new TrapEntity(this.wielder.x, this.wielder.y,this.wielder);
		tempTrap.draw();
		doodads.push(tempTrap);
		// this.wielder.offhand="";
		// this.wielder="";
		this.destroy();
	}
	effect(state, data={}){
		let oP="";
		switch(state){		
			case "endMove":
				if(roll([['use',10],['notuse',100]]) == 'use'){
					log_message(this.wielder.name + " sets a trap");
					pushMessage(this.wielder, this.wielder.name + " sets a trap")
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
					log_message(this.wielder.name + " recoil on " + oP.name + " "+ recoil_dmg);
					if(oP.health<0){
						oP.death = "killed by recoil damage from " + this.wielder.name;
						// pushMessage(oP, oP.name + " killed by recoil damage from " + this.wielder.name);
						this.wielder.kills++;
					}
					this.uses = this.uses - recoil_dmg;
					if(this.uses<=0){
						this.destroy();
					}
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
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"	+
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
					this.wielder.statusMessage="vapes and escapes"
					let tempDecoy = new DecoyEntity(this.wielder.x, this.wielder.y, this.wielder)
					tempDecoy.name = this.wielder.name+"'s vape illusion";
					tempDecoy.draw();
					doodads.push(tempDecoy);
					this.use()			
				}
				break;
			case "turnEnd":
				//apply peace effect to nearby players
				let nearby_lst = this.wielder.nearbyPlayers(this.vape_radius);
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
		let tempCamp = new CampfireEntity(this.wielder.x, this.wielder.y,this.wielder);
		tempCamp.duration = roll_range(8,12);
		tempCamp.draw();
		doodads.push(tempCamp);
		this.destroy();
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "endMove":
				if(getTerrain(this.wielder.x, this.wielder.y).danger==0&&(hour >= 20 || hour < 5)){
					if(roll([['use',1],['notuse',2]]) == 'use'){
						pushMessage(this.wielder, this.wielder.name + " sets a campfire")
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
	
	//choose a specific target based on player
	choose_dest(tele_goal=""){
		let newX = mapSize/2;
		let newY = mapSize/2;
		let tries = 0;
		//aggressive teleport
		if(tele_goal=="attack"){
			//go to random player
			do {
				//select a target
				let target_id = roll_range(0,players.length-1)
				let target_player = players[target_id]
				//if self is selected
				if(target_player==this.wielder && players.length>1){
					if(target_id==0){
						target_player = players[target_id+1]
					}
					else{
						target_player = players[target_id-1]
					}
				}
				newX = target_player.x
				newY = target_player.y
				this.target=target_player
				tries++;
			} while(!safeBoundsCheck(newX,newY) && tries < 10);
		}
		//defensive teleport
		else if(tele_goal=="escape"){
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
	
	teleport(tele_goal=""){
		let tele_coords = [500,500];
		let choose = false
		
		//check if user can choose target
		/*
		if(){
			choose=true;
		}*/
		//sword force attack if user cannot choose
		if(this.wielder.weapon){
			if(this.wielder.weapon.name=="nanasatsu" && !choose){
				tele_goal="attack"
				choose = true
			}
		}
		
		//select coordinates to teleport to
		if(choose){tele_coords = this.choose_dest(tele_goal)}
		else{tele_coords = this.choose_random_dest()}
		
		//oob coords
		if(!inBoundsCheck(tele_coords[0], tele_coords[1])){
			this.wielder.health=0
			this.wielder.death = "teleports into space and dies"
			this.wielder.lastAction = "teleport"
		}
		else{
			//teleport
			this.wielder.statusMessage = "teleports using their scrying mirror"
			if(tele_goal=="escape"){
				log_message(this.wielder.name +" tele escape")
				if(choose){this.wielder.statusMessage = "teleports to safer ground"}
				else{this.wielder.statusMessage = "teleports away from danger"}
			}
			else if(tele_goal=="attack"){
				log_message(this.wielder.name +" tele attack")
				if(choose){this.wielder.statusMessage = "teleports to " + this.target.name}
				else{this.wielder.statusMessage = "teleports to hunt for prey"}
			}
			this.wielder.lastAction = "teleport"			
		}
		this.wielder.moveToCoords(tele_coords[0], tele_coords[1]);
		this.wielder.resetPlannedAction()
		this.wielder.finishedAction = true;
		this.use();
	}

	effect(state, data={}){
		switch(state){
			case "planAction":
				//oob
				if(!safeBoundsCheck(this.wielder.x, this.wielder.y)&&this.wielder.plannedAction=="move"){
					this.wielder.plannedAction = "mirrorTeleportEscape"	
				}
				//player/terrain escape
				if(this.wielder.plannedAction=="playerEscape" || this.wielder.plannedAction=="terrainEscape"){
					this.wielder.plannedAction = "mirrorTeleportEscape"
				}
				//low hp after fight
				if(this.wielder.lastAction=="fighting" || this.wielder.health < roll_range(20,40)){
					this.wielder.setPlannedAction("mirrorTeleportEscape", 6); 
				}
				//look for fight				
				if((this.wielder.aggroB - this.wielder.peaceB)+this.wielder.lastFight*2 > roll_range(100,400)){
					this.wielder.setPlannedAction("mirrorTeleportAttack", 4); 
				}				
				// random
				if(Math.random()<0.1){
					this.wielder.setPlannedAction("mirrorTeleport", 4); 
				}
				break;
			case "mirrorTeleport":
				this.teleport();
				break;				
			case "mirrorTeleportEscape":
				this.teleport("escape");
				break;				
			case "mirrorTeleportAttack":
				this.teleport("attack");
				break;			
			default:
				super.effect(state, data)
				break;
		}
	}
}
