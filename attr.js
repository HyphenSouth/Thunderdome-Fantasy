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

class Brat extends Attr{
	constructor(player){
		super("brat", player);
		this.moveSpeedB = 1.5
		this.intimidationBonus = -10
		this.has_info = true;
	}
	
	effect(state, data={}){
		switch(state){
			case "opAware":
				let oP=data['opponent'];
				if (Math.random() < 0.03){
					let temp_charm = new Charm(this.player, 3);					
					temp_charm.icon = "💢";
					temp_charm.display_name = "Correction";
					oP.inflict_status_effect(temp_charm);
				}
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
		"<span class='desc'>"+
			"<span>Damn bratty kid</span><br>"+	
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
		// this.attr.tea();
		this.player.energy += this.player.maxEnergy*0.5;
		this.player.health += this.player.maxHealth*0.3;
		this.player.lastActionState = "tea";
		this.player.statusMessage = "Stops to drink tea";
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
					this.player.setPlannedAction("tea", 5, TeaAction, {"attr":this});
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
	effect_calc(state, x, data={}){
		let oP=''
		let alliance=''
		switch(state){
			case "opinionCalc":
			case "allyCalc":
				oP=data.opponent;
				if(oP.has_attr('meido')){
					x+=100;
					log_message('meido friendship');
				}
				break;
			case "followCalc":
				oP=data.opponent;
				let follow_type = data.follow_type;
				if(oP.has_attr('meido')){
					if(follow_type=='aggro')
						x-=100;
					else if(follow_type=="def")
					x+=100;
				}
				break;
			case "aggroCalc":
				oP=data.opponent;
				if(oP.has_attr('meido')){
					x-=100;		
					log_message('meido aggro reduce');			
				}
					
				break;
			case "allianceLeaveCalc":
				alliance=data.alliance;
				log_message(this.player.name)
				log_message(alliance)
				alliance.members.forEach(function(member){
					if(member.has_attr('meido')){	
						x+=100;
					}
				})
				break;
			case "allianceUnityUpdate":
				alliance=data.alliance;
				log_message(alliance)
				alliance.members.forEach(function(member){
					if(member.has_attr('meido')){	
						x+=20;
					}
				})
				break;
		}
		return x
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
		this.dmgReductionB =3;
		
		this.revives=0;
		this.revive_chance=100; //percent
		this.revival_names = [
			'Gauron the unbeatable', 
			'Gauron the undefeated', 
			'Gauron the unkillable', 
			'Gauron the deathless',
			'Gauron the invincible',
			'Gauron the undying', 
			'Gauron the immortal', 
			'Gauron the eternal', 
			]
		this.revival_imgs = [
			'https://cdn.discordapp.com/attachments/998843166138572821/1022220185391861831/FaceApp_1663394335621.jpg',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022227840848117800/gauron2.png',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022231378005348392/gauron3.png',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022227841619853332/gauron4.png',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022227842127380490/gauron5.png',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022227842576175114/gauron6.png',
			// 'https://cdn.discordapp.com/attachments/998843166138572821/1022227882858254446/FaceApp_1663394524933.jpg',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022233822647038062/FaceApp_1663394524933.png',
			'https://cdn.discordapp.com/attachments/998843166138572821/1022244467765411941/gauron_the_immortal.gif',
		]
		this.revival_milestones = [1,2,3,5,8,10,13,16]
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
		
		//change name
		let revive_index = this.revival_milestones.indexOf(this.revives)
		if(revive_index!=-1){
			this.player.change_name(this.revival_names[revive_index])
			this.player.change_img(this.revival_imgs[revive_index])
		}
		
		//fake death
		$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + this.player.img + "'></img><del>" + this.player.death + "</del></td>>");
		this.player.death = '';
		this.player.dead = false;
		
		//update status
		pushMessage(this.player, this.player.name +' escapes death');

		
		//set health
		this.player.maxHealth = Math.max(this.player.maxHealth-5, 5);
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
		this.intimidationBonus += 5;
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Deaths:</b>"+this.revives+"</span><br>"+
			"<span><b>Death Chance:</b>"+(100-this.revive_chance)+"%</span><br>"
		return html;
	}
}

class AidsAttr extends Attr{
	constructor(player){
		super("aids", player);
		this.has_info = true;		
		this.infections = 0
		this.player.inflict_status_effect(new AidsStatus(10,"", "parent"))
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let eff = this.player.get_status_effect("aids")
				if(!eff)
					this.player.inflict_status_effect(new AidsStatus(10,"", "parent"));
				else
					this.infections = eff.infections;
			break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Infections:</b>"+this.infections+"</span><br>"
		return html;
	}
}

class Band extends Attr{
	constructor(player){
		super("band", player);
		// this.guitar_dmg = 1.2;
		this.has_info=true;
	}	
	effect(state, data={}){
		switch(state){
			case "doActionAfter":
				if(!(this.player.currentAction instanceof ForageAction))
					return;
				if(this.player.lastActionState=="forage weapon"){
					if(this.player.weapon.name=="guitar"){
						this.player.weapon.uses=3;
						this.player.weapon.fightBonus=1.8;
					} 
				}
				super.effect(state,data);
				break;
		}
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				if(data.item_type=='wep'){
					x.push(["guitar",150]);
				}
				break;
		}
		return x
	}
	stat_html(){
		let html= super.stat_html()+
		// "<span><b>Bonus Guitar Damage:</b>"+this.guitar_dmg+"</span><br>"+
		"<span class='desc'>"+
			"<span>WADDA FULL</span><br>"+	
		"</span>"
		return html;
	}
}

