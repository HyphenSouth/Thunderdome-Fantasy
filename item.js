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
	
	destroy(){}
}

