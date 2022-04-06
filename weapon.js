var weapon_data = {
	"lance" : {
		"icon":"🔱",
		"dmg_type":"melee",
		"fightBonus":1.3,
		"uses":[4,9]
	},
	"gun" : {
		"icon":"🔫", 
		"dmg_type" : "ranged",
		"rangeBonus" : 20,
		"fightBonus" : 1.3,
		"uses" : 4		
	},	
	"bow" : {
		"icon":"🏹", 
		"dmg_type" : "ranged",
		"rangeBonus" : 30,
		"fightBonus" : 1.1,
		"uses" : 10		
	},
	"knife" : {
		"icon":"🔪", 
		"dmg_type" : "melee",
		"fightBonus" : 1.1,
		"uses" : [5,10]	
	},
	"nanasatsu" : {
		"icon" : "./icons/nanasatsu.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 2,
		"peaceBonus" : -500,
		"aggroBonus" : 500,
		"dmgReductionB" : 1.05,
		"uses" : 99999
	},
    "katana" : {
		"icon" : "./icons/katana.png",
		"icon_type" : "img",
		"dmg_type":"melee",
		"uses":[4,9]
	},
    "shotgun" : {
		"icon" : "./icons/shotgun.png",
		"icon_type" : "img",
		"rangeBonus" : 25,
		"dmg_type":"ranged",
		"uses":[3,6]
	},

}

/*
	this.name = name;
	this.icon = "⚫";
	
	this.sightBonus = 0;
	this.visibilityB = 0;
	
	this.rangeBonus = 0;
	this.fightBonus = 1;
	this.dmgReductionB = 1;
	
	this.peaceBonus=0
	this.aggroBonus=0		
	
	this.moveSpeedB = 1;
	
	this.uses = 0;
	this.dmg_type = "";

*/


function create_weapon(weapon_name){
	switch(weapon_name){
		case "Nothing":
			return "";
			break;
		case "nanasatsu":
			return new Nanasatsu();
			break;		
		case "lance":
			return new Lance();
			break;		
		case "katana":
			return new Katana();
			break;
		case "shotgun":
			return new Shotgun();
			break;
		
		default:
			if(weapon_name in weapon_data){
				return new Weapon(weapon_name);
			}
			else{
				return "";
			}
			break;		
	}
}

//class to hold data for items
class Weapon extends Item{
	constructor(name){
		super(name);

		this.dmg_type="";
		
		if(name in weapon_data){
			let data = weapon_data[name];
			
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
			
			if("dmg_type" in data){this.dmg_type=data["dmg_type"]}
		}		
	}

	equip(wielder){
		this.wielder = wielder;
		// this.wielder.lastAction = "found " + this.name;
		this.calc_bonuses();
		this.wielder.statusMessage =  "found " + this.name;
		return true;
	}
	
	unequip(){
		this.wielder="";
		return true;
	}

