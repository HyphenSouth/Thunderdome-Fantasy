function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			return new Nenene(player);
			break;	
		case "cunny":
			return new Cunny(player);
			break;		
		case "joshiraku":
			return new Joshiraku(player);
			break;		
		case "bong":
			return new Bong(player)
			break;
		case "melee":
			return new Melee(player)
			break;
		case "ranger":
			return new Ranger(player)
			break;
		case "magic":
			return new Magic(player)
			break;
		case "bigguy":
			return new BigGuy(player)
			break;
		case "butai":
			return new Butai(player)
			break;
		case "paper":
			return new PaperMaster(player)
			break;
		default:
			return new Attr(attr_name, player)
			break;
	}
}
class Attr{
	constructor(name, player){
		this.name = name;
		this.player = player
		this.display_name = this.name[0].toUpperCase() + this.name.substring(1);
		this.display = true;
		this.has_info = false;
		
		this.sightBonus = 0;
		this.visibilityB = 0;
		this.rangeBonus = 0;
		this.peaceBonus = 0;
		this.aggroBonus = 0;
		this.intimidationBonus = 0;
		
		this.fightBonus = 1;
		this.dmgReductionB = 1;
		this.moveSpeedB = 1;
	}
	
	effect(state, data={}){}
	item_odds(prob,item_type){}
	
	calc_bonuses(){
		this.player.sightRangeB += this.sightBonus
		this.player.visibilityB += this.visibilityB
		this.player.fightRangeB += this.rangeBonus
		this.player.peaceB += this.peaceBonus
		this.player.aggroB += this.aggroBonus
		this.player.intimidation += this.intimidationBonus
												   
		this.player.fightDmgB *= this.fightBonus
		this.player.dmgReductionB *= this.dmgReductionB
		this.player.moveSpeedB *= this.moveSpeedB
	}
	
	show_info(){
		let attr_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			this.attr_html()+
		"</div>"
		
		$('#extra_info_container').html(attr_info);
	}
	
	attr_html(){
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

class Nenene extends Attr{
	constructor(player){
		super("nenene", player);
		this.display=false;
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let name = "Nenene"
				for(let i=0; i<roll_range(0,8); i++){
					name = name+"ne"
				}
				this.player.name = name;
				this.player.div.find('.charText').text(name)
				this.player.tblDiv.find('.info div:first-child b').text(name)
				break;
		}
	}
}

class Joshiraku extends Attr{
	constructor(player){
		super("joshiraku", player);
		this.display=false;
		this.imgs = [
			'https://cdn.myanimelist.net/images/characters/7/173549.jpg',
			'https://cdn.myanimelist.net/images/characters/13/145959.jpg',
			'https://cdn.myanimelist.net/images/characters/13/149113.jpg',
			'https://cdn.myanimelist.net/images/characters/5/177655.jpg',
			'https://cdn.myanimelist.net/images/characters/6/177653.jpg',
		]
	}	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let img = this.imgs[roll_range(0,this.imgs.length-1)]
				this.player.img = img;
				this.player.div.css('background-image', 'url("'+img+'")');
				playerStatic[0].tblDiv.find('img').attr("src", img)
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
					let temp_charm = new Charm(this.player, 2);
					temp_charm.icon = "😭"
					if(Math.random()<0.1){
						temp_charm.aggro = true;
						temp_charm.level=1;
						temp_charm.icon = "💢"
						temp_charm.display_name = "Correction"
					}
					oP.inflict_status_effect(temp_charm);
				}
				break;
		}
	}
	attr_html(){
		let html= super.attr_html()+
		"<span class='desc'>"+
			"<span>Lures in prey with their irresistible cunny scent</span><br>"+	
		"</span>"
		return html;
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
		this.player.lastAction = "tea";
		this.player.statusMessage = "Stops to drink tea";
		this.player.resetPlannedAction();
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(hour == 15){
					this.player.setPlannedAction("tea", 5);
				}
				break;
			case "tea":
				this.tea();
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
	attr_html(){
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
	
	attr_html(){
		let html= super.attr_html()+
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
	attr_html(){
		let html= super.attr_html()+
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
		this.meleeBonus = 1.1
	}
	
	calc_bonuses(){
		if(!this.player.weapon || this.player.weapon.dmg_type=='melee'){
			this.player.fightDmgB *= this.meleeBonus;
		}
		super.calc_bonuses();
	}
	attr_html(){
		let html= super.attr_html()+
			"<span><b>Melee Dmg Bonus:</b>x"+roundDec(this.meleeBonus)+"</span><br>"
		return html;
	}
}


class Butai extends Attr{
	constructor(player){
		super("butai", player);
		this.remade=false;
		this.has_info = true;
		
		this.dmgReductionB =1.1;
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
		this.player.name = name;
		this.player.div.find('.charText').text(name);
		this.player.tblDiv.find('.info div:first-child b').text(name);
		
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

class PaperMaster extends Attr{
	constructor(player){
		super("paper", player);
		this.has_info = true;
		
		this.paper = 30;
	}
		
	effect(state, data={}){
		switch(state){
			case "turnEnd":
				if(this.player.lastAction == "forage success"){
					this.paper += roll_range(50,200)
				}
				
				if(this.paper<0){
					this.paper = 0
				}
			break;
		}
	}
	item_odds(prob,item_type){
		prob.push(['Nothing', 1000])		
	}
	attr_html(){
		let html= 
			"<span><b>Paper:</b>"+this.paper+"</span><br>"
		return html;
	}
}