class Kurt extends Band{
	constructor(player){
		super(player);
		this.name = "kurt"
		this.display_name="Kurt"
	}
	// item_odds(prob, item_type, data={}){
		// if(item_type=='wep'){
			// prob.push(["guitar",500]);
			// prob.push(["shotgun", 600]);
		// }
	// }
	effect(state, data={}){
		switch(state){
			case "turnStart":
				if(this.player.weapon instanceof Shotgun){
					this.player.health = 0;
					this.player.death = "shoots himself in the face";
				}				
				super.effect(state,data);
				break;
			default:
				super.effect(state,data)
				break;
		}
	}
	
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				if(data.item_type=='wep'){
					x=[["guitar",500],["shotgun", 600]]
				}
				break;
		}
		return x
	}
}

class FunnyWagon extends Attr{
	constructor(player){
		super("wagon", player);
		// this.has_info=true;
		this.moveSpeedB = 2;
		this.start_point = [];
		this.original_name = this.player.name;
		this.original_img = this.player.img
		this.fire_img = "https://cdn.discordapp.com/attachments/998843166138572821/1034708217441288222/WANYUUDOU_FIRE2.png"
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.start_point = [];
				this.player.change_img(this.original_img)
				this.player.change_name(this.original_name)
				break;
			case "doActionBefore":
				if(data.action instanceof MoveAction)
					this.start_point = [this.player.x, this.player.y]
				break;
			case "doActionAfter":
				if(data.action instanceof MoveAction){
					let move_dist = hypD(this.player.x - this.start_point[0], this.player.y - this.start_point[1])
					// log_message('FUNNY '+move_dist)
					if(move_dist>30){
						let move_line = new Line({"p1":this.start_point,"p2":[this.player.x, this.player.y]})
						let fire_count = 1 + move_dist/15
						for(let i=0; i<fire_count; i++){
							let rand_x = roll_range(this.start_point[0], this.player.x);
							let rand_y = move_line.getY(rand_x)
							let tempFire = new FireEntity(rand_x, rand_y, this.player);
							tempFire.duration = 2;
							createDoodad(tempFire);
							// tempFire.draw();
							// doodads.push(tempFire);	
						}
						this.player.change_img(this.fire_img);
						this.player.change_name("🔥" + this.original_name + "🔥");
					}
				}
				break;
			default:
				super.effect(state,data)
				break;
		}
	}
}

