class PaperMaster extends Attr{
	constructor(player){
		super("paper", player);
		this.has_info = true;
		this.paper = 50;
		this.familiar = ''
	}
		
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(this.paper >= 150 && Math.random()>0.3){
					log_message(this.player.name + ' '+ this.paper);
					let item_prob = []
					if(!this.player.weapon)
						item_prob.push(['wep',5])
					if(!this.player.offhand)
						item_prob.push(['off',3])
					if(!this.player.familiar && paper_familiar_cnt<max_paper_familiar_cnt)
						item_prob.push(['fam',2])
					
					let item_type = roll(item_prob)
					if(item_type == 'wep')
						this.player.setPlannedAction("createWeapon", 5, PaperCreateAction, {"creation_type":'wep',"attr":this});
					if(item_type == 'off')
						this.player.setPlannedAction("createOffhand", 5, PaperCreateAction, {"creation_type":'off',"attr":this});
					if(item_type == 'fam')
						this.player.setPlannedAction("createFamiliar", 5,PaperCreateAction, {"creation_type":'fam',"attr":this});
				}
				break;
			case "turnEnd":
				// if(this.player.lastActionState == "forage success"){
					// this.player.statusMessage = 'finds paper'
					// this.paper += roll_range(40,180)
				// }
				if(!this.player.ignore_terrain && getTerrainType(this.player.x,this.player.y)=="water"){
					this.paper -= 20;
				}				
				if(this.player.get_status_effect('burn')){
					this.paper -= 10;
				}
				if(this.paper<0){
					this.paper = 0
				}
				break;
			case "equipItem":
				if(data.item == 'paper'){
					this.player.statusMessage = 'finds paper'
					this.paper += roll_range(40,180)
					this.player.lastActionState = 'forage paper'
				}
				break;
		}
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				x.push(['paper', 2000])
				break;
		}
		return x
	}
	// item_odds(prob,item_type){
		// prob.push(['Nothing', 2000])
	// }
	stat_html(){
		let html= 
			"<span><b>📜:</b>"+this.paper+"</span><br>"
		if(this.familiar){
			html = html + this.familiar.stat_html();
		}
		return html;
	}
}

//paper master class
class PaperCreateAction extends Action{
	constructor(player, data){
		super("paperCreate", player);
		this.attr = data.attr
		this.creation_type = data.creation_type
	}
	
	perform(){
		if(this.attr.paper<150){
			this.player.statusMessage = 'does not have enough paper'
			this.player.lastActionState = 'paper create fail'
			return
		}
		switch(this.creation_type){
			case 'wep':
				this.create_wep();
				break;
			case 'off':
				this.create_off();
				break;
			case 'fam':
				this.create_fam();
				break;			
			default:
				this.player.lastActionState = 'create paper null'
				break;
		}
	}
	
	create_wep(){
		let wep = roll([['bow',10],['sword',10]]);
		let extra_uses = 0;
		switch(wep){
			case 'bow':
				let tempBow = new PaperBow()
				this.attr.paper -= 150;
				extra_uses = Math.min(roll_range(0,Math.round(this.attr.paper/10)), 20)
				tempBow.uses+=extra_uses
				this.attr.paper -= extra_uses*10;
				this.player.equip_item(tempBow);					
				break;
			case 'sword':
				let tempSword = new PaperSword()
				this.attr.paper -= 150;
				extra_uses = Math.min(roll_range(0,Math.round(this.attr.paper/12)), 15)
				tempSword.uses+=extra_uses
				this.attr.paper -= extra_uses*12;
				this.player.equip_item(tempSword);					
				break;
		}
		this.player.lastActionState = 'create paper weapon'
	}
			
	create_off(){
		// let off = roll([['plane',5],['shield',10]]);
		let off = roll([['shield',10]]);
		let extra_uses = 0;
		switch(off){
			case 'shield':
				let tempShield = new PaperShield()
				this.attr.paper -= 150;
				extra_uses = Math.min(roll_range(0,Math.round(this.attr.paper/5)), 100)
				tempShield.power += extra_uses;
				this.attr.paper -= extra_uses*5;
				this.player.equip_item(tempShield);					
				break;
		}
		this.player.lastActionState = 'create paper offhand'
	}
	
