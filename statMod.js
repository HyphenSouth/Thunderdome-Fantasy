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
	effect_calc(state, x, data={}){return x}
	
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
	//args: action
	doActionBefore(data={}){}
	//start of action phase
	//args: action
	doActionAfter(data={}){}
	//end of turn
	turnEnd(data={}){}	
	//upon dying
	death(data={}){}
	
	//after moving to a location
	endMove(){}
	
	/*-----combat effects-----*/
	//attacking opponent, before damage calc
	//args: opponent, counter, dmg_type, fightMsg={}
	attack(data={}){}
	//attacked by opponent, before damage calc
	//args: opponent, counter, dmg_type, fightMsg={}
	defend(data={}){}
	//calculating outgoing damage from combat
	//args: opponent, counter, dmg_type, fightMsg
	dmgCalcOut(damage, data={}){return damage;}
	//calculating incoming damage from combat
	//args: opponent, counter, dmg_type, fightMsg
	dmgCalcIn(damage, data={}){return damage;}	
	//dealing damage to opponent
	//args: opponent, damage, dmg_type, fightMsg={}
	dealDmg(data={}){}
	//killing another player
	//args: opponent
	win(data={}){}
	//killed by another player
	//args: opponent
	lose(data={}){}
	
	/*-----damage effects-----*/
	//taking damage
	//args: source
	takeDmg(data={}){return damage;}
	//healing
	//args: source
	healDmg(data={}){return damage;}
	
	//new status effect inflicted
	//args: status_eff
	newStatus(){return true}
	
	/*-----nearby player effects-----*/
	//oP seen by the player
	//args: oP
	opAware(data={}){}
	//oP in range of the player
	//args: oP
	opInRange(data={}){}
	
	//effects when checking awareness of oP
	//args: oP
	awareCheck(data={}){}
	//effects from oP when the player is checking awareness on them
	//args: tP
	awareCheckOthers(data={}){}
	
	/*-----player calc effects-----*/	
	//effects when calculating opinion score of oP
	//args: oP
	opinionCalc(score, data={}){return score;}
	//effects from oP when the player is calculating opinion score on them
	//args: tP
	opinionCalcOthers(score, data={}){return score;}
		
	//effects when calculating aggro score of oP
	//args: oP, follow_type
	followCalc(score, data={}){return score;}
	//effects from oP when the player is calculating aggro score on them
	//args: tP, follow_type
	followCalcOthers(score, data={}){return score;}
	
	//effects when calculating aggro score of oP
	//args: oP
	aggroCalc(score, data={}){return score;}	
	//effects from oP when the player is calculating aggro score on them
	//args: tP
	aggroCalcOthers(score, data={}){return score;}
	
	//effects when calculating danger levels on oP
	//args: coords
	playerDangerCalc(score, data={}){return score;}
	//effects from oP when the player is calculating danger levels on them
	//args: tP, coords
	playerDangerCalcOther(score, data={}){return score;}
	
	//effects when calculating area danger levels
	//args: coords
	dangerCalc(score, data={}){return score;}
	
	//effects when calculating alliance score of oP
	//args: oP
	allyCalc(score, data={}){return score;}
	//effects from oP when the player is calculating alliance score on them
	//args: tP
	allyCalcOthers(score, data={}){return score;}
	
	/*-----alliance effects-----*/	
	//calculating opinions between alliance member
	allianceUnityUpdate(score, data={}){return score;}
	//calculating opinions between alliance member
	//args:opponent
	allianceOpinionCalc(score, data={}){return score;}
	//alliance disbanded
	allianceDisband(data={}){}
	//leaving alliance
	allianceLeave(data={}){}
	//calculating whether to leave alliance
	//positive number reduces chances
	allianceLeaveCalc(x, data={}){return x}
	
	
	
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

function create_weapon(weapon_name){
	if(weapon_name in weapon_data){
		if('class' in weapon_data[weapon_name]){
			return new weapon_data[weapon_name]['class']()			
		}
		else{
			return new Weapon(weapon_name);
		}
	}
	return weapon_name;
}

function create_offhand(offhand_name){
	if(offhand_name in offhand_data){
		if('class' in offhand_data[offhand_name]){
			return new offhand_data[offhand_name]['class']()			
		}
		else{
			return new Offhand(offhand_name);
		}
	}
	if(offhand_name=='food'){
		let foodOdds = defaultFoodOdds.slice();
		let food_name = roll(foodOdds)
		return create_food(food_name);
	}
	return offhand_name;
}

function create_food(food_name){
	if(food_name in food_data){
		if('class' in food_data[food_name]){
			return new food_data[food_name]['class']()			
		}
		else{
			return new Food(food_name);
		}
	}
	return food_name;
}