class Elfen extends Attr{
	constructor(player){
		super("elfen", player);
		// this.has_info=true;
		this.rangeBonus = 30;
		this.base_chop_chance = 40;
		this.max_reduction = 5
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "dmgCalcOut":
				if(x<=0)
					return x
				this.chop_limb(data.opponent, data.fightMsg)				
				break;
			case "dmgCalcIn":
				let reduction = roll_range(0,this.max_reduction);
				if(reduction>0){
					if(reduction <= x)
						x = x - reduction;
					else{
						reduction = x;
						x=0;						
					}
					data.fightMsg.events.push(this.player.name + "'s arms block "+ reduction +" damage");
				}				
		}
		return x;
	}
	chop_limb(oP, fightMsg){
		//CHOPPEM
		let eff = oP.get_status_effect('chopped')
		let chop_chance = this.base_chop_chance/5;
		if(eff)
			chop_chance = Math.min(chop_chance + eff.last_chopped*2, this.base_chop_chance);
		else
			chop_chance = this.base_chop_chance;
		let limb = roll([['left arm',1],['right arm',1],['left leg',1],['right leg',1]]);
		if(roll_range(0,99)<chop_chance){
			oP.inflict_status_effect(new Chopped(limb))
			fightMsg.events.push(this.player.name + " chops off " + oP.name + "'s " + limb);
			this.player.statusMessage = "chops off " + oP.name + "'s " + limb;
			oP.statusMessage = "has thier " + limb + " chopped off by " + this.player.name;		
		}	
	}
}

class Lucy extends Elfen{
	constructor(player){
		super(player);
		this.name = "lucy"
		this.display_name = "Schizo"
		this.has_info = true;
		// this.has_info=true;
		this.base_chop_chance = 80;		
		this.lucy_img = 'https://static.tvtropes.org/pmwiki/pub/images/elfen_lied___lucy_by_d_jien_5870.jpg';
		this.nyuu_img = 'https://cdn.myanimelist.net/images/characters/13/329265.jpg';
		this.ded = 'https://cdn.discordapp.com/attachments/998843166138572821/1034301527420063825/unknown.png';
		
		this.lucy_mode = true;
		this.fightBonus = 1.5;
		this.rangeBonus = 20;
		this.aggroBonus = 50;
		this.peaceBonus = 0;
		
		this.lucy_meter = 80;
	}
	mode_switch(){
		//switch to nyuu
		if(this.lucy_mode){
			this.lucy_mode = false
			this.rangeBonus = 0;
			this.aggroBonus = 0;
			this.peaceBonus = 50;
			this.fightBonus = 0.75;
			this.player.change_name('Nyuu')
			this.player.change_img(this.nyuu_img )	
		}
		//switch to lucy
		else{
			this.lucy_mode = true;
			this.fightBonus = 1.5;
			this.rangeBonus = 20;
			this.aggroBonus = 50;
			this.peaceBonus = 0;
			this.player.change_name('Lucy')
			this.player.change_img(this.lucy_img )
		}
		this.lucy_meter=0;
	}
	//increase lucy meter when dealing and taking damage
	effect(state, data={}){
		switch(state){			
			case "turnStart":
				this.lucy_meter += 1;
				if(this.lucy_meter>=100)
					this.mode_switch();
				break;
			case "takeDmg":
				if(this.lucy_mode)
					this.lucy_meter += data.damage * 0.5;
				else
					this.lucy_meter += data.damage * 1.2;
				break;
			case "dealDmg":
				if(this.lucy_mode)
					this.lucy_meter += data.damage * 0.01;
				else
					this.lucy_meter += data.damage * 0.5;
				break;
			case "death":
				this.player.change_img(this.ded);
				break;
			default:
				super.effect(state,data)
				break;
		}
	}
	
	effect_calc(state, x, data={}){
		if(!this.lucy_mode)
			return x;
		else
			return super.effect_calc(state, x, data);
		return x;
	}
	stat_html(){
		let html= super.stat_html()
		if(this.lucy_mode){
			html+= "<span><b>Lucy:</b>"+ Math.round(100 - this.lucy_meter) +"%</span><br>"
		}
		else{
			html+= "<span><b>Lucy:</b>"+ Math.round(this.lucy_meter) +"%</span><br>"
		}

		return html;
	}
}

class Witch extends Attr{
	constructor(player){
		super("witch", player);
	}	

	effect(state, data={}){		
		switch(state){
			case "doActionBefore":
				if(!this.player.weapon)
					return;
				if(this.player.weapon.name != 'rake')
					return;
				if(!this.flying && (this.player.currentAction instanceof MoveAction)){
					if(Math.random()<0.6){						
						this.player.inflict_status_effect(new Flight(3, this));
					}
				}					
				break;
		}
	}
	
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				if(data.item_type=='wep'){
					x.push(["rake",20]);
				}
				break;
		}
		return x
	}
}

