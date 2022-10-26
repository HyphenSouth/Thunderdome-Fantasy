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
			/*
			case "attack":
				if(this.player.weapon.name=="guitar"){
					this.player.fightDmgB *= this.guitar_dmg;
				}
				break;
			*/
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
					log_message('FUNNY '+move_dist)
					if(move_dist>30){
						let move_line = new Line({"p1":this.start_point,"p2":[this.player.x, this.player.y]})
						let fire_count = 1 + move_dist/15
						for(let i=0; i<fire_count; i++){
							let rand_x = roll_range(this.start_point[0], this.player.x);
							let rand_y = move_line.getY(rand_x)
							let tempFire = new FireEntity(rand_x, rand_y, this.player);
							tempFire.draw();
							tempFire.duration = 2;
							doodads.push(tempFire);	
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




















