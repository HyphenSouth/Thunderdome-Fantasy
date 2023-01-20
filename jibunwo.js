function generateJibunWo(){
	customMap = new JibunWoMap();
	loadMap(jibunwomap);
}
		
class JibunWoMap extends CustomMap{
	constructor(){
		super('JIBUN WO');
		this.control = "";
		this.kc = "";
	}
	
	game_start(){
		// let tempChar = players[roll_range(0, players.length-1)]
		let tempChar = players[0];
		tempChar.attributes.push(new GeassControl(tempChar));
		this.control = tempChar;
		
		defaultFoodOdds=[["pizza",95],["soup",5]];
	}
}


/*
commands
live: increased stats at low hp, increased foraging
die: attacks self
protect: protects target
attack: attack target
hand over: hand over items
mark: marks the ground every day
rampage: attack everything
*/
class GeassControl extends Attr{
	constructor(player){
		super("geass control", player);
		this.has_info = true;
		this.last_geass = 2;
		this.geass_count = 0;
	}
		
	choose_target(geass_type){		
		let tP = this.player;
		let target = ''
		// log_message(geass_type)
		if(geass_type=='positive'){ 
			//get the player with highest opinion
			this.player.awareOf.forEach(function(oP){
				if(tP==oP)
					return;
				if(oP.get_status_effect("geass control"))
					return;
				if(tP.opinions[oP.id] >0 && oP.awareOfPlayer(tP)){
					if(!target)
						target = oP;			
					else
						if(tP.opinions[oP.id]>tP.opinions[target.id])
							target = oP;
				}
			});
		}
		else if(geass_type=='negative'){
			//get the player with lowest opinion
			this.player.awareOf.forEach(function(oP){
				if(tP==oP)
					return
				if(oP.get_status_effect("geass control"))
					return;
				if(tP.opinions[oP.id] < 0 && oP.awareOfPlayer(tP)){
					if(!target)
						target = oP;					
					else
						if(tP.opinions[oP.id]>tP.opinions[target.id])
							target = oP;
				}
			});
		}
		else{
			//get random player
			let target_lst = [];
			this.player.awareOf.forEach(function(oP){
				if(tP==oP)
					return
				if(oP.get_status_effect("geass control"))
					return;
				if(oP.awareOfPlayer(tP)){
					target_lst.push(oP)
				}
			});
			target = target_lst[roll_range(0, target_lst.length - 1)];
		}		
		return target;
	}
	
	choose_geass(geass_type, target){
		let geass_lst = [['rampage',1]];
		if(geass_type=='positive'){ 
			geass_lst = [['live', 6], ['protect',15], ['mark',10], ['attack',8], ['rampage', 1], ['hand over',0]]
		}
		else if(geass_type=='negative'){			
			geass_lst = [['die', 1], ['attack self',9], ['protect', 6], ['attack',12], ['rampage', 5], ['hand over',7], ['hand over',0]]
		}
		else{
			geass_lst = [['hand over', 5],['mark', 5], ['protect', 5], ['attack',4], ['rampage', 1], ['hand over',0]]
		}
		return roll(geass_lst)
	}
	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.last_geass++;
				break;
			case "planAction":
				if(this.player.awareOf.length>0 && this.last_geass>1 && ((roll_range(0,100) + this.geass_count*2) < (70 + this.last_geass))){
					//choose a positive, neutral, or negative geass
					let geass_type_lst = [['positive',2],['neutral',13],['negative',5]];
					let geass_type = roll(geass_type_lst);
					let geass_data = {};
					let target =  this.choose_target(geass_type);
					let geass = this.choose_geass(geass_type, target);
					if(target){
						geass_data.command = geass;
						geass_data.target = target;
						geass_data.attr = this;
						this.player.setPlannedAction('geass command', 8, GeassCommandAction, geass_data);
					}
				}
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
		"<span class='desc'>"+
			"<span>Geassed: "+this.geass_count+"</span><br>"+
		"</span>"
		return html;
	}
}