class Retard extends Attr{
	constructor(player){
		super("retard", player);
		this.intimidationBonus = -20;
	}
	
	effect(state, data={}){
		switch(state){
			case "doActionAfter":
				if(data.action instanceof MoveAction){
					//run into shit
					if(roll_range(0,100)<(10*this.player.moveSpeedB)){
						let t_type = getTerrainType(this.player.x, this.player.y);
						switch(t_type){
							case 'tree':
								this.player.statusMessage = "runs into a tree like a retard";
								this.player.health -= roll_range(1,5*this.player.moveSpeedB);
								if(this.player.health<=0){
									this.player.death = "cracks their head open on a tree and dies";
								}
								break;
							case 'mtn':
								this.player.statusMessage = "runs into a cliff like a retard";
								this.player.health -= roll_range(1,10*this.player.moveSpeedB);
								if(this.player.health<=0){
									this.player.death = "dies of brain damage from running into walls";
								}
								break;
						}
					}
					else{
						//lose things
						let lose_lst = [['no lose', 50]];
						if(this.player.weapon)
							lose_lst.push(['wep', 10]);
						if(this.player.offhand)
							lose_lst.push(['off', 10]);
						if(lose_lst.length>1){
							let drop_item = roll(lose_lst);
							if(drop_item=='wep'){
								this.player.statusMessage = "accidentally loses their " + this.player.weapon.display_name;
								this.player.unequip_item('wep');
							}
							else if(drop_item=='off'){
								this.player.statusMessage = "accidentally loses their " + this.player.offhand.display_name;
								this.player.unequip_item('off');
							}
						}
					}
				}				
				break;
			case "attack":
				if(roll_range(0,100)<20){
					this.player.fightDmgB*=1.5;
					if(data.fightMsg.events)
						data.fightMsg.events.push(this.player.name + ' gets a burst of retard strength')
				}
				break;
		}
	}
	
	stat_html(){
		let html= super.stat_html()+		
		"<span class='desc'>"+
			"<span>Uguuuu....</span><br>"+	
		"</span>"
		return html;
	}
}

class Bocc extends Attr{
	constructor(player){
		super("bocc", player);
		this.dorce = 50;
		this.dorce_tier = 0;
		this.last_dorce_change = 0;
		this.original_img = this.player.img;
		this.has_info = true;
	}	
		
	dorce_change(tier){
		if(this.last_dorce_change<=0)
			return;
		if(this.dorce_tier==tier)
			return;
		switch(tier){
			case -1:				
				this.player.change_img('https://cdn.discordapp.com/attachments/998843166138572821/1064740232974565446/bocc-1.gif')
				pushMessage(this.player, this.player.name + " is feeling absolutely dorceful");
				break;
			case 0:
				this.player.change_img(this.original_img)
				pushMessage(this.player, this.player.name + "'s dorce levels are back to normal");
				break;
			case 1:
				this.player.change_img('https://cdn.discordapp.com/attachments/998843166138572821/1064740233289142272/bocc1.gif')
				pushMessage(this.player, this.player.name + " loses their dorce");
				break;
			case 2:
				this.player.change_img('https://cdn.discordapp.com/attachments/998843166138572821/1064740233658237018/bocc2.gif')
				pushMessage(this.player, this.player.name + " experiences a servere lack of dorce");
				break;
			case 3:
				this.player.change_img('https://cdn.discordapp.com/attachments/998843166138572821/1064740234039922789/bocc3.gif')
				pushMessage(this.player, this.player.name + " IS DANGEROUSLY DORCELESS");
				break;
		}
		this.dorce_tier = tier;
		this.last_dorce_change = 0;
	}
	