	create_fam(){
		log_message('b')
		let fam = roll([['bird',10]]);
		let extra_uses = 0;
		switch(fam){
			case 'bird':
				let temp_bird = new PaperBird(this.player.x, this.player.y, this.player, this.attr)
				this.attr.paper -= 150;
				extra_uses = Math.min(roll_range(0,Math.round(this.attr.paper/10)), 60)
				temp_bird.power += extra_uses;
				this.attr.paper -= extra_uses*10;
				// temp_bird.draw();
				// doodads.push(temp_bird);
				createDoodad(temp_bird);
				this.familiar = temp_bird
				this.player.statusMessage = 'creates a paper bird'
				break;
		}		
		this.player.lastActionState = 'create paper familiar'
	}	
}

class PaperBow extends Weapon{
	constructor() {
		super("paperBow");
		this.display_name = ("Paper Bow");
		this.icon = setItemIcon('./icons/paperBow.png')
		this.dmg_type = 'ranged'
		
		this.rangeBonus = 30;
		this.fightBonus = 1.2
		this.uses = 6
	}
	effect(state, data={}){
		switch(state){
			case "turnEnd":
				if(!this.player.ignore_terrain && getTerrainType(this.player.x,this.player.y)=="water"){
					this.uses -= 2;
				}
				if(this.player.get_status_effect('burn')){
					this.uses -= 1;
				}
			break;
			case "dealDmg":
				let oP=data['opponent'];
				oP.inflict_status_effect(new Bleed(1,this.player));
				super.effect(state,data);
				break;	
		}
	}	
	equip(player){
		super.equip(player)
		this.player.statusMessage =  "creates a paper bow";
		return true;
	}
}
class PaperSword extends Weapon{
	constructor() {
		super("paperSword");
		this.display_name = ("Paper Sword");
		this.icon = setItemIcon('./icons/paperSword.png')
		this.dmg_type = "melee",
		this.fightBonus = 1.3,
		this.uses = 5
	}
	effect(state, data={}){
		switch(state){
			case "turnEnd":
				if(!this.player.ignore_terrain && getTerrainType(this.player.x,this.player.y)=="water"){
					this.uses -= 2;
				}
				if(this.player.get_status_effect('burn')){
					this.uses -= 1;
				}
				break;
			case "dealDmg":
				let oP=data['opponent'];
				oP.inflict_status_effect(new Bleed(2,this.player));
				super.effect(state,data);
				break;
		}
	}	
	equip(player){
		super.equip(player)
		this.player.statusMessage =  "creates a paper sword";
		return true;
	}
}

class PaperShield extends Offhand{
	constructor() {
		super("paperShield");
		this.display_name = ("Paper Shield");
		
		this.icon = setItemIcon('./icons/paperShield.png')
		this.dmgReductionB = 0.8
		this.uses = 1
		this.power = 10
	}
	
	effect(state, data={}){
		switch(state){
			case "defend":
				let oP=data["opponent"];
				let recoil_dmg = roll_range(1, this.power);
				if(recoil_dmg>oP.health){
					recoil_dmg = oP.health;
				}				
				oP.take_damage(recoil_dmg, this, "recoil")
				oP.inflict_status_effect(new Bleed(Math.max(Math.round(this.power/10), 0),this.player));
				data.fightMsg.events.push(oP.name + " hit by a paper explosion from " + this.player.name + " for "+ roundDec(recoil_dmg)+ " damage");
				if(oP.health<=0){
					oP.death = "killed by a paper explosion from " + this.player.name;
					this.player.kills++;
				}					
				this.use()
				break;
			case "turnEnd":
				if(!this.player.ignore_terrain && getTerrainType(this.player.x,this.player.y)=="water"){
					this.power -= 5;
				}
				if(this.player.get_status_effect('burn')){
					this.power -= 3;
				}
				if(this.power <=0){
					this.use();
				}
				break;	
			default:
				super.effect(state, data)
				break;
		}
	}
	stat_html(){
		let html= super.stat_html() + 
			"<span><b>Power: </b>"+this.power+"</span><br>"
		return html;
	}	
	
