/*
"turnStart" start of turn
"death" upon death
"attack" attacking another player
"defend" attacked by another player
"dealDmg" dealing damage to another player
"win" killing another player
"lose" killed by another player
"newStatus" new status inflicted
"healDmg" healing damage
"opAware" seeing another player (op)
"surroundingCheck" checking surrondings
"opinionUpdate" updating opinions on players
"planAction" end of action planning phase
"doAction" start of action phase
"turnEnd" end of turn
"endMove" after moving to a location
"awareCheck"
"awareCheckOthers"
	
"aggroCheck" checking aggro against a player
"aggroCheckOthers" aggro effects from oP onto player
"opinionCheck"
"opinionCheckOthers"
*/
class StatMod{
	constructor(name){
		this.name = name;
		this.display_name = this.name[0].toUpperCase() + this.name.substring(1);
		
		this.sightBonus = 0;
		this.visibilityB = 0;
		
		this.rangeBonus = 0;
		this.fightBonus = 1;
		this.dmgReductionB = 1;
		
		this.peaceBonus=0
		this.aggroBonus=0
		this.intimidationBonus=0;
		
		this.moveSpeedB = 1;
		
		this.player = ''
	}
	
	effect(state, data={}){}
	
	//calculating stat bonuses
	calc_bonuses(){
		this.player.sightRangeB += this.sightBonus;
		this.player.visibilityB += this.visibilityB;
		
		this.player.fightRangeB += this.rangeBonus;
		this.player.fightDmgB *= this.fightBonus;
		this.player.dmgReductionB *= this.dmgReductionB;
		
		this.player.peaceB += this.peaceBonus;
		this.player.aggroB += this.aggroBonus;
		this.player.intimidation += this.intimidationBonus;
				
		this.player.moveSpeedB *= this.moveSpeedB;
	}
	
	//calculating item odds
	item_odds(prob, item_type, data={}){}
	
	
	/*-----turn effects-----*/
	//start of turn
	turnStart(data={}){}
	//checking surrondings
	surroundingCheck(data={}){}
	//updating opinions on players
	opinionUpdate(data={}){}
	//end of action planning phase
	planAction(data={}){}
	//start of action phase, before performing
	doActionBefore(action,data={}){}
	//start of action phase
	doActionAfter(action,data={}){}
	//end of turn
	turnEnd(data={}){}	
	//upon dying
	death(data={}){}
	
	//after moving to a location
	endMove(){}
	
	/*-----combat effects-----*/
	//attacking opponent, before damage calc
	attack(opponent, counter, dmg_type, fightMsg={}, data={}){}
	//attacked by opponent, before damage calc
	defend(opponent, counter, dmg_type, fightMsg={}, data={}){}
	//calculating outgoing damage from combat
	dmgCalcOut(opponent, counter, damage, dmg_type, fightMsg){return damage;}
	//calculating incoming damage from combat
	dmgCalcIn(opponent, counter, damage, dmg_type, fightMsg){return damage;}	
	//dealing damage to opponent
	dealDmg(opponent, damage, dmg_type, fightMsg={}, data={}){}
	//killing another player
	win(opponent, data={}){}
	//killed by another player
	lose(opponent, data={}){}
	
	/*-----damage effects-----*/
	//taking damage
	takeDmg(source, data={}){return damage;}
	//healing
	healDmg(source, data={}){return damage;}
	
	//new status effect inflicted
	newStatus(status_eff){return true}
	
	/*-----nearby player effects-----*/
	//oP seen by the player
	opAware(op,data={}){}
	//oP in range of the player
	opInRange(op,data={}){}
	
	//effects when checking awareness of oP
	awareCheck(oP,data={}){}
	//effects from oP when the player is checking awareness on them
	awareCheckOthers(tP,data={}){}
	
	/*-----player calc effects-----*/	
	//effects when calculating opinion score of oP
	opinionCalc(oP, score, data={}){return score;}
	//effects from oP when the player is calculating opinion score on them
	opinionCalcOthers(tP, score, data={}){return score;}
		
	//effects when calculating aggro score of oP
	followCalc(oP, score, data={}){return score;}
	//effects from oP when the player is calculating aggro score on them
	followCalcOthers(tP, score, data={}){return score;}
	
	//effects when calculating aggro score of oP
	aggroCalc(oP, score, data={}){return score;}
	//effects from oP when the player is calculating aggro score on them
	aggroCalcOthers(tP, score, data={}){return score;}
	
	//effects when calculating alliance score of oP
	allyCalc(oP, score, data={}){return score;}
	//effects from oP when the player is calculating alliance score on them
	allyCalcOthers(tP, score, data={}){return score;}
	
	
	//showing in the extra info panel
	show_info(){}
	
	stat_html(){
		let html=""
		if(this.fightBonus != 1)
			html=html+"<span><b>Dmg Bonus:</b>x"+roundDec(this.fightBonus)+"</span><br>"			
		if(this.dmgReductionB != 1)
			html=html+"<span><b>Dmg Reduction:</b>x"+roundDec(this.dmgReductionB)+"</span><br>"		
		if(this.rangeBonus != 0)
			html=html+"<span><b>Range Bonus:</b>"+roundDec(this.rangeBonus)+"</span><br>"		
		if(this.sightBonus != 0)
			html=html+"<span><b>Sight Bonus:</b>"+roundDec(this.sightBonus)+"</span><br>"		
		if(this.visibilityB != 0)
			html=html+"<span><b>Visibility Bonus:</b>"+roundDec(this.visibilityB)+"</span><br>"		
		if(this.peaceBonus != 0)
			html=html+"<span><b>Peace Bonus:</b>"+roundDec(this.peaceBonus)+"</span><br>"		
		if(this.aggroBonus != 0)
			html=html+"<span><b>Aggro Bonus:</b>"+roundDec(this.aggroBonus)+"</span><br>"	
		if(this.intimidationBonus != 0)
			html=html+"<span><b>Intimidation Bonus:</b>"+roundDec(this.intimidationBonus)+"</span><br>"		
		if(this.moveSpeedB != 1)
			html=html+"<span><b>Speed Bonus:</b>x"+roundDec(this.moveSpeedB)+"</span><br>"	
		return html;
	}
	
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
	this.intimidationBonus=0;
	
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
	return '<img class="item_img" src="' + icon +'"></img>';
}

function get_random_item(tP, item_type){
	let odds = []
	if(item_type=='wep'){
		odds = get_weapon_odds(tP)
		log_message(odds)
		return create_weapon(roll(odds))
	}
	if(item_type=='off'){
		odds = get_offhand_odds(tP)
		log_message(odds)
		return create_offhand(roll(odds))
	}
	return '';
}

class Item extends StatMod{
	constructor(name){
		super(name);
		this.icon = "❓";
		this.uses = 0;
		this.player = "";
		this.tradable = true
		this.stealable = true
	}

	equip(player){
		this.player = player;
		// this.player.lastAction = "found " + this.name;
		this.calc_bonuses();
		this.player.statusMessage =  "found " + this.name;
		return true;
	}

	use(){
		this.uses--;
		if(this.uses == 0){
			this.destroy();
		}
	}

	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Uses:</b>"+this.uses+"</span><br>"+
			this.stat_html()+
		"</div>"
				
		$('#extra_info_container').html(item_info);
	}

	destroy(){
		if(extra_info_obj==this){
			deselect_extra_info()
		}
		this.player = "";
	}
}