class GeassCommandAction extends Action{
	constructor(player, data){
		super("geass command", player);
		this.attr = data.attr;
		this.target = data.target;
		this.command = data.command;
	}
	perform(){
		if(this.target.health<=0){
			this.player.statusMessage = "tries to  Geass " + this.target.name + "'s corpse";
			this.player.lastActionState = "geass fail";
			return;
		}
		if(!this.target.awareOfPlayer(this.player) || !this.player.awareOfPlayer(this.target)){
			this.player.statusMessage = "unable to make eye contact with " + this.target.name;
			this.player.lastActionState = "geass fail";
			return;
		}
		if(this.target.get_status_effect("geass control")){
			this.player.statusMessage = "unable to Geass " + this.target.name;
			this.player.lastActionState = "geass fail";
			return;
		}
		let attack_target = '';
		switch(this.command){
			case "live":
				this.player.statusMessage = "commands " + this.target.name+" to LIVE";
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to LIVE");
				break;
			case "die":
				this.player.statusMessage = "commands " + this.target.name+" to KILL THEMSELVES NOW";
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to KILL THEMSELVES NOW");
				if(roll_range(0,100)<2){
					this.target.health=1;
					this.target.statusMessage = "geassed by " + this.player.name + " to kill themself, but barely survives";
				}
				else{
					this.target.health=0;
					this.target.death = "geassed by " + this.player.name + " to KILL THEMSELVES NOW";
				}
				break;
			case "protect":
				this.player.statusMessage = "commands " + this.target.name+" to protect them";
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to protect them");
				break;
			case "attack":				
				let tA = this;
				players.forEach(function(oP){
					if(oP==tA.player)
						return;
					if(oP==tA.target)
						return;
					if(!attack_target)
						attack_target = oP;
					else
						if(tA.player.opinions[oP.id]< tA.player.opinions[attack_target.id])
							attack_target = oP;
				});
				if(!attack_target){	
					this.player.statusMessage = "commands " + this.target.name+" to hurt themselves";
					pushMessage(this.player, this.player.name + " commands " + this.target.name+" to hurt themselves");
					this.command = "attack self";
					break;
				}
				this.player.statusMessage = "commands " + this.target.name+" to attack " + attack_target.name;
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to attack " + attack_target.name);
				break;
			case "attack self":
				this.player.statusMessage = "commands " + this.target.name+" to hurt themselves";
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to hurt themselves");
				break;
			case "hand over":
				this.player.statusMessage = "commands " + this.target.name+" to hand over their items";
				pushMessage(this.player, this.player.name + " commands " + this.target.name+" to hand over their items");
				break;
			case "rampage":
				this.player.statusMessage = "accidentally commands " + this.target.name+" to kill everyone";
				pushMessage(this.player, this.player.name + " accidentally commands " + this.target.name+" to kill everyone");
				break;
			case "mark":
				this.player.statusMessage = "commands " + this.target.name+" to dig once a day at noon";
				pushMessage(this.player, this.player.name + "  commands " + this.target.name+" to dig once a day at noon");
				break;
			default:
				this.player.statusMessage = "commands " + this.target.name+" to " + this.command;
				pushMessage(this.player, this.player.name + " commands " + this.target.name+ " to " + this.command);
				break;
		}
		let temp_geass = '';
		if(this.command=="attack")
			temp_geass = new GeassControlStatus(this.command, this.player, {'target':attack_target});
		else
			temp_geass = new GeassControlStatus(this.command, this.player);
		this.target.inflict_status_effect(temp_geass);
		
		if(this.target.currentAction.turn_complete==false){
			if(this.command=="attack self" && this.target.actionPriority<15)	
				this.target.currentAction = new GeassObeyAction(this.target, {'eff':temp_geass,'source':this.target,'command':"attack self"})
			else if(this.command=="hand over" && this.target.actionPriority<15)
				if((this.target.weapon || this.target.offhand) && playerDist(this.player, this.target)<=50)
					this.target.currentAction = new GeassObeyAction(this.target, {'eff':temp_geass,'source':this.target,'command':"hand over"})
		}
		this.player.lastActionState = "geass success";
		this.attr.geass_count++;
		this.attr.last_geass = 0;
	}
}