function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			let nenenames = ['Nenene']
			let temp_nenename = "Nenene"
			for(let i=0; i<8; i++){
				temp_nenename = temp_nenename+"ne"
				nenenames.push(temp_nenename)
			}
			return new NameSwap('nenene', player, nenenames, true);
			break;	
		case "joshiraku":
			let joshiraku_imgs = [
				'https://cdn.myanimelist.net/images/characters/7/173549.jpg',
				'https://cdn.myanimelist.net/images/characters/13/145959.jpg',
				'https://cdn.myanimelist.net/images/characters/13/149113.jpg',
				'https://cdn.myanimelist.net/images/characters/5/177655.jpg',
				'https://cdn.myanimelist.net/images/characters/6/177653.jpg'
			]
			return new ImgSwap('joshiraku', player, joshiraku_imgs, true);
			break;				
		case "fine":
			let fine_imgs = [
				'https://cdn.myanimelist.net/images/characters/7/153361.jpg',
				'https://cdn.discordapp.com/attachments/998843166138572821/998848743195541544/85247717b553c5cd3cb94be297def926.png'				
			]
			let fine_names = [
				'Ryouko','Fine'
			]
			return new ProfileSwap('fine', player, fine_imgs,fine_names, true, true, false);
			break;
		case "puchi":
			let puchi_imgs = [
				'https://cdn.myanimelist.net/images/characters/5/242497.jpg',
				'https://cdn.myanimelist.net/images/characters/16/249335.jpg',
				'https://cdn.myanimelist.net/images/characters/7/243273.jpg',
				'https://cdn.myanimelist.net/images/characters/9/243031.jpg',
				'https://cdn.discordapp.com/attachments/998843166138572821/1009613528585486397/1584302796574.png',
				'https://cdn.myanimelist.net/images/characters/3/244887.jpg',
				'https://cdn.myanimelist.net/images/characters/9/243271.jpg',
				'https://cdn.myanimelist.net/images/characters/11/245881.jpg',
				'https://cdn.myanimelist.net/images/characters/7/245885.jpg',
				'https://cdn.myanimelist.net/images/characters/5/242495.jpg',
				'https://cdn.myanimelist.net/images/characters/12/249377.jpg',
				'https://cdn.myanimelist.net/images/characters/6/243891.jpg',
				'https://cdn.myanimelist.net/images/characters/9/247897.jpg',
				'https://cdn.myanimelist.net/images/characters/5/245347.jpg'
			]
			let puchi_names = [
				'Harukasan',
				'Afu',
				'Yukipo',
				'Yayo',
				'Takanya',
				'Miurasan',
				'Makochi',
				'Smol Shart',
				'Smol Fart',
				'Io',
				'Chihya',				
				'Chicchan',				
				'Chibiki',				
				'PiyoPiyo'		
			]
			return new ProfileSwap('puchi', player, puchi_imgs,puchi_names, true, true, false);
			break;
		case "im@s":
			let idol_imgs = [
					'https://cdn.myanimelist.net/images/characters/13/425143.jpg',
					'https://cdn.myanimelist.net/images/characters/14/140081.jpg',
					'https://cdn.myanimelist.net/images/characters/11/134645.jpg',
					'https://cdn.myanimelist.net/images/characters/4/117962.jpg',
					'https://cdn.discordapp.com/attachments/998843166138572821/1009615366739197982/unknown.png',
					'https://cdn.discordapp.com/attachments/998843166138572821/1009615516287127552/d7059e448a885ff0b350edc420005eba.jpg',
					'https://cdn.myanimelist.net/images/characters/14/193795.jpg',
					'https://cdn.myanimelist.net/images/characters/16/134635.jpg',
					'https://cdn.myanimelist.net/images/characters/3/139929.jpg',
					'https://cdn.myanimelist.net/images/characters/13/126935.jpg',
					'https://cdn.myanimelist.net/images/characters/13/118310.jpg',
					'https://cdn.myanimelist.net/images/characters/6/118317.jpg',
					'https://cdn.myanimelist.net/images/characters/14/140079.jpg',
					'https://cdn.myanimelist.net/images/characters/5/298464.jpg',
			]
			let idol_names = [
				'Haruka',
				'Takane',
				'Yayoi',
				'Azusa',
				'Anal',
				'Chihaya',
				'Makoto',
				'Miki',
				'Yukiho',
				'Hibiki',
				'Fart',
				'Shart',
				'Ritsuko',
				'Kotori',
			]
			return new ProfileSwap('im@s', player, idol_imgs,idol_names, true, true, false);
			break;
		default:
			if(attr_name in attr_data){
				return new attr_data[attr_name](player)
			}
			return new Attr(attr_name, player)
			break;
	}
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