	equip(player){
		super.equip(player)
		this.player.statusMessage =  "creates a paper shield";
		return true;
	}
}

class PaperPlane extends Offhand{
	constructor() {
		super("paperPlane");
		this.display_name = ("Paper Plane");
	}	
}

var max_paper_familiar_cnt = 3;
var paper_familiar_cnt = 0;
//homes in on a target and attacks
class PaperBird extends MovableEntity{
	constructor(x,y,owner, owner_attr){
		super(owner.name + "'s paper bird", x,y , owner)
		this.power = 60;
		this.icon = setDoodadIcon('./icons/paperBird.png');
		this.target = '';
		this.moveSpeed = 60;
		this.owner_attr = owner_attr
		this.active=true;
		paper_familiar_cnt++;
	}
	
	update(){
		if(!this.active){
			this.destroy();
			return;
		}
		//dealing with death
		if(this.target.dead){
			this.target=''
		}
		if(this.target){
			this.moveToTarget(this.target.x, this.target.y)
			//attack
			let target_dist = hypD(this.x - this.target.x, this.y - this.target.y);
			if(target_dist<=this.triggerRange){
				this.trigger(this.target)
				return
			}
		}
		else{
			//wander and pick target
			this.moveRandom()
			this.target = players[roll_range(0,players.length-1)]
			if(this.target == this.owner){
				this.target = ''
			}
		}
		this.power -=roll_range(0,5)
		if(this.power<0){
			this.destroy();
		}		
	}
	
	trigger(trigger_player){
		log_message('trigger on ' +trigger_player.name)
		let dmg = roll_range(1,this.power)
		if(dmg >trigger_player.health){
			dmg = trigger_player.health
		}
		trigger_player.take_damage(dmg, this, 'none')
		pushMessage(trigger_player, trigger_player.name+' dive bombed by '+this.name+' for '+ dmg+' damage');
		if(trigger_player.health<=0){
			trigger_player.death = "killed by " + this.name + ' dive bomb';			
			this.owner.kills++;
		}
		else{
			//inflict bleed
			trigger_player.inflict_status_effect(new Bleed(Math.max(Math.round(this.power/10), 0),this.owner))
		}
		if(trigger_player.currentAction)
			trigger_player.currentAction.entity_attacked(this)
		//aoe		
		if(this.power>=40){
			let tD = this;
			let explode_range = (this.power-40)/4+20
			players.forEach(function(oP,index){
				let dist = hypD(oP.x - tD.x,oP.y - tD.y);
				if(dist <= explode_range && oP.health>0 && oP!=trigger_player && Math.random()>0.3){
					let dmg = roll_range(0,tD.power*0.05)
					if(dmg>oP.health){
						dmg = oP.health
					}
					if(dmg>0){
						oP.take_damage(dmg, tD, 'none')
						oP.inflict_status_effect(new Bleed(1,tD.owner))
						pushMessage(oP, oP.name + " hit by "+tD.name+"'s dive bomb explosion");
						if(oP.health<0){
							oP.death = "killed by " + tD.name + "'s dive bomb explosion";
							tD.owner.kills++;
						}		
					}
				}
			});
		}
		this.active = false
		this.icon = setDoodadIcon('./icons/paperShield.png');
		// this.destroy()
	}
	
	destroy(){
		paper_familiar_cnt--;
		log_message(this.owner.name+" paperbird destroy")
		this.owner_attr.familiar=''
		super.destroy()
	}
	
	stat_html(){
		let html= 
			"<span><b>"+this.name+"</b></span><br>"+
			"<span><b>Power: </b>"+this.power+"</span><br>"
		if(this.target){
			html = html + "<span><b>Target: </b>"+this.target.name+"</span><br>"
		}
		else{
			html = html + "<span><b>Target: </b>None</span><br>"
		}
		return html;
	}
	
}