	effect(state, data={}){
		let nearby = [];
		let tP = this.player;
		switch(state){
			case "turnStart":
				if(this.dorce_tier<0){
					this.sightBonus = roll_range(-30,100);
					this.visibilityB = roll_range(-80,20);
					this.rangeBonus = roll_range(-10,50);
					this.fightBonus = roll_range(90,150)/100;
					this.dmgReductionB = roll_range(70,110)/100;
					this.intimidationBonus = roll_range(-20,80);
					this.moveSpeedB = roll_range(80,150)/100;
				}
				else if(this.dorce_tier>1){
					this.sightBonus = -roll_range(-30,100);
					this.visibilityB = -roll_range(-80,20);
					this.rangeBonus = -roll_range(-10,50);
					this.fightBonus = roll_range(50,110)/100;
					this.dmgReductionB = roll_range(90,130)/100;
					this.intimidationBonus = -roll_range(-20,80);
					this.moveSpeedB = roll_range(50,120)/100;
				}
				else{
					this.sightBonus = 0;
					this.visibilityB = 0;
					this.rangeBonus = 0;
					this.fightBonus = 1;
					this.dmgReductionB = 1;
					this.intimidationBonus = 0;
					this.moveSpeedB = 1;
				}
				break;
			case "opAware":
				this.dorce += 2;
				break;
			case "surroundingCheck":
				nearby = this.player.nearbyPlayers(100);				
				let delta_dorce = -(40 + 5 * this.dorce_tier);
				nearby.forEach(function(oP){
					if(tP==oP)
						return
					let dist = playerDist(tP,oP);
					if(dist<=25)
						delta_dorce+= 40;
					else if(dist<=50)
						delta_dorce+= 15;
					else if(dist<150)
						delta_dorce+= 5;	
				});
				
				if(this.player.lastActionState == "sleeping")
					delta_dorce -= 10;				
				if(this.player.lastActionState == "awaken")
					delta_dorce -= 50;				
				if(this.player.danger_score>100)
					delta_dorce += 40;
				
				if(this.player.health/this.player.maxHealth<0.3)
					delta_dorce += 10;
				if(this.player.health/this.player.maxHealth<0.1)
					delta_dorce += 50;
				
				if(this.last_dorce_change <= 3)
					delta_dorce = delta_dorce/2
				this.dorce+=delta_dorce;
				this.last_dorce_change++;				
				break;
			case "planAction":
				if(this.dorce_tier>=2)
					if(roll_range(0,100)<30+10*this.dorce_tier)
						this.player.setPlannedAction("bocc move", 6, BoccDorcelessMove)
				break;
			case "defend":
				this.dorce+=40;
				break;
			case "takeDmg":
				this.dorce+= Math.round(data.damage);
				break;
			case "turnEnd":
				//limit dorce
				this.dorce = Math.min(this.dorce,500);
				this.dorce = Math.max(this.dorce,-250);				
				
				//change dorce tiers
				if(this.dorce<0)
					this.dorce_change(-1);	
				else if(this.dorce<100)
					this.dorce_change(0);
				else if(this.dorce<200)
					this.dorce_change(1);
				else if(this.dorce<350)
					this.dorce_change(2);	
				else
					this.dorce_change(3);
				
				let autism_dist = 0;
				switch(this.dorce_tier){
					case -1:
						if(this.player.energy<20)
							this.player.energy+=15;
						break;	
					case 1:
						autism_dist = 25;
						break;
					case 2:
						autism_dist = 75;
						break;
					case 3:
						autism_dist = 150;
						if(roll_range(0,100)<30){							
							//spawn bocchinokos
							let temp_bocc = new Bocchinoko(this.player.x,this.player.y);
							createDoodad(temp_bocc);
							this.dorce-=20;
						}
						break;
				}
				//cause autisms
				let tA = this;
				if(autism_dist>0){
					nearby = this.player.nearbyPlayers(autism_dist);
					nearby.forEach(function(oP){
						if(oP==tP)
							return
						oP.inflict_status_effect(new BoccAutism(roll_range(1,1+tA.dorce_tier*3), roll_range(1, tA.dorce_tier+1)));
					});
				}
				break;
			case "death":
				//spawn multiple bocchinokos
				for(let i=0; i<5; i++){					
					let temp_bocc = new Bocchinoko(this.player.x + roll_range(-20,20), this.player.y + roll_range(-20,20));
					createDoodad(temp_bocc);
				}
				break;
		}
	}
	
