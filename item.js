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










