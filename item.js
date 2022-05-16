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
	return '<img class="item_img" src="' + icon +'"></img>';
}

function create_offhand(offhand_name){
	return "";
}

class Item{
	constructor(name){
		this.name = name;
		this.display_name = this.name[0].toUpperCase() + this.name.substring(1);
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
	
	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"+
			"<span><b>Uses:</b>"+this.uses+"</span><br>"+
			this.item_html()+
		"</div>"
		
		/*
		if(this.fightBonus != 1)
			item_info=item_info+"<span><b>Dmg Bonus:</b>x"+this.fightBonus+"</span><br>"			
		if(this.dmgReductionB != 1)
			item_info=item_info+"<span><b>Dmg Reduction:</b>x"+this.dmgReductionB+"</span><br>"		
		if(this.rangeBonus != 0)
			item_info=item_info+"<span><b>Range Bonus:</b>"+this.rangeBonus+"</span><br>"		
		if(this.sightBonus != 0)
			item_info=item_info+"<span><b>Sight Bonus:</b>"+this.sightBonus+"</span><br>"		
		if(this.visibilityB != 0)
			item_info=item_info+"<span><b>Visibility Bonus:</b>"+this.visibilityB+"</span><br>"		
		if(this.peaceBonus != 0)
			item_info=item_info+"<span><b>Peace Bonus:</b>"+this.peaceBonus+"</span><br>"		
		if(this.aggroBonus != 0)
			item_info=item_info+"<span><b>Aggro Bonus:</b>"+this.aggroBonus+"</span><br>"		
		if(this.moveSpeedB != 1)
			item_info=item_info+"<span><b>Speed Bonus:</b>x"+this.aggroBonus+"</span><br>"		
		*/
				
		$('#extra_info_container').html(item_info);
	}
	
	item_html(){
		let html=""
		
		if(this.fightBonus != 1)
			html=html+"<span><b>Dmg Bonus:</b>x"+this.fightBonus+"</span><br>"			
		if(this.dmgReductionB != 1)
			html=html+"<span><b>Dmg Reduction:</b>x"+this.dmgReductionB+"</span><br>"		
		if(this.rangeBonus != 0)
			html=html+"<span><b>Range Bonus:</b>"+this.rangeBonus+"</span><br>"		
		if(this.sightBonus != 0)
			html=html+"<span><b>Sight Bonus:</b>"+this.sightBonus+"</span><br>"		
		if(this.visibilityB != 0)
			html=html+"<span><b>Visibility Bonus:</b>"+this.visibilityB+"</span><br>"		
		if(this.peaceBonus != 0)
			html=html+"<span><b>Peace Bonus:</b>"+this.peaceBonus+"</span><br>"		
		if(this.aggroBonus != 0)
			html=html+"<span><b>Aggro Bonus:</b>"+this.aggroBonus+"</span><br>"		
		if(this.moveSpeedB != 1)
			html=html+"<span><b>Speed Bonus:</b>x"+this.aggroBonus+"</span><br>"	
		
		return html;
	}
	
	destroy(){
		if(extra_info_obj==this){
			deselect_extra_info()
			this.wielder = "";
		}		
	}
}










