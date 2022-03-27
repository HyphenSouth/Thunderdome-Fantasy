var weapon_data2 = {
	//icon, sightBonus, rangeBonus, fightBonus, aggroBonus, peaceBonus, uses, type
	"lance": ["🔱", 0, 0, 1.3, 0, 0, [4,9], "melee"],
	"gun"  : ["🔫", 0, 20, 1.3, 0, 0, 4, "ranged"],
	"bow"  : ["🏹", 0, 30, 1.1, 0, 0, 10, "ranged"], 
	"knife": ["🔪", 0, 0, 1.1, 0, 0, [4,9], "melee"],
	"bomb" : ["💣", 0, 0, 0, 0, 0, 0, "doodad"],
	"trap" : ["🕳", 0, 0, 0, 0, 0, 0, "doodad"],
	//"nanasatsu" : ["🗡", 0, 0, 2, 1000, 0, 99999, "melee"]
	"nanasatsu" : ['<img style="width:20px;height:20px;" src=""></img>', 0, 0, 2, 500, -500, 99999, "melee"]
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
		"icon":"./icons/nanasatsu.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 2,
		"peaceBonus" : -500,
		"aggroBonus" : 500,
		"uses" : 99999
	},

}
// "bomb" : ["💣", 0, 0, 0, 0, 0, 0, "doodad"],
// "trap" : ["🕳", 0, 0, 0, 0, 0, 0, "doodad"],

//pass in number or Array
//if its an array return random number in that range
function processDataNum(num){
	if(typeof num =="object"){
		return roll_range(num[0], num[1]);
	}
	return num;
}

function setItemIcon(icon){
	return '<img style="width:20px;height:20px;" src="' + icon +'"></img>';
}


function create_weapon(weapon_name){
	if(weapon_name == "Nothing"){
		return "";
	}
	else if(weapon_name=="nanasatsu"){
		return new Nanasatsu();
	}
	else if(weapon_name=="lance"){
		return new Lance();
	}
	else{
		return new Weapon(weapon_name);
	}	
}

function create_offhand(offhand_name){
	return "";
}

class Item{
	constructor(name){
		this.name = name;
		this.icon = "❓";
		
		this.sightBonus = 0;
		this.visibilityB = 0;
		
		this.rangeBonus = 0;
		this.fightBonus = 1;
		this.dmgReductionB = 1;
		
		this.peaceBonus=0
		this.aggroBonus=0		
		
		this.moveSpeedB = 1;

		this.uses = 0;
		this.wielder = "";	
	}
	
	calc_bonuses(){
		this.wielder.sightRangeB += this.sightBonus;
		this.wielder.visibility += this.visibilityB;
		
		this.wielder.fightRangeB += this.rangeBonus;
		this.wielder.fightDmgB *= this.fightBonus;
		this.wielder.dmgReductionB *= this.dmgReductionB;
		
		this.wielder.peaceB += this.peaceBonus;
		this.wielder.aggroB += this.aggroBonus;
				
		this.wielder.moveSpeedB *= this.moveSpeedB;
	}

	use(){
		this.uses--;
		if(this.uses == 0){
			this.destroy();
		}
	}
	
	destroy(){
		log_message(this.wielder.name +"'s " + this.name+" breaks");
		this.wielder.weapon = "";   
		this.wielder.wielder = "";
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
		planning
		moving
		foraging
		sleeping
		escaping
		death
	*/
	/*
	Effects on others:
		in range
		aware
		attack
		defend
		win
		lose
	*/		
	effect(state, data={}){
		switch(state){			
			case "turn start":
				this.wielder.div.removeClass("sexSword");
				break;
			case "death":
				break;
			case "attack":
				this.use();
				break;
		}
	}
	
}

class Lance extends Weapon {
	constructor() {
		super("lance");
	}
	effect(state, data={}){
		switch(state){
			case "turn start":
				super.effect(data);
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
			case "turn start":
				this.wielder.div.addClass("sexSword");
				//lose health
				this.wielder.health -= (this.fightBonus - 1.5 - this.kills/20);
				//this.wielder.health -= (this.fightBonus +2000);
				//death message
				if(this.wielder.health <= 0){
					this.wielder.death = "Succumbed to SEX SWORD";
					this.wielder.die();
					log_message(this.wielder.name + ' killed by sword')
				}
				break;
			//killing an opponent
			case "win":
				this.kills++;  
				break;
			//dealing damage
			case "attack":
				//heal on hit
				dmg=data['damage'];
				log_message(this.wielder.name + " SEX SWORD attack")
				// log_message(this.wielder.health + " before");
				// log_message(dmg);
				this.wielder.health += Math.pow(dmg,0.66);
				this.fightBonus += dmg/1000;
				// log_message(this.wielder.health + " after");
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
					/*
					if(oP.weapon){
						oP.weapon.unequip();
					}
					if(!oP.weapon){
						if(this.equip(oP)){
							log_message("sex sword is passed onto " + oP.name);
							if(this.kills<5){
								pushMessage(oP ,oP.name+ "<span style='color:red'> takes SEX SWORD</span>");
							}
							else{
								pushMessage(oP , oP.name + "<span style='color:red'> CONTINUES THE SLAUGHTER</span>");
							}
						}
					}
					*/
				
				break;
			//seen by player
			case "op aware":
				oP=data['opponent'];
				// if (Math.random() > 0.3){
					let temp_charm = new Charm(this.wielder);
					temp_charm.level=2;
					temp_charm.aggro=true;
					oP.inflict_status_effect(temp_charm);
					/*
					if(oP.setPlannedAction("follow", 7)){
						log_message(oP.name +" follows " + this.wielder.name+"'s sex sword")
						oP.plannedTarget = this.wielder;
					}
					*/
				// }
				break;
			//in fighting range of another player
			/*
			case "op in range":
				oP=data['opponent'];
				// if (Math.random() > 0.3){
					if(oP.setPlannedAction("fight", 7)){
						log_message(oP.name +" forced to fight " + this.wielder.name+"'s sex sword")
						oP.plannedTarget = this.wielder;
						this.wielder.setPlannedAction("attacked", 4);
					}
				// }
				break;
			*/
			//force opponents to aggro onto wielder
			/*
			case "aggro check":
				oP=data['opponent'];
				oP.aggroB +=200;
				oP.peaceB -= 200
				break;
			*/
			//followed by another player
			case "follow target":
				oP=data['opponent'];
				oP.statusMessage = "following SEX SWORD";
				break;
			default:
				super.effect(state, data);
				break;
		}
	}

}















