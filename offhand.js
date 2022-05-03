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
		"uses": [2,5],
		"dmgReductionB":0.5,
		"useStates":["defend"]
	},
	"recoil" : {
		// "icon":"🛡️",
		"icon" : "./icons/recoil.png",
		"icon_type" : "img",
		"dmgReductionB":0.75,
		"uses": 50,
	}
	
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
		case "recoil":
			return new Recoil();
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

function get_offhand_odds(tP){
	let offhandOdds = [["bomb",5],["trap",20],["shield",20],["recoil", 15],["Nothing",400]];
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
	

	equip(wielder){
		this.wielder = wielder;
		// this.wielder.lastAction = "found " + this.name;
		this.calc_bonuses();
		this.wielder.statusMessage =  "found " + this.name;
		return true;
	}
	
	replace_offhand(new_item){
		this.wielder.weapon=new_item;
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
		this.wielder.wielder = "";
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
		this.wielder.offhand="";
		this.wielder="";
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
		this.wielder.offhand="";
		this.wielder="";
		doodads.push(tempTrap);
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
					oP.take_damage(recoil_dmg, "", "recoil")
					log_message(this.wielder.name + " recoil on " + oP.name + " "+ recoil_dmg);
					if(oP.health<0){
						oP.death = "beat themselves to death"
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
}