	/*
	Effects on wielder:
		planAction
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
		let oP="";
		let counter="";
		switch(state){			
			case "turnStart":
				this.wielder.div.removeClass("sexSword");
				break;
			case "death":
				break;
			//attacking before dealing damage to opponent
			case "attack":
				oP=data['opponent'];
				this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
				this.use();
				break;
			//after dealing damage
			case "dealDmg":
				break;
			case "win":
				oP=data['opponent'];
				this.wielder.statusMessage = "kills " + oP.name;
				break;
		}
	}
    destroy(){
		log_message(this.wielder.name +"'s " + this.name+" breaks");
		this.wielder.weapon = "";   
		this.wielder.wielder = "";
	}
	
}

class Lance extends Weapon {
	constructor() {
		super("lance");
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				super.effect("turnStart", data);
				if(roll([["die",1],["live",20000]]) == "die"){
					this.wielder.health = 0;
					this.wielder.death = "Died by their own spear";
					this.wielder.die();
					log_message(this.wielder.name + ' killed by lance')
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}

//random chance of critting
//at least one crit guarenteed 
class Katana extends Weapon {
	constructor() {
		super("katana");
		this.crit=false;
	}

	effect(state, data={}){
		let oP="";
		switch(state){
			//random crit
			case "attack":
				oP=data['opponent'];
				if((this.uses==1 && !this.crit)){
					//guarenteed crit
					this.wielder.fightDmgB *= 2.5;
					this.crit=true;
					this.wielder.statusMessage = "lands a SUPER critical hit on " + oP.name;
					log_message("SUPER CRIT")
				}
				else if(Math.random()<0.1){
					//crit
					this.wielder.fightDmgB *= 2;
					this.crit=true;
					this.wielder.statusMessage = "lands a critical hit on " + oP.name;
					log_message("CRIT")
				}
				else{
					this.wielder.fightDmgB *= 1.2;
					this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
				}
				this.use();
				break;
		}
	}
}

//2 shells loaded at a time
//takes time to reload
//damage based on distance
class Shotgun extends Weapon {
	constructor() {
		super("shotgun");
		this.max_shells = 2;
		this.loaded_shells = this.max_shells;
		this.max_range = 50;	//furthest it can hit
		this.dmg_range = [1.05, 2.5]; //min, max
		this.max_spread = 15 //bullet spread radius at max range
		this.icon_full = setItemIcon("./icons/shotgun.png")
		this.icon_empty = setItemIcon("./icons/shotgunE.png")
		this.napalm = false;
	}
	calc_bonuses(){
		super.calc_bonuses();
		if(this.loaded_shells==0){
			this.wielder.fightRangeB -= this.rangeBonus;
		}
	}
	reload(){
		if(this.uses>0){
			log_message(this.wielder.name + " reloads");
			this.wielder.statusMessage = "reloads their shotgun";
			this.wielder.lastAction = "reload"
			this.loaded_shells=this.max_shells;
			this.uses--;
		}
		else{
			this.destroy();
		}
	}
	
	effect(state, data={}){
		let oP="";
		let counter="";
		switch(state){
			case "turnEnd":
				if(this.loaded_shells==0){
					this.icon = this.icon_empty;
				}
				else{
					this.icon = this.icon_full;
				}	
				break;
			case "planAction":
				if(this.loaded_shells==0 && Math.random()<0.5){
					this.wielder.setPlannedAction("reloadShotgun", 2);
				}
				break;
			case "reloadShotgun":
				this.reload();
				this.wielder.resetPlannedAction();
				break;
			case "attack":
				oP=data['opponent'];
				counter=data['counter'];
				if(this.loaded_shells>0){
					log_message("SHOTGUN ATTACK")
					this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
					//calculate damage based on distance
					// currently linear scaling
					let target_dist = playerDist(this.wielder, oP);
					let dmg_bonus = ((this.dmg_range[0] - this.dmg_range[1])/this.max_range) * target_dist + this.dmg_range[1]
					if(target_dist<=this.max_range*0.1){
						dmg_bonus += 0.5;
						this.wielder.statusMessage = "hits " + oP.name +" at point blank with a shotgun";
					}
					if(target_dist>=this.max_range*0.9){
						dmg_bonus=this.dmg_range[0]
						this.wielder.statusMessage = "barely hits " + oP.name +" with a shotgun";
					}
					//collateral 
					if(target_dist>this.max_range*0.6){
						let nearby_lst = oP.nearbyPlayers((target_dist/this.max_range)*this.max_spread);
						let temp_wep = this;
						nearby_lst.forEach(function(unfortunate_victim,index){
							if(unfortunate_victim != temp_wep.wielder && Math.random()<0.5){
								log_message("stray hit " + unfortunate_victim.name);
								let dmg = (1.1 - target_dist/temp_wep.max_range) * 5;
								dmg = dmg * unfortunate_victim.dmgReductionB;
								if(dmg > unfortunate_victim.health)
									dmg = unfortunate_victim.health;
								unfortunate_victim.take_damage(dmg, temp_wep.player, temp_wep.dmg_type);
								if(unfortunate_victim.health <=0){
									unfortunate_victim.death="killed by a stray pellet from "+temp_wep.wielder.name+"'s shotgun";
									pushMessage(unfortunate_victim, "killed by a stray pellet from "+temp_wep.wielder.name+"'s shotgun");
									temp_wep.wielder.kills++;
								}
								else{
									unfortunate_victim.statusMessage="hit by a stray pellet from "+temp_wep.wielder.name+"'s shotgun";
									pushMessage(unfortunate_victim, "hit by a stray pellet from "+temp_wep.wielder.name+"'s shotgun");
								}
								
								unfortunate_victim.finishedAction = true;
								unfortunate_victim.resetPlannedAction();
							}
						});		
					}
					log_message(dmg_bonus)
					this.wielder.fightDmgB *= dmg_bonus;
					this.loaded_shells--;				
				}
				else if(counter && Math.random()<0.2){
					//20% chance of reload instead of fighting back
					this.reload();
					this.wielder.statusMessage = "reloads their shotgun instead of fighting back";
				}
				else{
					//no reload
					this.wielder.statusMessage = "attacks " + oP.name + " with an empty shotgun";
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}
class Nanasatsu extends Weapon {
	constructor() {
		super("nanasatsu");
		this.kills=0;
		this.prev_owners=0;
	}
	equip(wielder){
		super.equip(wielder);
		sexSword = false;
		this.wielder.statusMessage = "<span style='color:red'>found SEX SWORD</span>";
		if(this.prev_owners==0){
			pushMessage(this.wielder,this.wielder.name +  "<span style='color:red'> found SEX SWORD</span>");
		}
		else{
			if(this.kills<5){
				pushMessage(this.wielder ,this.wielder.name+ "<span style='color:red'> takes SEX SWORD</span>");
			}
			else{
				pushMessage(this.wielder , this.wielder.name + "<span style='color:red'> CONTINUES THE SLAUGHTER</span>");
			}				
		}
		return true;
	}
	
	effect(state, data={}){
		let dmg=0;
		let oP="";
		switch(state){
			//turn start
			case "turnStart":
				this.wielder.div.addClass("sexSword");
				//lose health
				this.wielder.health -= (this.fightBonus - 1.5 + this.kills);
				//this.wielder.health -= (this.fightBonus +2000);
				//death message
				if(this.wielder.health <= 0){
					this.wielder.death = "Succumbed to SEX SWORD";
					this.wielder.die();
					log_message(this.wielder.name + ' killed by sword')
				}
				break;
			case "attack":
				oP=data['opponent'];
				this.wielder.statusMessage = "attacks " + oP.name + " with SEX SWORD";
				break;
			//dealing damage
			case "dealDmg":
				oP=data['opponent'];
				dmg=data['damage'];			
				//heal on hit
				log_message(this.wielder.name + " SEX SWORD attack")
				// log_message(this.wielder.health + " before");
				log_message(this.fightBonus + " before");
				log_message(dmg);
				this.wielder.health += Math.pow(dmg,0.66);
				this.fightBonus += dmg/1000;
				// log_message(this.wielder.health + " after");
				log_message(this.fightBonus + " after");
				break;
			//killing an opponent
			case "win":
				this.kills++;  
				this.fightBonus += 0.25;
				oP=data['opponent'];
				this.wielder.statusMessage = "kills " + oP.name+" and gets stronger";
				break;
			//killed by opponent
			case "lose":
				oP=data['opponent'];
				//transfer ownership to killer if killer is charmed
				//if(Math.random() > 0.1){
					if(oP.get_status_effect("charm")){
						if(oP.get_status_effect("charm").target==this.wielder){
							this.wielder.unequip_item("wep");
							this.prev_owners++;
							if(oP.equip_item(this,"wep")){
								log_message("sex sword is passed onto " + oP.name);
							}
						}
					}
				//}				
				break;
			//seen by player
			case "opAware":
				oP=data['opponent'];
				// if (Math.random() > 0.3){
					let temp_charm = new Charm(this.wielder);
					temp_charm.level=2;
					temp_charm.aggro=true;
					oP.inflict_status_effect(temp_charm);
				// }
				break;
			//followed by another player
			case "followTarget":
				oP=data['opponent'];
				oP.statusMessage = "following SEX SWORD";
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
}
