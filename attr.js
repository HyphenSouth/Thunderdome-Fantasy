class Attr extends StatMod{
	constructor(name, player){
		super(name)
		this.player = player
		this.display = true;
		this.has_info = false;
	}
			
	show_info(){
		let attr_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			this.stat_html()+
		"</div>"
		
		$('#extra_info_container').html(attr_info);
	}
}

class ProfileSwap extends Attr{
	constructor(name, player, imgs, names, sync_profile, random_img, random_name){
		super(name, player);
		this.imgs = imgs
		this.names = names
		this.sync_profile = sync_profile	//sync names with images	
		this.random_img = random_img
		this.random_name = random_name
		
		this.display=false;
		this.img_index=0
		this.name_index=0
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let new_img = ''
				let img_num = 0
				if(this.random_img){ 
					img_num = roll_range(0,this.imgs.length-1)
					new_img = this.imgs[img_num]
				}
				else{
					img_num = this.img_index
					this.img_index = (this.img_index + 1)%this.imgs.length
				}
				this.player.change_img(this.imgs[img_num])
				
				let new_name = ''
				if(this.sync_profile){
					new_name = this.names[img_num]
				}
				else{
					if(this.random_name){ 
						new_name = this.names[roll_range(0,this.names.length-1)]
					}
					else{
						new_name = this.names[this.name_index]
						this.name_index = (this.name_index + 1)%this.names.length
					}
				}
				this.player.change_name(new_name)
				
				break;
		}
	}		
}

class ImgSwap extends Attr{
	constructor(name, player, imgs, random_img){
		super(name, player);
		this.imgs = imgs
		this.random_img = random_img
		this.display=false;
		this.img_index=0
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let new_img = ''
				if(this.random_img){ 
					new_img = this.imgs[roll_range(0,this.imgs.length-1)]
				}
				else{
					new_img = this.imgs[this.img_index]
					this.img_index = (this.img_index + 1)%this.imgs.length
				}
				this.player.change_img(new_img)
				break;
		}
	}	
}

class NameSwap extends Attr{
	constructor(name, player, names, random_name){
		super(name, player);
		this.names = names
		this.random_name = random_name
		this.display=false;
		this.name_index=0
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let new_name = ''
				if(this.random_name){ 
					new_name = this.names[roll_range(0,this.names.length-1)]
				}
				else{
					new_name = this.names[this.name_index]
					this.name_index = (this.name_index + 1)%this.names.length
				}
				this.player.change_name(new_name)
				break;
		}
	}	
}

class Cunny extends Attr{
	constructor(player){
		super("cunny", player);
		this.moveSpeedB = 1.5
		this.intimidationBonus = -10
		this.has_info = true;
	}
	
	effect(state, data={}){
		switch(state){
			case "opAware":
				let oP=data['opponent'];
				if (Math.random() < 0.05){
					let temp_charm = new Charm(this.player, 4);
					temp_charm.icon = "😭"
					if(Math.random()<0.1){
						temp_charm.aggro = true;
						temp_charm.level=2;
						temp_charm.icon = "💢"
						temp_charm.display_name = "Correction"
					}
					oP.inflict_status_effect(temp_charm);
				}
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
		"<span class='desc'>"+
			"<span>Lures in prey with their irresistible cunny scent</span><br>"+	
		"</span>"
		return html;
	}
}

class TeaAction extends Action{
	constructor(player, data){
		super("tea", player);
		this.attr = data.attr
	}
	perform(){
		this.attr.tea();
	}
}

//drinks tea at 3
class Bong extends Attr{
	constructor(player){
		super("bong", player);
	}
	tea(){
		this.player.energy += this.player.maxEnergy*0.5;
		this.player.health += this.player.maxHealth*0.3;
		this.player.lastActionState = "tea";
		this.player.statusMessage = "Stops to drink tea";
		// this.player.resetPlannedAction();
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(hour == 15){
					this.player.setPlannedAction("tea", 5, {"class":TeaAction,"attr":this});
				}
				break;
		}
	}
}

class Melee extends Attr{
	constructor(player){
		super("melee", player);
		this.unarmedBonus = 1.05;
		this.armedBonus = 1.1;
		this.has_info = true;
	}
	calc_bonuses(){
		if(!this.player.weapon){
			this.player.fightDmgB *= this.unarmedBonus ;
		}
		else{
			if(this.player.weapon.dmg_type=='melee'){
				this.player.fightDmgB *= this.armedBonus ;
			}
		}
	}
	stat_html(){
		let html=
			"<span><b>Unarmed Bonus:</b>x"+roundDec(this.unarmedBonus)+"</span><br>"+
			"<span><b>Melee Weapon Bonus:</b>x"+roundDec(this.armedBonus)+"</span><br>"
		return html;
	}
}
class Ranger extends Attr{
	constructor(player){
		super("ranger", player);
		this.has_info = true;
		
		this.sightBonus = 10;
		
		this.armedRangeBonus = 10;		
		this.armedFightBonus = 1.1;

	}
	
	calc_bonuses(){
		if(this.player.weapon && this.player.weapon.dmg_type=='ranged'){
			this.player.fightDmgB *= this.armedFightBonus;
			this.player.fightRangeB += this.armedRangeBonus;
		}
		super.calc_bonuses();
	}
	
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Weapon Dmg Bonus:</b>x"+roundDec(this.armedFightBonus)+"</span><br>"+
			"<span><b>Weapon Range Bonus:</b>"+roundDec(this.armedRangeBonus)+"</span><br>"
		return html;
	}
}
class Magic extends Attr{
	constructor(player){
		super("magic", player);
		this.has_info = true;
		
		this.armedFightBonus = 1.2;
		this.armedRangeBonus = 10;		
	}	
	calc_bonuses(){
		if(this.player.weapon && this.player.weapon.dmg_type=='magic'){
			this.player.fightDmgB *= this.armedFightBonus;
			this.player.fightRangeB += this.armedRangeBonus;
		}
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Weapon Dmg Bonus:</b>x"+roundDec(this.armedFightBonus)+"</span><br>"+
			"<span><b>Weapon Range Bonus:</b>"+roundDec(this.armedRangeBonus)+"</span><br>"
		return html;
	}
}

