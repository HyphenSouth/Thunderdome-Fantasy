var weapon_data = {
	"lance" : {
		"icon":"🔱",
		"dmg_type":"melee",
		"fightBonus":1.3,
		"uses":[4,9]
	},
	"gun" : {
		"icon":"🔫", 
		"dmg_type" : "ranged",
		"rangeBonus" : 20,
		"fightBonus" : 1.3,
		"uses" : 4		
	},	
	"bow" : {
		"icon":"🏹", 
		"dmg_type" : "ranged",
		"rangeBonus" : 30,
		"fightBonus" : 1.1,
		"uses" : 10		
	},
	"knife" : {
		"icon":"🔪", 
		"dmg_type" : "melee",
		"fightBonus" : 1.1,
		"uses" : [5,10]	
	},
	"nanasatsu" : {
		"icon" : "./icons/nanasatsu.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 2,
		"peaceBonus" : -500,
		"aggroBonus" : 500,
		// "dmgReductionB" : 1.05,
		"uses" : 99999
	},
    "katana" : {
		"icon" : "./icons/katana.png",
		"icon_type" : "img",
		"dmg_type":"melee",
		"uses":[4,9]
	},
    "shotgun" : {
		"icon" : "./icons/shotgun.png",
		"icon_type" : "img",
		"rangeBonus" : 25,
		"dmg_type":"ranged",
		"uses":[3,6]
	},
	"spicy" : {
		"icon" : "./icons/spicy.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 1.75,
		"uses" : 99999
	},
	"clang" : {
		"icon" : "./icons/clang.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"rangeBonus" : 5,
		"fightBonus" : 1.35,
		"uses" : [3,8]		
	},
	"flamethrower" : {
		"icon" : "./icons/flamethrower.png",
		// "icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "ranged",
		"rangeBonus" : 10,
		"fightBonus" : 0.95,
		"uses" : 8		
	},
	"sniper" : {
		"icon" : "./icons/sniper.png",
		"icon_type" : "img", 
		"dmg_type" : "ranged",
		"rangeBonus" : 40,
		"sightBonus" : 20,
		"uses" : 3		
	},
	"ancient" : {
		"icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "magic",
		"rangeBonus" : 24,
		"fightBonus" : 1.2,
		"uses" : 60		
	},
}
var wep_prob = 3;
var sexSword = true;
var spicy = true;
var defaultWeaponOdds = [
	["knife",30],["gun",20],["lance",25],["bow",20],
	["katana", 35], ["shotgun", 35], ["sniper",20],
	["clang",5], ["flamethrower",20], ["ancient", 5000],
	["Nothing",500]];

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

