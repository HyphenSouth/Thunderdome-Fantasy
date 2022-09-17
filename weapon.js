var wep_prob = 3;
var sexSword = true;
var spicy = true;
var defaultWeaponOdds = [
	["knife",30],["gun",20],["lance",25],["bow",20],["wand",18],["cross",20],["rake",20],["guitar",18],
	["katana", 25], ["shotgun", 25], ["sniper",20],
	["clang",10], ["flamethrower",20], ["ancient", 25],
	["Nothing",400]
];

function get_weapon_odds(tP){
	let weaponOdds = defaultWeaponOdds.slice();
	// let weaponOdds = [["shotgun", 100], ["Nothing",100]];
	if(sexSword){
		weaponOdds.push(["nanasatsu",1]);
		// weaponOdds.push(["nanasatsu",10000]);
	}	
	if(spicy){
		weaponOdds.push(["spicy",1]);
		// weaponOdds.push(["spicy",5000]);
	}
	
	tP.attributes.forEach(function(attr){
		attr.item_odds(weaponOdds, 'wep');
	});
	tP.status_effects.forEach(function(eff){
		eff.item_odds(weaponOdds, 'wep');
	});		
	if(tP.offhand){
		tP.offhand.item_odds(weaponOdds, 'wep');
	}
	if(tP.weapon){
		tP.weapon.item_odds(weaponOdds, 'wep');
	}
	log_message(weaponOdds)
	return weaponOdds;
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
	
	this.moveSpeedB = 1;
	
	this.uses = 0;
	this.dmg_type = "";

*/



//class to hold data for items
class Weapon extends Item{
	constructor(name){
		super(name);

		this.dmg_type="";
		
		if(name in weapon_data){
			let data = weapon_data[name];
			
			if("icon" in data){
				if(data.icon_type=="img"){
					this.icon = setItemIcon(data["icon"]);
				}
				else{
					this.icon=data["icon"];
				}
			}
			
			if("sightBonus" in data){this.sightBonus = processDataNum(data["sightBonus"])}
			if("visibilityB" in data){this.visibilityB = processDataNum(data["visibilityB"])}
			
			if("rangeBonus" in data){this.rangeBonus = processDataNum(data["rangeBonus"])}
			if("fightBonus" in data){this.fightBonus = processDataNum(data["fightBonus"])}
			if("dmgReductionB" in data){this.dmgReductionB = processDataNum(data["dmgReductionB"])}
			
			if("peaceBonus" in data){this.peaceBonus = processDataNum(data["peaceBonus"])}
			if("aggroBonus" in data){this.aggroBonus = processDataNum(data["aggroBonus"])}
			if("intimidationBonus" in data){this.intimidationBonus = processDataNum(data["intimidationBonus"])}
			
			if("moveSpeedB" in data){this.moveSpeedB = processDataNum(data["moveSpeedB"])}
			
			if("uses" in data){this.uses = processDataNum(data["uses"])}
			
			if("dmg_type" in data){this.dmg_type=data["dmg_type"]}
		}		
	}
	
	replace_wep(new_weapon){
		this.player.weapon=new_weapon;
		new_weapon.equip(this.player);
		this.player=""
		return true;
	}
	
	unequip(){
		this.player="";
		return true;
	}

	/*
	Effects on wielder:
		planAction
		moving
		foraging
		sleeping
		escaping
		defend
		take damage
		death
	*/
	/*
	Effects on others:
		in range
		aware
		attack
		deal damage
		win
		lose
	*/		
	effect(state, data={}){
		let oP="";
		let counter="";
		switch(state){			
			case "turnStart":
				this.player.div.removeClass("sexSword");
				break;
			case "death":
				break;
			//attacking before dealing damage to opponent
			case "attack":
				oP=data['opponent'];
				this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
				this.use();
				break;
			//after dealing damage
			case "dealDmg":
				break;
			case "win":
				oP=data['opponent'];
				this.player.statusMessage = "kills " + oP.name + " with a " + this.name;
				break;
		}
	}
    destroy(){
		log_message(this.player.name +"'s " + this.name+" breaks");
		this.player.weapon = "";   
		super.destroy();
	}
	
	stat_html(){
		let html = super.stat_html()+
		"<span><b>Dmg Type:</b>"+this.dmg_type+"</span><br>"
		return html;
	}
}

class Lance extends Weapon {
	constructor() {
		super("lance");
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				super.effect("turnStart", data);
				if(roll([["die",1],["live",20000]]) == "die"){
					this.player.health = 0;
					this.player.death = "Died by their own spear";
					log_message(this.player.name + ' killed by lance')
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = super.stat_html()+
		"<span><b>Luck:</b>F</span><br>"
		return html;
	}
}

//random chance of critting
//at least one crit guarenteed 
class Katana extends Weapon {
	constructor() {
		super("katana");
		this.crit=false;
		this.base_dmg = 1.2
		this.crit_dmg = 2
		this.super_crit_dmg = 2.5
	}

	effect(state, data={}){
		let oP="";
		switch(state){
			//random crit
			case "attack":
				oP=data['opponent'];
				if((this.uses==1 && !this.crit)){
					//guarenteed crit
					this.player.fightDmgB *= this.super_crit_dmg;
					this.crit=true;
					this.player.statusMessage = "lands a SUPER critical hit on " + oP.name;
					log_message("SUPER CRIT")
				}
				else if(Math.random()<0.1){
					//crit
					this.player.fightDmgB *= this.crit_dmg;
					this.crit=true;
					this.player.statusMessage = "lands a critical hit on " + oP.name;
					log_message("CRIT")
				}
				else{
					this.player.fightDmgB *= this.base_dmg;
					this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
				}
				this.use();
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = "<span><b>Dmg Bonus:</b>x"+this.base_dmg+"</span><br>"+
		"<span><b>Crit Dmg Bonus:</b>x"+this.crit_dmg+"</span><br>"+
		
		"<span class='desc'>"+
			"<span>Random chance to crit</span><br>"+	
			"<span>One guaranteed crit</span><br>"+
		"</span>"
		
		return html;
	}
}

//random chance of critting
class Sniper extends Weapon {
	constructor() {
		super("sniper");
		this.display_name = "Sniper Rifle"
		this.base_dmg = 1.2
		this.crit_dmg = 2.5
		this.crit = false;
	}

	effect(state, data={}){
		let oP="";
		switch(state){
			//random crit
			case "attack":
				this.crit = false;
				oP=data['opponent'];
				if(Math.random()<0.1){
					//crit
					this.player.fightDmgB *= this.crit_dmg;
					this.player.statusMessage = "lands a headshot hit on " + oP.name;
					log_message("CRIT")
					this.crit = true;
				}
				else{
					this.player.fightDmgB *= this.base_dmg;
					this.player.statusMessage = "attacks " + oP.name + " with a sniper rifle";
				}
				this.use();
				break;
			case "win":
				oP=data['opponent'];
				if(this.crit){
					this.player.statusMessage = "turns " + oP.name + "'s brain into mush";
				}
				else{
					this.player.statusMessage = "kills " + oP.name;
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = "<span><b>Dmg Bonus:</b>x"+this.base_dmg+"</span><br>"+
		"<span><b>Headshot Dmg Bonus:</b>x"+this.crit_dmg+"</span><br>"+
		"<span class='desc'>"+
			"<span>Random chance to headshot</span><br>"+
		"</span>"
		
		return html;
	}
}

class ShotgunReloadAction extends Action{
	constructor(player, data){
		super("reloadShotgun", player);
		this.shotgun = data.shotgun
	}
	
	perform(){
		if(this.shotgun.player != this.player){
			this.player.statusMessage = "lost the shotgun they want to reload";
			this.player.lastActionState = "reloading fail"
		}
		else{
			log_message(this.player.name + " reloads");
			this.player.statusMessage = "reloads their shotgun";
			this.player.lastActionState = "reloading"
			this.shotgun.reload()
		}			
	}
}

//2 shells loaded at a time
//takes time to reload
//damage based on distance
class Shotgun extends Weapon {
	constructor() {
		super("shotgun");
		this.max_shells = 2;
		this.loaded_shells = this.max_shells;
		this.max_range = 50;	//furthest it can hit
		this.dmg_range = [1.05, 2.5]; //min, max
		this.max_spread = 15 //bullet spread radius at max range
		this.icon_full = setItemIcon("./icons/shotgun.png")
		this.icon_empty = setItemIcon("./icons/shotgunE.png")
		this.napalm = false;
	}
	calc_bonuses(){
		super.calc_bonuses();
		if(this.loaded_shells==0){
			this.player.fightRangeB -= this.rangeBonus;
		}
	}
	reload(){
		if(this.uses>0){
			this.loaded_shells=this.max_shells;
			this.uses--;
		}
		else{
			this.destroy();
		}
	}	
	effect(state, data={}){
		let oP="";
		let counter="";
		switch(state){
			case "turnEnd":
				if(this.loaded_shells==0){
					this.icon = this.icon_empty;
				}
				else{
					this.icon = this.icon_full;
				}	
				break;
			case "planAction":
				if(this.loaded_shells==0 && Math.random()<0.5)
					this.player.setPlannedAction("reloadShotgun", 2,{'class':ShotgunReloadAction, 'shotgun':this});
					// this.player.setPlannedAction("reloadShotgun", 2);
				break;
			/*
			case "reloadShotgun":
				this.reload();
				this.player.resetPlannedAction();
				break;
			*/
			case "attack":
				oP=data['opponent'];
				counter=data['counter'];
				//loaded shotgun attack
				if(this.loaded_shells>0){
					log_message("SHOTGUN ATTACK")
					this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
					//calculate damage based on distance
					// currently linear scaling
					let target_dist = playerDist(this.player, oP);
					let dmg_bonus = ((this.dmg_range[0] - this.dmg_range[1])/this.max_range) * target_dist + this.dmg_range[1]
					if(target_dist<=this.max_range*0.1){
						dmg_bonus += 0.5;
						this.player.statusMessage = "hits " + oP.name +" at point blank with a shotgun";
					}
					if(target_dist>=this.max_range*0.9){
						dmg_bonus=this.dmg_range[0]
						this.player.statusMessage = "barely hits " + oP.name +" with a shotgun";
					}
					//collateral 
					if(target_dist>this.max_range*0.6){
						//get nearby opponents
						let nearby_lst = oP.nearbyPlayers((target_dist/this.max_range)*this.max_spread);
						let temp_wep = this;
						nearby_lst.forEach(function(unfortunate_victim,index){
							//cannot hit wielder
							if(unfortunate_victim != temp_wep.player && unfortunate_victim.health>0 && Math.random()<0.5){
								log_message("stray hit " + unfortunate_victim.name);
								//calculate damage based on distance
								let dmg = (1.1 - target_dist/temp_wep.max_range) * 3;
								dmg = dmg * unfortunate_victim.dmgReductionB;
								//deal damage
								if(dmg > unfortunate_victim.health)
									dmg = unfortunate_victim.health;
								unfortunate_victim.take_damage(dmg, temp_wep.player, temp_wep.dmg_type);
								//on hit
								if(unfortunate_victim.health <=0){
									unfortunate_victim.death="killed by a stray pellet from "+temp_wep.player.name+"'s shotgun";
									pushMessage(unfortunate_victim, "killed by a stray pellet from "+temp_wep.player.name+"'s shotgun");
									temp_wep.player.kills++;
								}
								else{
									unfortunate_victim.statusMessage="hit by a stray pellet from "+temp_wep.player.name+"'s shotgun";
									pushMessage(unfortunate_victim, "hit by a stray pellet from "+temp_wep.player.name+"'s shotgun");
								}
								
								// unfortunate_victim.finishedAction = true;
								// unfortunate_victim.resetPlannedAction();
								unfortunate_victim.currentAction.turn_complete = true;
							}
						});		
					}
					log_message(dmg_bonus)
					this.player.fightDmgB *= dmg_bonus;
					this.loaded_shells--;				
				}
				else if(counter && Math.random()<0.2){
					//20% chance of reload instead of fighting back
					this.reload();
					this.player.fightDmgB *= 0;
					this.player.statusMessage = "reloads their shotgun instead of fighting back";
				}
				else{
					//no reload
					this.player.statusMessage = "attacks " + oP.name + " with an empty shotgun";
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	stat_html(){
		let html = 	"<span><b>Shells Loaded:</b>"+this.loaded_shells+"</span><br>"+
		"<span><b>Dmg Range:</b>x"+(this.dmg_range[0])+"-x"+(this.dmg_range[1])+"</span><br>"+
		"<span><b>Max Range:</b>"+this.max_range+"</span><br>"+
		"<span><b>Point Blank Range:</b>"+(this.max_range*0.1)+"</span><br>"+
		
		"<span class='desc'>"+
			"<span>Fires 2 shots before reloading</span><br>"+	
			"<span>Deals damage based on distance from target</span><br>"+
			"<span>Capable of collateral damage</span>"+
		"</span>"
		return html;
	}
}

class Nanasatsu extends Weapon {
	constructor() {
		super("nanasatsu");
		this.display_name="SEX SWORD";
		this.kills=0;
		this.prev_owners=0;
	}
	equip(wielder){
		super.equip(wielder);
		sexSword = false;
		this.player.statusMessage = "<span style='color:red'>found SEX SWORD</span>";
		if(this.prev_owners==0){
			pushMessage(this.player,this.player.name +  "<span style='color:red'> found SEX SWORD</span>");
		}
		else{
			if(this.kills<5){
				pushMessage(this.player ,this.player.name+ "<span style='color:red'> takes SEX SWORD</span>");
			}
			else{
				pushMessage(this.player , this.player.name + "<span style='color:red'> CONTINUES THE SLAUGHTER</span>");
			}				
		}
		return true;
	}	
	replace_wep(new_weapon){
		return false;
	}
	effect(state, data={}){
		let dmg=0;
		let oP="";
		switch(state){
			//turn start
			case "turnStart":
				this.player.div.addClass("sexSword");
				//lose health
				this.player.health -= (this.fightBonus - 1.5 + this.kills);
				//this.player.health -= (this.fightBonus +2000);
				//death message
				if(this.player.health <= 0){
					this.player.death = "Succumbed to SEX SWORD";
					log_message(this.player.name + ' killed by sword')
				}
				break;
			case "attack":
				oP=data['opponent'];
				this.player.statusMessage = "attacks " + oP.name + " with SEX SWORD";
				break;
			//dealing damage
			case "dealDmg":
				oP=data['opponent'];
				dmg=data['damage'];
				//heal on hit
				log_message(this.player.name + " SEX SWORD attack")
				// log_message(this.player.health + " before");
				log_message(this.fightBonus + " before");
				log_message(dmg);
				this.player.health += Math.pow(dmg,0.66);
				this.fightBonus += dmg/1000;
				// log_message(this.player.health + " after");
				log_message(this.fightBonus + " after");
				break;
			//killing an opponent
			case "win":
				this.kills++;  
				this.fightBonus += 0.25;
				oP=data['opponent'];
				this.player.statusMessage = "kills " + oP.name+" and gets stronger";
				break;
			//killed by opponent
			case "lose":
				oP=data['opponent'];
				//transfer ownership to killer if killer is charmed
				if(Math.random() > 0.1){
					if(oP.get_status_effect("charm")){
						if(oP.get_status_effect("charm").target==this.player){
							this.player.unequip_item("wep");
							this.prev_owners++;
							if(oP.equip_item(this)){
								log_message("sex sword is passed onto " + oP.name);
							}
						}
					}
				}				
				break;
			//seen by player
			case "opAware":
				oP=data['opponent'];
				if (Math.random() > 0.3){
					let temp_charm = new Charm(this.player,10, true);
					// temp_charm.aggro=true;
					temp_charm.follow_message = "following SEX SWORD"
					oP.inflict_status_effect(temp_charm);
				}
				break;
			//followed by another player
			/*
			case "followTarget":
				oP=data['opponent'];
				oP.statusMessage = "following SEX SWORD";
				break;
			*/
			default:
				super.effect(state, data);
				break;
		}
	}
	
	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"	+
			"<span><b>Dmg Bonus:</b>x"+roundDec(this.fightBonus)+"</span><br>"+
			"<span><b>Self damage:</b>"+roundDec(this.fightBonus - 1.5 + this.kills)+"hp</span><br>"+
			"<span><b>Kills:</b>"+this.kills+"</span><br>"+
			"<span><b>Previous owners:</b>"+this.prev_owners+"</span><br>"+
			"<span class='desc'>"+
				"<span>Damages user every turn</span><br>"+	
				"<span>Heals on hit</span><br>"+	
				"<span>Becomes stronger on hit</span><br>"+	
			"</span>"+
		"</div>"
		$('#extra_info_container').html(item_info);
	}
}
class Spicy extends Weapon {
	constructor() {
		super("spicy");
		this.display_name = ("ol' Spicy Shinkai Makai");
	}
	equip(wielder){
		super.equip(wielder);
		spicy = false;
		this.player.statusMessage = "<span style='color:red'>found the OL' SPICY SHINKAI MAKAI</span>";
		return true;
	}	
	replace_wep(new_weapon){
		return false;
	}
	effect(state, data={}){
		let dmg=0;
		let oP="";
		switch(state){
			//turn start
			case "turnStart":
				//light user on fire
				if(Math.random()>0.95){
					let f = new Burn(1,2,"")
					f.death_msg = "couldn't handle the ol' spicy shinkai makai"
					this.player.inflict_status_effect(f)
				}
				break;
			case "attack":
				oP=data['opponent'];
				//set self on fire
				let tP_fire = new Burn(2,1,"")
				tP_fire.death_msg = "couldn't handle the ol' spicy shinkai makai"
				this.player.inflict_status_effect(tP_fire)
				//set opponent on fire
				let oP_fire = new Burn(5,3,this.player)
				oP.inflict_status_effect(oP_fire)
				
				this.player.statusMessage = "attacks " + oP.name + " with the OL' SPICY SHINKAI MAKAI";
				break;
			case "newStatus":
				//charm immunity
				let eff = data["eff"]
				if(eff.name == "charm"){
					this.player.remove_status_effect(eff);
					log_message(this.player.name +" cannot be charmed")
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"	+
			"<span><b>Dmg Bonus:</b>x"+this.fightBonus+"</span><br>"+
			"<span class='desc'>"+
				"<span>Inflicts burn on user and opponent</span><br>"+	
				"<span>Provides immunity to being charmed</span><br>"+	
			"</span>"+
		"</div>"
		$('#extra_info_container').html(item_info);
	}
}

class Clang extends Weapon {
	constructor() {
		super("clang");
		this.display_name = "BERSERKER"
		this.fightBonusBase = this.fightBonus
	}
	
	equip(wielder){
		this.player = wielder;
		this.calc_bonuses();
		this.player.statusMessage =  "goes berserk";
		let never = new Berserk(2,10);
		this.player.inflict_status_effect(never);
		return true;
	}	
	
	calc_bonuses(){
		this.fightBonus = this.fightBonusBase* (1+this.player.aggroB/1000)
		super.calc_bonuses()
	}
	
	effect(state, data={}){
		let oP = "";
		switch(state){
			case "turnStart":
				if(this.player.get_status_effect("berserk")=="" && Math.random()>0.6){
					let never = new Berserk(2,5);
					this.player.inflict_status_effect(never);	
				}
				break;
			case "attack":
				// super.effect("attack", data);
				oP=data['opponent'];
				if(this.player.get_status_effect("berserk")!=""){
					this.player.statusMessage = "goes BERSERK on " + oP.name;
				}
				else{
					this.player.statusMessage = "CLANGS " + oP.name;
				}
				this.use();
				break;
			case "win":
				oP=data['opponent'];
				this.player.statusMessage = "CLANGS " + oP.name+" to death";
				oP.death = "CLANGED to death by " + this.player.name;
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = 	super.stat_html()+
		
		"<span class='desc'>"+
			"<span>Causes user to go berserk</span><br>"+	
			"<span>Deals damage based on user's aggression</span><br>"+
			"<span>CLANG</span>"+
		"</span>"
		return html;
	}
}

class Flamethrower extends Weapon{
	constructor() {
		super("flamethrower");
	}	
	
	effect(state, data={}){
		let oP = "";
		switch(state){
			case "attack":
				// super.effect("attack", data);
				oP = data['opponent']
				this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
				//set opponent on fire
				let oP_fire = new Burn(3,5,this.player)
				oP.inflict_status_effect(oP_fire)
				
				//aoe fire
				let aoe_radius = Math.min(playerDist(this.player, oP), this.rangeBonus);
				//get nearby opponents
				let nearby_lst = oP.nearbyPlayers(aoe_radius);
				let temp_wep = this;
				nearby_lst.forEach(function(unfortunate_victim,index){
					//cannot hit wielder
					if(unfortunate_victim != temp_wep.player && Math.random()<0.8){
						log_message("stray fire " + unfortunate_victim.name);
						let aoe_fire = new Burn(1,2,temp_wep.player)
						unfortunate_victim.inflict_status_effect(aoe_fire)
					}
				});	
				//set ground on fire
				if(getTerrainType(oP.x, oP.y) !="water" && Math.random()<0.5){
					let ground_fire = new FireEntity(oP.x, oP.y,this.player);
					ground_fire.draw();
					doodads.push(ground_fire)
				}
				this.use();
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = 	super.stat_html()+
		"<span class='desc'>"+
			"<span>Sets opponents on fire</span><br>"+	
			"<span>Sets nearby players on fire</span><br>"+
			"<span>Sets ground on fire</span>"+
		"</span>"
		return html;
	}
}
class Ancient extends Weapon{
	constructor() {
		super("ancient");
		this.display_name = 'Ancient Staff'
		this.last_spell = ['','']
		this.cost_data = {
			'smoke':5,
			'shadow':8,
			'blood':12,
			'ice':15		
		}
		this.aoe_cost = 1.5
		this.aoe_radius = 24
		
		this.dmg_data = {
			'smoke':1.2,
			'shadow':1.4,
			'blood':1.5,
			'ice':1.7	
		}
		this.aoe_dmg = 1.1
	}	
	use(){
		if(this.uses<5){
			this.uses=0;
			this.destroy();
		}
	}
	
	equip(wielder){
		super.equip(wielder);
		this.player.statusMessage = "found an ancient staff";
		return true;
	}	
	effect(state, data={}){
		let oP = ''
		switch(state){
			case "attack":
				if(data['counter']==false){
					this.player.inflict_status_effect(new Skulled(3));
				}
				
				this.last_spell = ['','']
				// super.effect("attack", data);
				oP = data['opponent']
				let spell = ['smoke','blitz']
				let cost = 0; 
				//insufficient runes
				if(this.uses < this.cost_data['smoke']){
					this.player.fightDmgB=0;
					this.player.statusMessage = "does not have enough runes to attack " +oP.name;
					return
				}
				
				//choose spell type
				let spell_lst = [['smoke',1]]
				if(this.uses >= this.cost_data['ice']){
					spell_lst = [['smoke',8], ['shadow',5],['blood',5+ Math.round(40*(1-(this.player.health/this.player.maxHealth)))],['ice',15]]
				}
				else if(this.uses >= this.cost_data['blood']){
					spell_lst = [['smoke',10], ['shadow',10],['blood',10+ Math.round(40*(1-(this.player.health/this.player.maxHealth)))]]
				}
				else if(this.uses >= this.cost_data['shadow']){
					spell_lst = [['smoke',10], ['shadow',20]]
				}
				log_message(spell_lst)
				spell[0] = roll(spell_lst)
				spell[1] = 'blitz'
				cost = this.cost_data[spell[0]]
								
				//aoe select
				let nearby_lst = []
				if(this.uses>= Math.round(cost*this.aoe_cost) ){
					nearby_lst = oP.nearbyPlayers(this.aoe_radius)
					if(20 + nearby_lst.length * 5 > roll_range(0,100)){
						spell[1] = 'barrage'
						cost = Math.round(cost*this.aoe_cost) 
					}					
				}
				log_message(spell)	
				
				//cast
				this.player.fightDmgB *= this.dmg_data[spell[0]]

				this.last_spell = spell
				//spell effects
				switch(spell[0]){
					case 'smoke':
						oP.inflict_status_effect(new Smoke(4, 5, this.player))
						break;
					case 'shadow':
						let temp_blind = new StatusEffect('blind', 7, roll_range(4,6), {"sightBonus":[-100,-10]}, false, this.player)
						temp_blind.icon = "👁️"
						oP.inflict_status_effect(temp_blind)
						break;
					case 'ice':
						oP.inflict_status_effect(new Frozen(3,roll_range(2,5), this.player))
						break;
				}
				//aoe attack
				if(spell[1]=='barrage'){
					this.player.fightDmgB *= this.aoe_dmg
					let hits = 0;
					for(let i=0; i<nearby_lst.length; i++){
						let dmg = 0
						let aoe_target = nearby_lst[i]
						if(aoe_target!=this.player && aoe_target.health >0 && Math.random()<0.6){
							switch(spell[0]){
								case 'smoke':
									dmg = roll_range(1, 5)
									oP.inflict_status_effect(new Smoke(2, 5, this.player))
									break;
								case 'shadow':
									dmg = roll_range(1, 10)
									let temp_blind = new StatusEffect('blind', 5, roll_range(1,2), {"sightBonus":[-100,-10]}, false, this.player)
									temp_blind.icon = "👁️"
									aoe_target.inflict_status_effect(temp_blind)
									break;
								case 'blood':
									dmg = roll_range(1, 8)
									log_message(this.player.name + " BLOOD aoe attack")
									this.player.health += Math.pow(dmg,0.66);
									break;
								case 'ice':
									dmg = roll_range(1, 15)		
									aoe_target.inflict_status_effect(new Frozen(1,roll_range(1,2), this.player))
									break;
							}
							aoe_target.take_damage(dmg, this.player, 'magic')
							//on hit
							if(aoe_target.health <=0){
								aoe_target.death="killed by "+this.player.name+"'s "+ spell[0] + " " + spell[1];
								pushMessage(aoe_target, "killed by  "+this.player.name+"'s "+ spell[0] + " " + spell[1]);
								this.player.kills++;
							}
							else{
								aoe_target.statusMessage = "hit by "+this.player.name+"'s "+ spell[0] + " " + spell[1]
								pushMessage(aoe_target, "hit by "+this.player.name+"'s "+ spell[0] + " " + spell[1]);
							}
							// aoe_target.finishedAction = true;
							// aoe_target.resetPlannedAction();
							aoe_target.currentAction.turn_complete = true;
							hits++;
						}
						if(hits>=8){
							break;
						}
					}
				}
				
				this.player.statusMessage = "casts " + spell[0] + " " + spell[1] + " on " + oP.name;
				this.uses = this.uses-cost
				this.use();
				break;
			case "dealDmg":
				oP=data['opponent'];
				let dmg=data['damage'];			
				if(this.last_spell[0]=='blood'){
					//heal on hit
					log_message(this.player.name + " BLOOD attack")
					// log_message(this.player.health + " before");
					log_message(dmg);
					this.player.health += Math.pow(dmg,0.66);
					// log_message(this.player.health + " after");
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	//blood barrage breaks if aoe also targets the target
	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Runes:</b>"+this.uses+"</span><br>"+
			this.stat_html()+
		"</div>"
		
				
		$('#extra_info_container').html(item_info);
	}

	stat_html(){
		let html = super.stat_html()+
		"<span class='desc'>"+
			"<span>Casts one of four spells</span><br>"+	
		"</span>"
		return html;
	}
}

class Rake extends Weapon {
	constructor() {
		super("rake");
		this.base_dmg = 0.5
		this.rake_dmg = 5
	}
	effect(state, data={}){
		let oP=''
		switch(state){			
			case "attack":
				oP = data['opponent']
				if(oP.has_attr('leaf')){
					this.player.fightDmgB *= this.rake_dmg;
					this.player.statusMessage = "RAKES " + oP.name;
				}
				else{
					this.player.fightDmgB *= this.base_dmg;
					this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
				}
				this.use();
				break;
			case "win":
				oP = data['opponent']
				if(oP.has_attr('leaf')){
					this.player.statusMessage = "RAKES "+oP.name+" to death"
					oP.death = "RAKED to death by "+this.player.name
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = "<span><b>Dmg Bonus:</b>x"+this.base_dmg+"</span><br>"+
		"<span><b>Rake Dmg Bonus:</b>x"+this.rake_dmg+"</span><br>"+
		"<span class='desc'>"+
			"<span>RAKE</span><br>"+
			"<span>RAKE</span><br>"+
			"<span>RAKE</span><br>"+
		"</span>"
		
		return html;
	}
}

class Cross extends Weapon {
	constructor() {
		super("cross");
		this.base_dmg = 1.1
		this.trigger_dmg = 3
		this.trigger_types = ['undead','homo','demon','vtubing']
	}
	effect(state, data={}){
		let oP=''
		let trigger = false;
		switch(state){			
			case "attack":
				oP = data['opponent']
				this.trigger_types.forEach(function(trig_type){
					if(oP.has_attr(trig_type)){
						trigger = true;
					}					
				})
				if(trigger){
					this.player.fightDmgB *= this.trigger_dmg;
					this.player.statusMessage = "smites " + oP.name;
				}
				else{
					this.player.fightDmgB *= this.base_dmg;
					this.player.statusMessage = "attacks " + oP.name + " with a " +this.name;
				}
				this.use();
				break;
			case "win":
				oP = data['opponent']
				this.trigger_types.forEach(function(trig_type){
					if(oP.has_attr(trig_type)){
						trigger = true;
					}					
				})
				if(trigger){
					this.player.statusMessage = "smites "+oP.name+" to death"
					oP.death = "Smited to death by "+this.player.name
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	stat_html(){
		let html = "<span><b>Dmg Bonus:</b>x"+this.base_dmg+"</span><br>"+
		"<span><b>Smite Dmg Bonus:</b>x"+this.trigger_dmg+"</span><br>"+
		"<span class='desc'>"+
			"<span>Smites unholy creatures</span><br>"+
		"</span>"
		
		return html;
	}
}