class GeassObeyAction extends Action{
	constructor(player, data){
		super("geass obey", player);
		this.source = data.source;
		this.eff = data.eff;
		this.command = data.command
		if(this.command == 'mark'){
			this.energy_cost = 20;
		}
	}
	perform(){
		switch(this.command){
			case "attack self":
				fight_target(this.player, this.player);
				if(this.player.health<=0){
					this.player.statusMessage = "geassed by " + this.source.name + " into kill themself... NOW";
					this.player.death = "geassed by " + this.source.name + " into an heroing";
					this.source.kills++;
				}
				else{
					this.player.statusMessage = "geassed by " + this.source.name + " to attack themself";
				}
				this.player.lastActionState = "geass self attack";
				this.eff.last_obey = 0;
				break;
			case "hand over":
				if(!this.player.awareOfPlayer(this.source) || playerDist(this.player, this.source)>50){
					this.player.statusMessage = "unable to hand over their items to " + this.source.name;
					this.player.lastActionState = "geass trade fail";
					break;
				}
				if(this.source.health<=0){
					this.player.statusMessage = "gives their items to " + this.source.name + "'s corpse";
					this.player.lastActionState = "geass trade ded";
					break;
				}
				let traded = false;
				if(this.player.weapon && this.player.weapon.tradable){
					let temp_wep = this.player.weapon;
					if(this.player.unequip_item('wep')){
						this.source.equip_item(temp_wep);
						log_message(this.source.name + " takes " + this.player.name + "'s " + temp_wep.name);
						traded = true;
					}
				}
				if(this.player.offhand && this.player.offhand.tradable){
					let temp_off = this.player.offhand;
					if(this.player.unequip_item('off')){
						this.source.equip_item(temp_off);
						log_message(this.source.name + " takes " + this.player.name + "'s " + temp_off.name);	
						traded = true;
					}		
				}
				if(traded)
					this.player.statusMessage = "hands over their items to " + this.source.name;
				else
					this.player.statusMessage = "has nothing to give to " + this.source.name;
				this.player.lastActionState = "geass trade";
				this.eff.last_obey = 0;
				break;
			case "mark":
				let tempTrap = new TrapEntity(this.player.x, this.player.y,this.player, this.attr);
				tempTrap.duration=5;
				tempTrap.triggerChance=20;
				// tempTrap.draw();
				// doodads.push(tempTrap);
				createDoodad(tempTrap);
				this.player.statusMessage = "digs a hole like they were told";
				this.player.lastActionState = "geass dig";
				this.eff.dug = true;
				this.eff.last_obey = 0;
				break;
		}
	}	
}

command_data = {
	'live':'LIVE', 
	'die':'DIE', 
	'protect':'Defend', 
	'attack':'Attack', 
	'attack self':'Self harm', 
	'hand over':'Give items', 
	'rampage':'KILL', 
	'mark':'Mark ground',
	'table':'I AM THE TABLE'
}

class GeassControlStatus extends StatusEffect{
	constructor(command, owner, data){
		super("geass control", 1, 9999);
		this.display_name = "Geass"
		this.owner = owner;
		this.command = command;
		this.icon = setEffIcon('./icons/geass.png')
		if(this.command == 'rampage'){
			this.fightBonus = 1.1;
			this.dmgReductionB = 0.9;
			this.aggroBonus=1000;
			this.intimidationBonus=20;
			this.moveSpeedB = 1.2;
		}
		else if(this.command == 'attack'){
			this.target = data.target;
		}else if(this.command == 'mark'){
			this.dug = true;
		}
		this.last_obey = 50000;
	}
	