	stat_html(){
		let html= super.stat_html()+
		"<span>Dorce:"+(-1*this.dorce)+"</span><br>"
		return html;
	}
}
//move dorcelessly in circles
class BoccDorcelessMove extends MoveAction{
	constructor(player, data){
		super(player,{});
		//turns the action will last for
		
		this.name = "bocc move";
		this.turns = 4*roll_range(1,4);
		this.action_priority = 7;
		this.start_x = this.player.x;
		this.start_y = this.player.y;
		//get a random point in the move cycle
		this.cycle = roll_range(1,4);
		this.reverse = 1;
		if(Math.random()<0.5)
			this.reverse = -1;
	}
	
	perform(){
		if((this.turns-1)%4==0){
			this.targetX = this.start_x;
			this.targetY = this.start_y;
		}
		else{
			switch(this.cycle){
				case 1:
					this.targetX = 0;
					this.targetY = 500;
					break;
				case 2:
					this.targetX = 500;
					this.targetY = 1000;
					break;
				case 3:
					this.targetX = 1000;
					this.targetY = 500;
					break;
				case 4:
					this.targetX = 500;
					this.targetY = 0;
					break;
			}
		}
		super.perform();
		this.player.statusMessage = "moves dorcelessly";
		this.cycle+=this.reverse;
		if(this.cycle<1)
			this.cycle = 4;
		if(this.cycle>4)
			this.cycle = 1;
	}
}

class Bocchinoko extends MovableEntity{
	constructor(x,y,){
		super("bocchinoko", x,y,"");
		this.icon = setDoodadIcon("https://cdn.discordapp.com/attachments/998843166138572821/1065182111205707786/bocchinoko.png");
		this.triggerRange = 24;
		this.max_triggers=1;
		this.triggerChance=10;
		this.ownerTriggerChance = 3;
		this.duration = 50;
		this.moveSpeed = 20;
		this.active=true;
	}
	
	stop_text(){
		 clearInterval(this.timer)
	}
	
	show_text(div){
		// log_message('noko noko');
		if(div.children('div').css('display')=='none'){
			let text_div = div.children('div');
			text_div.css('display','block');
			setTimeout(function(){
				text_div.css('display','none');
			}, 1500);
		}
	}
	
	update(){
		if(this.active){
			this.moveRandom();
			super.update();
		}
		else
			this.destroy();
	}
	
	trigger(trigger_player){
		let dmg = roll_range(5,10);
		trigger_player.heal_damage(dmg, this, "food");
		pushMessage(trigger_player, trigger_player.name + " catches a bocchinoko. It's damn good!");
		this.destroy();
	}
	
	draw(){
		let doodDiv = $('#doodad_' + this.id);
		if(!doodDiv.length){
			$('#doodads').append(			
			"<div id='doodad_" + this.id + "' class='doodad' style='transform:translate("+(this.x/1000*$('#map').width()-iconSize/2)+"px,"+(this.y/1000* $('#map').height()-iconSize/2)+"px);'>" + 
				"<div style='display:none; position:absolute; left:-40px; bottom:15px; font-size:10px; width:100px; color:EA9FC0;'>noko noko</div>"+
				this.icon + 
			"</div>"
			);
			doodDiv = $('#doodad_' + this.id);
			this.div = doodDiv;
			this.timer = setInterval(this.show_text, 5000+roll_range(-1500,2000) , this.div);
		}
	}	
}

bocc_autism_data = {
	'Degrence':{},
	'Humber':{"moveSpeedB":[0,0],"dmgReductionB":[0,0], "rangeBonus":[-500,0]},
	'Nage':{"aggroBonus":[30,30],"intimidationBonus":[30,50]},
	'Dorcelessness':{},
	'Andric':{"fightBonus":[0.8,-0.05], "rangeBonus":[10,5]},
	'Varination':{},
	'Ponnish':{},
	'Harfam':{"dmgReductionB":[0.8,-0.05], "rangeBonus":[-10,-1]},
	'Kyne':{"sightBonus":[-100,-10],"moveSpeedB":[1,0.1]},
	'Trantiveness':{"moveSpeedB":[4,0]},
	'Teluge':{"intimidationBonus":[-50,-5], "visibilityB":[100,0]},
	'Onlent':{"visibilityB":[-50,-5],"rangeBonus":[300,50]},
	'Loric':{"peaceBonus":[100,100],"fightBonus":[1.5,0.25]}
}
class BoccAutism extends StatusEffect{
	constructor(duration, level, emotion='rand'){
		super("bocc", level, duration);
		this.icon = setEffIcon('./icons/dorcelessness.gif');
		if(emotion=='rand')
			this.update_emotion(this.get_random_emotion());
		else{
			this.update_emotion(emotion);
		}
		this.cooldown = 2;
	}
	
