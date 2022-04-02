var offhand_data = {
	"bomb" : {
		"icon":"💣",
		"uses": 1
	},
	"trap" : {
		"icon":"🕳", 
		"uses" : 1		
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

class Offhand extends Item{
	constructor(name){
		super(name);

		
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
		switch(state){			
			case "turnStart":
				break;
			case "death":
				break;

		}
	}
    destroy(){
		log_message(this.wielder.name +"'s " + this.name+" breaks");
		this.wielder.offhand_data = "";   
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
		switch(state){			
			case "endMove":
				if(roll([['use',20],['notuse',100]]) == 'use'){
					log_message(this.wielder.name + " plants a bomb");
					pushMessage(this.wielder, this.wielder.name + " plants a bomb")
					this.use();
				}
				break;
			case "death":
				//drop bomb on death
				let tempBomb = new BombEntity(this.wielder.x, this.wielder.y,this.wielder);
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
				if(roll([['use',20],['notuse',100]]) == 'use'){
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