function create_weapon(weapon_name){
	switch(weapon_name){
		case "Nothing":
			return "";
			break;
		case "nanasatsu":
			return new Nanasatsu();
			break;		
		case "lance":
			return new Lance();
			break;
		case "katana":
			return new Katana();
			break;		
		case "sniper":
			return new Sniper();
			break;
		case "shotgun":
			return new Shotgun();
			break;
		case "spicy":
			return new Spicy();
			break;		
		case "clang":
			return new Clang();
			break;		
		case "flamethrower":
			return new Flamethrower();
			break;	
		case "ancient":
			return new Ancient();
			break;
		default:
			if(weapon_name in weapon_data){
				return new Weapon(weapon_name);
			}
			else{
				return "";
			}
			break;		
	}
}

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
			
			if("moveSpeedB" in data){this.moveSpeedB = processDataNum(data["moveSpeedB"])}
			
			if("uses" in data){this.uses = processDataNum(data["uses"])}
			
			if("dmg_type" in data){this.dmg_type=data["dmg_type"]}
		}		
	}
	
	replace_wep(new_weapon){
		this.wielder.weapon=new_weapon;
		new_weapon.equip(this.wielder);
		this.wielder=""
		return true;
	}
	
	unequip(){
		this.wielder="";
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
				this.wielder.div.removeClass("sexSword");
				break;
			case "death":
				break;
			//attacking before dealing damage to opponent
			case "attack":
				oP=data['opponent'];
				this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
				this.use();
				break;
			//after dealing damage
			case "dealDmg":
				break;
			case "win":
				oP=data['opponent'];
				this.wielder.statusMessage = "kills " + oP.name;
				break;
		}
	}
    destroy(){
		log_message(this.wielder.name +"'s " + this.name+" breaks");
		this.wielder.weapon = "";   
		super.destroy();
	}
	
	item_html(){
		let html = super.item_html()+
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
					this.wielder.health = 0;
					this.wielder.death = "Died by their own spear";
					this.wielder.die();
					log_message(this.wielder.name + ' killed by lance')
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	item_html(){
		let html = super.item_html()+
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
					this.wielder.fightDmgB *= this.super_crit_dmg;
					this.crit=true;
					this.wielder.statusMessage = "lands a SUPER critical hit on " + oP.name;
					log_message("SUPER CRIT")
				}
				else if(Math.random()<0.1){
					//crit
					this.wielder.fightDmgB *= this.crit_dmg;
					this.crit=true;
					this.wielder.statusMessage = "lands a critical hit on " + oP.name;
					log_message("CRIT")
				}
				else{
					this.wielder.fightDmgB *= this.base_dmg;
					this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
				}
				this.use();
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	item_html(){
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
					this.wielder.fightDmgB *= this.crit_dmg;
					this.wielder.statusMessage = "lands a headshot hit on " + oP.name;
					log_message("CRIT")
					this.crit = true;
				}
				else{
					this.wielder.fightDmgB *= this.base_dmg;
					this.wielder.statusMessage = "attacks " + oP.name + " with a sniper rifle";
				}
				this.use();
				break;
			case "win":
				oP=data['opponent'];
				if(this.crit){
					this.wielder.statusMessage = "turns " + oP.name + "'s brain into mush";
				}
				else{
					this.wielder.statusMessage = "kills " + oP.name;
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	item_html(){
		let html = "<span><b>Dmg Bonus:</b>x"+this.base_dmg+"</span><br>"+
		"<span><b>Headshot Dmg Bonus:</b>x"+this.crit_dmg+"</span><br>"+
		"<span class='desc'>"+
			"<span>Random chance to headshot</span><br>"+
		"</span>"
		
		return html;
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
			this.wielder.fightRangeB -= this.rangeBonus;
		}
	}
	reload(){
		if(this.uses>0){
			log_message(this.wielder.name + " reloads");
			this.wielder.statusMessage = "reloads their shotgun";
			this.wielder.lastAction = "reload"
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
				if(this.loaded_shells==0 && Math.random()<0.5){
					this.wielder.setPlannedAction("reloadShotgun", 2);
				}
				break;
			case "reloadShotgun":
				this.reload();
				this.wielder.resetPlannedAction();
				break;
			case "attack":
				oP=data['opponent'];
				counter=data['counter'];
				//loaded shotgun attack
				if(this.loaded_shells>0){
					log_message("SHOTGUN ATTACK")
					this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
					//calculate damage based on distance
					// currently linear scaling
					let target_dist = playerDist(this.wielder, oP);
					let dmg_bonus = ((this.dmg_range[0] - this.dmg_range[1])/this.max_range) * target_dist + this.dmg_range[1]
					if(target_dist<=this.max_range*0.1){
						dmg_bonus += 0.5;
						this.wielder.statusMessage = "hits " + oP.name +" at point blank with a shotgun";
					}
					if(target_dist>=this.max_range*0.9){
						dmg_bonus=this.dmg_range[0]
						this.wielder.statusMessage = "barely hits " + oP.name +" with a shotgun";
					}
					//collateral 
					if(target_dist>this.max_range*0.6){
						//get nearby opponents
						let nearby_lst = oP.nearbyPlayers((target_dist/this.max_range)*this.max_spread);
						let temp_wep = this;
						nearby_lst.forEach(function(unfortunate_victim,index){
							//cannot hit wielder
							if(unfortunate_victim != temp_wep.wielder && Math.random()<0.5){
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
									unfortunate_victim.death="killed by a stray pellet from "+temp_wep.wielder.name+"'s shotgun";
									pushMessage(unfortunate_victim, "killed by a stray pellet from "+temp_wep.wielder.name+"'s shotgun");
									temp_wep.wielder.kills++;
								}
								else{
									unfortunate_victim.statusMessage="hit by a stray pellet from "+temp_wep.wielder.name+"'s shotgun";
									pushMessage(unfortunate_victim, "hit by a stray pellet from "+temp_wep.wielder.name+"'s shotgun");
								}
								
								unfortunate_victim.finishedAction = true;
								unfortunate_victim.resetPlannedAction();
							}
						});		
					}
					log_message(dmg_bonus)
					this.wielder.fightDmgB *= dmg_bonus;
					this.loaded_shells--;				
				}
				else if(counter && Math.random()<0.2){
					//20% chance of reload instead of fighting back
					this.reload();
					this.wielder.fightDmgB *= 0;
					this.wielder.statusMessage = "reloads their shotgun instead of fighting back";
				}
				else{
					//no reload
					this.wielder.statusMessage = "attacks " + oP.name + " with an empty shotgun";
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	item_html(){
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
		this.wielder.statusMessage = "<span style='color:red'>found SEX SWORD</span>";
		if(this.prev_owners==0){
			pushMessage(this.wielder,this.wielder.name +  "<span style='color:red'> found SEX SWORD</span>");
		}
		else{
			if(this.kills<5){
				pushMessage(this.wielder ,this.wielder.name+ "<span style='color:red'> takes SEX SWORD</span>");
			}
			else{
				pushMessage(this.wielder , this.wielder.name + "<span style='color:red'> CONTINUES THE SLAUGHTER</span>");
			}				
		}
		return true;
	}	
	
	effect(state, data={}){
		let dmg=0;
		let oP="";
		switch(state){
			//turn start
			case "turnStart":
				this.wielder.div.addClass("sexSword");
				//lose health
				this.wielder.health -= (this.fightBonus - 1.5 + this.kills);
				//this.wielder.health -= (this.fightBonus +2000);
				//death message
				if(this.wielder.health <= 0){
					this.wielder.death = "Succumbed to SEX SWORD";
					this.wielder.die();
					log_message(this.wielder.name + ' killed by sword')
				}
				break;
			case "attack":
				oP=data['opponent'];
				this.wielder.statusMessage = "attacks " + oP.name + " with SEX SWORD";
				break;
			//dealing damage
			case "dealDmg":
				oP=data['opponent'];
				dmg=data['damage'];			
				//heal on hit
				log_message(this.wielder.name + " SEX SWORD attack")
				// log_message(this.wielder.health + " before");
				log_message(this.fightBonus + " before");
				log_message(dmg);
				this.wielder.health += Math.pow(dmg,0.66);
				this.fightBonus += dmg/1000;
				// log_message(this.wielder.health + " after");
				log_message(this.fightBonus + " after");
				break;
			//killing an opponent
			case "win":
				this.kills++;  
				this.fightBonus += 0.25;
				oP=data['opponent'];
				this.wielder.statusMessage = "kills " + oP.name+" and gets stronger";
				break;
			//killed by opponent
			case "lose":
				oP=data['opponent'];
				//transfer ownership to killer if killer is charmed
				//if(Math.random() > 0.1){
					if(oP.get_status_effect("charm")){
						if(oP.get_status_effect("charm").target==this.wielder){
							this.wielder.unequip_item("wep");
							this.prev_owners++;
							if(oP.equip_item(this,"wep")){
								log_message("sex sword is passed onto " + oP.name);
							}
						}
					}
				//}				
				break;
			//seen by player
			case "opAware":
				oP=data['opponent'];
				if (Math.random() > 0.3){
					let temp_charm = new Charm(this.wielder);
					temp_charm.level=10;
					temp_charm.aggro=true;
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
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"	+
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
		this.wielder.statusMessage = "<span style='color:red'>found the OL' SPICY SHINKAI MAKAI</span>";
		return true;
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
					this.wielder.inflict_status_effect(f)
				}
				break;
			case "attack":
				oP=data['opponent'];
				//set self on fire
				let tP_fire = new Burn(2,1,"")
				tP_fire.death_msg = "couldn't handle the ol' spicy shinkai makai"
				this.wielder.inflict_status_effect(tP_fire)
				//set opponent on fire
				let oP_fire = new Burn(5,3,this.wielder)
				oP.inflict_status_effect(oP_fire)
				
				this.wielder.statusMessage = "attacks " + oP.name + " with the OL' SPICY SHINKAI MAKAI";
				break;
			case "newStatus":
				//charm immunity
				let eff = data["eff"]
				if(eff.name == "charm"){
					this.wielder.remove_status_effect(eff);
					log_message(this.wielder.name +" cannot be charmed")
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
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"	+
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
		this.wielder = wielder;
		this.calc_bonuses();
		this.wielder.statusMessage =  "goes berserk";
		let never = new Berserk(2,10);
		this.wielder.inflict_status_effect(never);	
		return true;
	}	
	
	calc_bonuses(){
		this.fightBonus = this.fightBonusBase* (1+this.wielder.aggroB/1000)
		super.calc_bonuses()
	}
	
	effect(state, data={}){
		let oP = "";
		switch(state){
			case "turnStart":
				if(this.wielder.get_status_effect("berserk")=="" && Math.random()>0.6){
					let never = new Berserk(2,5);
					this.wielder.inflict_status_effect(never);	
				}
				break;
			case "attack":
				// super.effect("attack", data);
				oP=data['opponent'];
				if(this.wielder.get_status_effect("berserk")!=""){
					this.wielder.statusMessage = "goes BERSERK on " + oP.name;
				}
				else{
					this.wielder.statusMessage = "CLANGS " + oP.name;
				}
				this.use();
				break;
			case "win":
				oP=data['opponent'];
				this.wielder.statusMessage = "CLANGS " + oP.name+" to death";
				oP.death = "CLANGED to death by " + this.wielder.name;
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	item_html(){
		let html = 	super.item_html()+
		
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
				this.wielder.statusMessage = "attacks " + oP.name + " with a " +this.name;
				//set opponent on fire
				let oP_fire = new Burn(3,5,this.wielder)
				oP.inflict_status_effect(oP_fire)
				
				//aoe fire
				let aoe_radius = Math.min(playerDist(this.wielder, oP), this.rangeBonus);
				//get nearby opponents
				let nearby_lst = oP.nearbyPlayers(aoe_radius);
				let temp_wep = this;
				nearby_lst.forEach(function(unfortunate_victim,index){
					//cannot hit wielder
					if(unfortunate_victim != temp_wep.wielder && Math.random()<0.8){
						log_message("stray fire " + unfortunate_victim.name);
						let aoe_fire = new Burn(1,2,temp_wep.wielder)
						unfortunate_victim.inflict_status_effect(aoe_fire)
					}
				});	
				//set ground on fire
				if(getTerrainType(oP.x, oP.y) !="water" && Math.random()<0.5){
					let ground_fire = new FireEntity(oP.x, oP.y,this.wielder);
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
	item_html(){
		let html = 	super.item_html()+
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
			'ice':15,			
		}
		this.aoe_cost = 1.5
		this.aoe_radius = 24
	}	
	use(){
		if(this.uses<5){
			this.uses=0;
		}
	}
	effect(state, data={}){
		let oP = ''
		switch(state){
			case "attack":
				this.last_spell = ['','']
				// super.effect("attack", data);
				oP = data['opponent']
				let spell = ['','']
				let cost = 0; 
				//insufficient runes
				if(this.uses < this.cost_data['smoke']){
					this.wielder.fightDmgB=0;
					this.wielder.statusMessage = "does not have enough runes to attack " +oP.name;
					return
				}
				
				//choose spell type
				let spell_lst = [['smoke',1]]
				if(this.uses >= this.cost_data['ice']){
					spell_lst = [['smoke',10], ['shadow',5],['blood',15+ 40*(1-(this.wielder.health/this.wielder.maxHealth))],['ice',20]]
				}
				else if(this.uses >= this.cost_data['blood']){
					spell_lst = [['smoke',10], ['shadow',10],['blood',20+ 40*(1-(this.wielder.health/this.wielder.maxHealth))]]
				}
				else if(this.uses >= this.cost_data['shadow']){
					spell_lst = [['smoke',10], ['shadow',20]]
				}
				spell[0] = roll(spell_lst)
				spell[1] = 'blitz'
				cost = this.cost_data[spell[0]]
								
				//aoe
				if(this.uses>= Math.round(cost*this.aoe_cost) ){
					let nearby_lst = oP.nearbyPlayers(this.aoe_radius)
					if(nearby_lst.length>0 && 40 + nearby_lst.length * 5 > roll_range(0,100)){
						spell[1] = 'barrage'
						cost = Math.round(cost*this.aoe_cost) 
					}					
				}
				log_message(spell)				
				this.wielder.statusMessage = "casts " + spell[0] +' '+ spell[1] + " on " +oP.name;
				this.last_spell = spell
				this.uses = this.uses-cost
				this.use();
				break;
			case "dealDmg":
				oP=data['opponent'];
				let dmg=data['damage'];			
				if(this.last_spell[0]=='blood'){
					//heal on hit
					log_message(this.wielder.name + " BLOOD attack")
					// log_message(this.wielder.health + " before");
					log_message(dmg);
					this.wielder.health += Math.pow(dmg,0.66);
					// log_message(this.wielder.health + " after");
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
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"+
			"<span><b>Runes:</b>"+this.uses+"</span><br>"+
			this.item_html()+
		"</div>"
		
				
		$('#extra_info_container').html(item_info);
	}

	item_html(){
		let html = super.item_html()+
		"<span class='desc'>"+
			"<span>Casts one of four spells</span><br>"+	
		"</span>"
		return html;
	}
}