	get_random_emotion(){
		let index = roll_range(0,12)
		let i=0;
		let emotion = '';
		for (const e in bocc_autism_data) {
			if(i==index){
				emotion = e
				break;
			}				
			i++;
		}
		log_message(emotion);
		if(emotion)
			return emotion;
		else
			return 'Dorcelessness';
	}
	
	update_emotion(emotion){
		this.emotion = emotion;
		this.display_name = this.emotion;
		this.data = bocc_autism_data[this.emotion];
		this.update_data();
		this.cooldown = 2;
	}
	
	stack_effect(new_eff){
		// this.duration += Math.max(1, new_eff.level - this.level);
		this.duration += 1;
		if(new_eff.level>this.effect.level){
			this.level=new_eff.level;
			this.update_data();
		}
		else{
			if(roll_range(0,100)<10 && this.level<10){
				this.level++;
				this.update_data();
			}
		}		
		// else
			// this.level+=1;
	}
	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				if(this.emotion == 'Degrence'){
					this.player.health = roll_range(1, this.player.maxHealth);
				}
				else if(this.emotion == 'Varination'){
					let dmg = roll_range(1,4);					
					this.player.take_damage(dmg,this,'');
					if(this.player.health<=0){
						this.player.death = "varinates to death"
					}
				}
				else if(this.emotion == 'Dorcelessness'){
					this.sightBonus = -roll_range(-30,130);
					this.visibilityB = -roll_range(-100,20);
					this.rangeBonus = -roll_range(-10,70);
					this.fightBonus = roll_range(50,120)/100;
					this.dmgReductionB = roll_range(90,150)/100;
					this.intimidationBonus = -roll_range(-20,80);
					this.moveSpeedB = roll_range(50,120)/100;
					this.update_data();
				}
				// this.cooldown--;
				// if(this.cooldown<=0){
					// if(roll_range(0,100)<10)
						// this.get_random_emotion();
				// }
				super.effect("turnStart");
				break;
			case "planAction":
				if(this.emotion=='Dorcelessness')
					if(roll_range(0,100)<30+this.level)
						this.player.setPlannedAction("bocc move", 6, BoccDorcelessMove)
				break;
			case "dealDmg":
				if(this.emotion=='Ponnish'){
					let dmg=data['damage'];
					this.player.health += dmg*0.03*this.level;
				}
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html= super.stat_html() +
			"<span class='desc'>"		
		switch(this.emotion){
			case 'Degrence':
				html += "<span>health go up health go down</span><br>";
				break;
			case 'Humber':
				html += "<span>IM FUCKING INVINCIBLE</span><br>";
				break;
			case 'Nage':
				html += "<span>I AM NAAAAAAAAAAAAAAAAAAAAGE</span><br>";
				break;
			case 'Dorcelessness':			
				html += "<span>FNBJ&$htyjT2Q3R23r%AWE^hFKUYJHsdaABAA</span><br>";
				break;
			case 'Andric':
				html += "<span>loooooooooooooooooooooooong</span><br>";
				break;
			case 'Varination':
				html += "<span>varinate varinate varinate</span><br>";
				break;
			case 'Ponnish':
				html += "<span>FEEEEEEEED</span><br>";
				break;
			case 'Harfam':
				html += "<span>o my arms...</span><br>";
				break;
			case 'Kyne':
				html += "<span>i cant sneed....</span><br>";
				break;
			case 'Trantiveness':
				html += "<span>FASTER</span><br>";
				break;
			case 'Teluge':
				html += "<span>ummmm ahhh ummmmmmmmmmmmmmmmm</span><br>";
				break;
			case 'Onlent':
				html += "<span>huh huh huh huh huh huh huh huh</span><br>";
				break;
			case 'Loric':
				html += "<span>:)))))))))))))))))</span><br>";
				break;
		}
		html += "</span>";
		return html;
	}
}