	calc_bonuses(){
		if(this.command=='live'){
			let health_percent = this.player.health/this.player.maxHealth;
			if(health_percent>0.2 && health_percent<0.9){
				this.moveSpeedB = 1.1;
				this.dmgReductionB = 0.9+health_percent/20;	
				this.fightBonus = 1.5-health_percent/2;
			}
			else if(health_percent<=0.2){
				this.moveSpeedB = 1.5;
				this.dmgReductionB = 0.5+health_percent/20;	
				this.fightBonus = 2 - health_percent/2;
			}
			else{
				this.moveSpeedB = 1;
				this.dmgReductionB = 1;	
				this.fightBonus = 1;
			}
		}		
		super.calc_bonuses();
	}
	
	//cannot be stacked
	stack_effect(eff){
		return false
	}
	wear_off(){
		super.wear_off()
	}
	effect(state, data={}){		
		switch(state){
			case "turnStart":
				if(this.command=='mark' && !this.dug){
					this.player.take_damage(roll_range(0, this.last_obey*2),'','none');
					if(this.player.health<0)
						this.player.death = "dies from not being able to dig";
				}
				break;
			case "planAction":
				switch(this.command){
					case "live":
						if(this.player.health/this.player.maxHealth<0.2)
							this.player.setPlannedAction('forage', 12, ForageAction);
						break;
					case "attack":
						if(this.player.inRangeOfPlayer(this.target))
							this.player.setPlannedAction("fight", 18,FightAction, {'target':this.target});
						else if(this.player.awareOfPlayer(this.target))
							this.player.setPlannedAction("follow", 15, FollowAction, {'target':this.target});
					case "rampage":
						if(this.player.inRangeOf.length>0)
							this.player.setPlannedAction("fight", 18,FightAction, {'target':this.player.inRangeOf[roll_range(0,this.player.inRangeOf.length-1)]});
						break;
					case "protect":
						if(this.owner.last_opponent && this.player.inRangeOfPlayer(this.owner.last_opponent) && this.owner.last_opponent.health>0)
							this.player.setPlannedAction("fight", 10,FightAction, {'target':this.owner.last_opponent});
						else if(this.owner.rival && this.player.inRangeOfPlayer(this.owner.rival))
							this.player.setPlannedAction("fight", 10,FightAction, {'target':this.owner.last_opponent});
						else if(this.player.awareOfPlayer(this.owner))
							this.player.setPlannedAction("follow", 10, FollowAction, {'target':this.owner});
						break;
					case "attack self":
						if(roll_range(0,100)<1+this.last_obey/5)
							this.player.setPlannedAction("geass obey", 15, GeassObeyAction, {'eff':this,'source':this.owner,'command':"attack self"});
						else
							this.last_obey++;
						break;
					case "hand over":
						if((this.player.weapon || this.player.offhand) && this.player.awareOfPlayer(this.owner)){
							if(playerDist(this.player, this.owner)<=50)
								this.player.setPlannedAction("geass obey", 15, GeassObeyAction, {'eff':this,'source':this.owner,'command':"hand over"});
							else
								this.player.setPlannedAction("follow", 10, FollowAction, {'target':this.owner});
						}
						break;
					case "mark":
						if((hour == 12 || !this.dug)&& this.player.energy>20){
							this.dug = false;
							this.last_obey++;
							this.player.setPlannedAction("geass obey", 15, GeassObeyAction, {'eff':this,'source':this.owner,'command':"mark"});
						}
						break;

				}
				break;
			case "attack":
				if(this.command=='attack' && data.opponent==this.target)
					this.player.fightDmgB *= 1.1;
				if(data.opponent==this.owner)
					this.player.fightDmgB *= 0.9;
				break;
		}
	}
	
	stat_html(){
		let html= super.stat_html()+
		"<span class='desc'>"
		if(this.command=='attack')
			html+="<span>Attack "+this.target.name+"</span><br></span>"
		else
			html+="<span>"+command_data[this.command]+"</span><br></span>"
		return html;
	}
}

class GeassCanceller extends Offhand{}

class GeassRolo extends Attr{}
class GeassFreezeAction extends Action{}
class GeassFreeze extends StatusEffect{}