class BigGuy extends Attr{
	constructor(player){
		super("bigguy", player);		
		this.has_info = true;
		
		this.visibilityB = 30;
		this.intimidationBonus = 15;
		this.dmgReductionB = 0.9;
		this.moveSpeedB = 0.75;		
		// this.meleeBonus = 1.1
	}
	
	// calc_bonuses(){
		// if(!this.player.weapon || this.player.weapon.dmg_type=='melee'){
			// this.player.fightDmgB *= this.meleeBonus;
		// }
		// super.calc_bonuses();
	// }
	// stat_html(){
		// let html= super.stat_html()+
			// "<span><b>Melee Dmg Bonus:</b>x"+roundDec(this.meleeBonus)+"</span><br>"
		// return html;
	// }
}

class Butai extends Attr{
	constructor(player){
		super("butai", player);
		this.remade=false;
		this.has_info = true;
		
		this.fightBonus = 0.95;
		this.dmgReductionB =1.1;
		this.moveSpeedB = 0.9;
	}
		
	effect(state, data={}){
		switch(state){
			case "death":
				if(!this.remade){
					this.revive()
				}
			break;
		}
	}
	revive(){
		this.remade=true;
		
		//fake death
		$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + this.player.img + "'></img><del>" + this.player.death + "</del></td>>");
		this.player.death = '';
		this.player.dead = false;
		
		//update status
		this.player.statusMessage = '✨I AM REMADE✨';
		pushMessage(this.player, '✨'+this.player.name+' IS REMADE✨');
		
		//change name
		let name = "✨" + this.player.name
		this.player.change_name(name)
		// this.player.name = name;
		// this.player.div.find('.charText').text(name);
		// this.player.tblDiv.find('.info div:first-child b').text(name);
		
		//set health
		this.player.maxHealth = this.player.maxHealth*0.5;
		this.player.health = this.player.maxHealth;

		this.player.resetPlannedAction();
		
		//clear status
		this.player.status_effects.forEach(function(eff){
			if(eff.name!='hinamizawa'){
				eff.wear_off();
			}			
		});
		
		//stat increase
		this.fightBonus = 1.25;
		this.dmgReductionB =0.9;
		this.moveSpeedB = 2;
		this.intimidationBonus = 20;
	}
}

class Meido extends Attr{
	constructor(player){
		super("meido", player);
	}
	effect(state, data={}){
		switch(state){
			case "death":
				this.player.death += " (not canon)"
			break;
		}
	}
}

class Ninja extends Attr{
	constructor(player){
		super("ninja", player);		
		this.has_info = true;
		
		this.visibilityB = -50;
		this.dmgReductionB = 1.05;
		this.moveSpeedB = 1.2;
		this.sightBonus = 10
		
		this.surpriseBonus = 1.1
		
		this.escape_speed = 2
		this.escape_vis = -80
		this.escape_dmg = 0.8
	}
	
	calc_bonuses(){
		if(this.player.plannedAction=="playerEscape" || this.player.plannedAction=="terrainEscape"){
			this.player.moveSpeedB *= this.escape_speed;
			this.player.visibilityB += this.escape_vis;
			this.player.dmgReductionB *= this.escape_dmg;
		}
		else{
			super.calc_bonuses();
		}
	}
	
	effect(state, data={}){
		switch(state){
			case "attack":
				let oP=data['opponent'];
				if(!(oP.awareOf.indexOf(this.player)>=0)){
					this.player.fightDmgB *= this.surpriseBonus
					this.player.statusMessage = 'sneaks up on ' + oP.name;
				}				
				break;
		}
	}
	
}

class Gauron extends Attr{
	constructor(player){
		super("gauron", player);
		this.has_info = true;		
		this.dmgReductionB =4;
		
		this.revives=0;
		this.revive_chance=100; //percent
	}
	effect(state, data={}){
		switch(state){
			case "death":
				if(roll_range(1,100)<=this.revive_chance)
					this.revive()
				else
					this.player.death += " (for real)"
			break;
		}
	}
	revive(){
		this.revives++;
		this.revive_chance-=1;
		
		//fake death
		$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + this.player.img + "'></img><del>" + this.player.death + "</del></td>>");
		this.player.death = '';
		this.player.dead = false;
		
		//update status
		pushMessage(this.player, this.player.name +' escapes death');

		
		//set health
		this.player.maxHealth = Math.max(this.player.maxHealth-2, 1);
		this.player.health = this.player.maxHealth;

		this.player.resetPlannedAction();
		
		//clear status
		this.player.status_effects.forEach(function(eff){
			if(eff.name!='hinamizawa'){
				eff.wear_off();
			}			
		});
		
		//stat increase
		this.dmgReductionB *=1.1;
		this.intimidationBonus += 3;
	}
		stat_html(){
		let html= super.stat_html()+
			"<span><b>Deaths:</b>"+this.revives+"</span><br>"+
			"<span><b>Death Chance:</b>"+(100-this.revive_chance)+"%</span><br>"
		return html;
	}
}












