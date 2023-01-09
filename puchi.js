//summons gremlins when in water
MAX_GREMLINS = 30
class Harukasan extends Attr{	
	constructor(player){
		super("harukasan", player);
		this.has_info = true;
		this.gremlins = []
	}
	
	multiply(amount=1){
		for(let i=0; i<amount; i++){
			if(this.gremlins.length<MAX_GREMLINS){				
				// log_message('harukasan multiply')
				let tempCreature = new Gremlin(this.player.x + roll_range(-20,20), this.player.y + roll_range(-20,20),this.player, this);
				tempCreature.draw();
				doodads.push(tempCreature);
				this.gremlins.push(tempCreature);
			}
		}
	}
	
	effect(state, data={}){
		let oP='';
		switch(state){
			case "equipItem":
				if(data.item == 'water'){
					this.multiply(roll_range(1,5))
					this.player.statusMessage = 'finds a glass of water'
				}
				break;
			case "attack":
				oP=data['opponent'];
				this.player.statusMessage = "tries to eat " + oP.name;
				break;
			//after dealing damage
			case "dealDmg":
				let dmg=data['damage'];
				this.player.health += Math.pow(dmg,0.33);
				break;
			case "win":
				oP=data['opponent'];
				this.player.statusMessage = "feasts on " + oP.name;
				this.player.health += 5;
				oP.death = "devoured by " + this.player.name;	
				this.player.exp += 5;
				break;
			case "turnEnd":
				this.gremlins.forEach(function(gremlin){
					gremlin.move();
				});
				if(!this.player.ignore_terrain && getTerrainType(this.player.x, this.player.y) == "water")
					this.multiply();
				break;
			case "death":
				this.gremlins.forEach(function(gremlin){
					gremlin.destroy();
				});
				break;				
		}
	}	
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				return [['water',50],['Nothing',70]];
				break;
		}
		return x
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Hellspawns:</b>"+this.gremlins.length+"</span><br>"		
		return html;
	}
}
class Gremlin extends MovableEntity{
	constructor(x,y,owner, attr){
		super(owner.name + "'s gremlin",x,y,owner);
		this.attr = attr
		this.img = './icons/harukasan.png';
		
		//chance to trigger
		this.triggerChance=25;
		this.ownerTriggerChance = -10;		
		this.triggerRange = 25;
		this.max_triggers=1;
		
		this.duration=25;
		this.moveSpeed = 30;
		
		//duration before gremlin can multiply again
		this.multiply_delay = roll_range(3,6)
	}
	
	draw(){
		let doodDiv = $('#doodad_' + this.id)
		if(!doodDiv.length){
			$('#doodads').append(
			"<div id='doodad_" + this.id + "' class='doodad harukasan' style='transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px);'>" + 
				// this.name+
			"</div>");
			doodDiv = $('#doodad_' + this.id);
			doodDiv.css('background-image',"url(" + this.img + ")");
			this.div = doodDiv;
		}
	}
	
	trigger(tP){
		let dmg = roll_range(1,3)
		if(dmg>tP.health)
			dmg = tP.health;
		tP.take_damage(dmg, this, 'unarmed')
		this.owner.health += 0.1;
		if(tP.currentAction.name)
			tP.currentAction.entity_attacked(this)
		pushMessage(tP, tP.name+' attacked by '+this.name+' for '+ roundDec(dmg) +' damage');
		if(tP.health<=0){
			tP.death = "consumed by " + this.name;
			this.owner.kills++;
		}
		this.duration-=5;
		if(this.duration<=0)
			this.expire();
	}
	
	move(){
		this.moveToTarget(this.owner.x + roll_range(-20,20), this.owner.y + roll_range(-20,20));
	}
	
	update(){
		if(this.owner.health<=0){
			this.destroy;
			return;
		}
		if(this.multiply_delay<=0 && getTerrainType(this.x, this.y) == "water"){
			if(this.attr.gremlins.length<MAX_GREMLINS){		
				let tempCreature = new Gremlin(this.x + roll_range(-10,10), this.y + roll_range(-10,10), this.owner, this.attr);
				tempCreature.draw();
				doodads.push(tempCreature);
				this.attr.gremlins.push(tempCreature);
			}
		}		
		if(this.multiply_delay>0)
			this.multiply_delay--;
		super.update();		
	}
	destroy(){
		this.attr.gremlins = arrayRemove(this.attr.gremlins,this);
		super.destroy();
	}
}

//does double damage against booba
//suffocates opponents and causes debuffs
class Chihya extends Attr{	
	constructor(player){
		super("chihya", player);
		this.has_info = true;
		this.booba_dmg = 2;
		this.rangeBonus = 25;
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "dmgCalcOut":
				if(x<=0)
					break;
				if(this.meter<this.max_meter)
					break;
				let eff_data = {
					"rangeBonus":[10, 0],
					"fightBonus":[0.8, -0.05],
					"moveSpeedB":[0.6, -0.05],
				}
				// (name, level, duration, owner, dmg_type, death_msg, data)
				let temp_eff = new DotEffect("tangled", 1, roll_range(2,4), this.player, "hair", "suffocated by " + this.player.name +"'s hair", eff_data);
				temp_eff.icon = "💇"
				temp_eff.stack_type = "lvlduration";
				log_message(data)
				data.opponent.inflict_status_effect(temp_eff);				
				break;
		}
		return x;
	}
}

var DEKO_BEAM_RANGE = 200
//fires 5head beam
class Io extends Attr{
	constructor(player){
		super("io", player);
		// this.deko_charge = 20;
		this.deko_charge = 25;
		this.deko_fire_charge = 30;
		this.has_info = true;
	}
	
	// calc_bonuses(){
		// if(this.deko_charge>=this.deko_fire_charge)
			// this.rangeBonus = 100
		// else
			// this.rangeBonus = 0
		// super.calc_bonuses()
	// }
	
	fire_beam(target){
		let power = Math.min(Math.max(this.deko_charge/this.deko_fire_charge,1), 5)			
		let tempBeam = new DekoBeamEntity(this.player.x, this.player.y, power, this.player, this.owner, target);
		tempBeam.draw();
		doodads.push(tempBeam);
		tempBeam.activate()
		this.deko_charge = 0;
		this.player.statusMessage = "fires a deko beam at "+ target.name
		this.player.lastActionState = 'beam attack'
	}
	
	effect(state, data={}){
		let oP='';
		switch(state){
			case "turnStart":
				this.deko_charge++
				// this.fire_beam(players[roll_range(0, players.length-1)])
				break;
			/*
			case "attack":
				oP=data['opponent'];
				if(this.deko_charge>=this.deko_fire_charge){
					this.fire_beam(oP);
					this.player.statusMessage = "fires a deko beam at " + oP.name;
					data.fightMsg.events.push(this.player.name + " fires a deko beam");
				}
				break;
			*/
			case "surroundingCheck":
				if(this.deko_charge<this.deko_fire_charge)
					return
				if(!this.player.incapacitated)
					this.player.inRangeOf = this.player.nearbyPlayers(DEKO_BEAM_RANGE);
				if(this.player.awareOf.length>0)
					this.player.fight_target = this.player.choose_fight_target();
				break;
			case "planAction":
				if(this.deko_charge<this.deko_fire_charge)
					return
				if(this.player.plannedAction=="fight"){			
					this.player.plannedAction = "dekoBeamAttack";
					this.player.plannedActionClass = DekoBeamAttackAction;
					this.player.plannedActionData.attr = this;
				}
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Beam Charge:</b>" + (roundDec(this.deko_charge/this.deko_fire_charge)*100) + "%</span><br>"		
		return html;
	}
}
class DekoBeamAttackAction extends FightAction{
	constructor(player, data){		
		super(player,data);
		this.name = "deko beam attack"
		this.attr = data.attr
	}
		
	perform(){
		super.perform();
		if(this.target.health>0){
			if(this.attr.deko_charge>=this.attr.deko_fire_charge){
				this.attr.fire_beam(this.target)
			}
		}
	}
}
class DekoBeamEntity extends Doodad{
	constructor(x,y, power, owner, attr, target){
		super("dekobeam",x,y,owner);
		this.attr = attr;
		this.target = target;	
		
		this.angle = entityAngle(this, target);
		if(isNaN(this.angle)){
			this.angle = roll_range(0,359);
		}
				
		this.power = power;		
		this.range = DEKO_BEAM_RANGE * this.power;
		this.radius = 30;
		
		this.endpoint = [Math.cos(degToRad(this.angle))*(this.range) + this.x, Math.sin(degToRad(this.angle))*(this.range) + this.y]
		// this.m = (this.endpoint[1]-this.y)/(this.endpoint[0]-this.x)
		// this.b = this.y-this.m*this.x		
		// this.line = new LineSeg({'p1':[x,y], 'angle':this.angle})
		this.line = new LineSeg([x,y], this.endpoint)
		
		let tolerance = 15
		this.width = this.range - tolerance
		this.height = 25
		this.icon = "<img style='width:"+this.width+"px;height:"+this.height+"px;' src='./icons/deko_beam.png'></img>"
		
		//chance to trigger
		this.triggerChance=-100;
		this.ownerTriggerChance = -100;
		this.triggerRange = 0;
		this.max_triggers=0;
		
		this.duration=1;
	}
	
	activate(){
		let tD = this;
		let beamed = []
		players.forEach(function(oP){
			if(oP==tD.owner)
				return
			if(oP==tD.target){
				beamed.push(oP)
				return
			}
			//find dist of player from center of beam
			let dist = tD.line.pointDist([oP.x, oP.y])
			log_message(oP.name+' '+dist)
			if(dist<=tD.radius)
				beamed.push(oP)			
		});
		log_message(beamed)
		beamed.forEach(function(oP){
			let dist = entityDist(tD, oP)
			let dmg = 0;
			if(oP==tD.target){
				dmg = 20 + roll_range(15, 30) * tD.power;
				oP.take_damage(dmg);
				log_message(dmg);
				
				let temp_blind = new StatusEffect('blind', 7, 5, {"sightBonus":[-100,-10]}, false, tD.owner)
				temp_blind.icon = "👁️"
				oP.inflict_status_effect(temp_blind)
				
				let temp_burn = new Burn(Math.round(1+tD.power),roll_range(2,2*tD.power),tD.owner)
				oP.inflict_status_effect(temp_burn)				
			}
			else{
				dmg = 5 + roll_range(15, 20) * tD.power *  Math.min(DEKO_BEAM_RANGE/(dist+50),0.5);
				oP.take_damage(dmg);
				
				if(roll_range(0,99)>((dist-75)/3)){
					let temp_blind = new StatusEffect('blind', 2, 3, {"sightBonus":[-100,-10]}, false, tD.owner)
					temp_blind.icon = "👁️"
					oP.inflict_status_effect(temp_blind)
				}
				if(roll_range(0,99)>((dist-25)/2)){
					let temp_burn = new Burn(2,roll_range(1,1*tD.power),tD.owner)
					oP.inflict_status_effect(temp_burn)
				}				
			}
			if(oP.currentAction)
				oP.currentAction.entity_attacked(tD)
			oP.statusMessage = "hit by "+ tD.owner.name +"'s deko beam"
			pushMessage(oP, oP.name + " hit by "+ tD.owner.name +"'s deko beam");
			if(oP.health<=0){
				oP.death = "incinerated by " + tD.owner.name + "'s deko beam"
				tD.owner.kills++;
			}
			
			// pushMessage(oP, oP.name + " hit by "+ tD.owner.name +"'s deko beam");
			// log_message(dist)			
		});
		let fire_count = Math.round(3*(this.power));
		for(let i=0; i<fire_count; i++){
			let rand_num = roll_range(Math.min(this.line.p1[0],this.line.p2[0]),Math.max(this.line.p1[0],this.line.p2[0]));
			let rand_x = rand_num + (roll_range(-25,25));
			let rand_y = this.line.getY(rand_num) + (roll_range(-25,25));
			let tempFire = new FireEntity(rand_x, rand_y, "")
			tempFire.draw()
			tempFire.duration = 2;
			doodads.push(tempFire);	
		}
	}
	
	update(){		
		if(this.duration<=0){
			this.expire();
			return;
		}
		this.duration--;
	}
	
	draw(){
		let doodDiv = $('#doodad_' + this.id);
		if(!doodDiv.length){
			$('#doodads').append(
			"<div id='doodad_" + this.id + "' class='doodad'" +
				"style='transform:translate("+(this.x/1000*$('#map').width()-iconSize/2)+"px,"+(this.y/1000* $('#map').height()-iconSize/2)+"px) rotate("+this.angle+"deg); z-index:1;"+				
			"'>"+ 
				this.icon + 
			"</div>");
			doodDiv = $('#doodad_' + this.id);
			this.div = doodDiv;
		}
		else{
			this.div.html(this.icon);
		}
	}
}

//can only find money
//purchases upgrades for itself
class Yayo extends Attr{
	constructor(player){
		super("yayo", player);
		this.has_info = true;
		this.okane = 1000;
		
		this.fightBonus = 1;
		this.dmgReductionB = 1;
		
		this.sightBonus = 0;		
		this.rangeBonus = 0;
		
		this.intimidationBonus=0;		
		this.moveSpeedB = 1;
		
		this.total_purchases = 0;
		this.total_spent = 0;
		this.upgrades = [
			{'name':'fightBonus', 'cost': 400, 'count': 0, 'chance':25},		//0
			{'name':'dmgReductionB','cost': 300, 'count': 0, 'chance':30},		//1
			{'name':'sightBonus','cost': 200, 'count': 0, 'chance':20},			//2
			{'name':'rangeBonus','cost': 200, 'count': 0, 'chance':30},			//3
			{'name':'intimidationBonus','cost': 100, 'count': 0, 'chance':5},	//4
			{'name':'moveSpeedB','cost': 200, 'count': 0, 'chance':15},			//5
			{'name':'health','cost': 1000, 'count': 0, 'chance':20},			//6
			{'name':'maxHealth','cost': 5000, 'count': 0, 'chance':10},			//7
			{'name':'energy','cost': 200, 'count': 0, 'chance':2},				//8
			{'name':'maxEnergy','cost': 1000, 'count': 0, 'chance':5},			//9
		]
		this.target_upgrade=''
	}
	
	choose_upgrade(){
		let tP = this.player;
		let upgrade_lst = [];
		this.upgrades.forEach(function(u){
			if(u.name=='health'){
				if(tP.health/tP.maxHealth<0.2)
					upgrade_lst.push([u, u.chance+60]);
				else if(tP.health/tP.maxHealth<0.4)
					upgrade_lst.push([u, u.chance+25]);
				else if(tP.health/tP.maxHealth<0.6)
					upgrade_lst.push([u, u.chance+10]);
				else if(tP.health/tP.maxHealth<0.9)
					upgrade_lst.push([u, u.chance+Math.max(20-u.count,0)]);
			}
			else if(u.name=='energy'){
				if(tP.energy/tP.maxEnergy<0.3)
					upgrade_lst.push([u, u.chance+40]);
				else
					upgrade_lst.push([u, u.chance+Math.max(20-u.count,0)]);
			}
			else
				upgrade_lst.push([u, u.chance+Math.max(20-u.count,0)])
			
		});
		log_message('yayo upgrade list')
		log_message(upgrade_lst)
		if(upgrade_lst.length>0){
			this.target_upgrade = roll(upgrade_lst)
			log_message('yayo wants '+this.target_upgrade)
		}
			
	}
	
	effect(state, data={}){
		switch(state){
			case "equipItem":
				if(data.item == 'okane'){
					let money = roll_range(200,2000);
					this.player.statusMessage = 'finds ' + money + ' yen'
					this.okane += money;
				}
				break;
			case "planAction":
				if(!this.target_upgrade)
					this.choose_upgrade();
				else {
					if(this.okane>=this.target_upgrade.cost){
						if(roll([['buy', (this.okane-200)*1.5],['save',1500 + this.total_purchases * 10]]) == 'buy'){
							this.player.setPlannedAction("buy", 7, YayoPurchaseAction,{'attr':this, 'upgrade':this.target_upgrade})
							return
						}
					}
					if(this.player.health<30){
						this.target_upgrade = this.upgrades[6];
					}
					else if(this.player.energy<20){
						this.target_upgrade = this.upgrades[8];
					}
					else if(this.okane<this.target_upgrade.cost*0.8){
						//switch targets
						if(roll_range(0,this.target_upgrade.cost)<roll_range(0, this.okane))
							this.choose_upgrade();
					}					
				}				
				if(this.okane<roll_range(100,this.target_upgrade.cost))
					this.player.setPlannedAction('forage', 6, ForageAction);
		
				break;
				
		}
	}	

	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				return [['okane',50],['Nothing',20]];
				break;
		}
		return x
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>💰:</b>"+this.okane+"</span><br>"+
			"<span><b>Total purchases:</b>"+this.total_purchases+"</span><br>"+
			"<span><b>Total money spent:</b>"+this.total_spent+"</span><br>"+
			"<span><b>Target Upgrade:</b>"+this.target_upgrade.name+"</span><br>"
		
		return html;
	}
}
class YayoPurchaseAction extends Action{
	constructor(player,data){
		super("yayo buy",player)
		this.attr=data.attr
		this.upgrade = data.upgrade
	}
	
	perform(){
		let cost = this.upgrade.cost;
		if(this.attr.okane<cost){
			this.player.lastActionState = 'purchase fail'
			this.player.statusMessage = 'too poor to afford nice things'
			return
		}
		
		this.attr.okane -= cost;
		this.upgrade.count++;
		this.attr.total_purchases++;
		this.attr.total_spent+=cost;
			
		switch(this.upgrade.name){
			case "fightBonus":
				this.attr.fightBonus*=1.1;
				this.player.statusMessage = 'buys more attack power for '+ cost + ' yen';	
				if(this.upgrade.count%2==0)
					this.upgrade.cost += 50;
				break;
			case "dmgReductionB":
				this.attr.dmgReductionB*=0.95;
				this.player.statusMessage = 'buys more defense for '+ cost + ' yen';
				if(this.upgrade.count%5==0)
					this.upgrade.cost += 50;
				break;
			case "sightBonus":
				this.attr.sightBonus+=2;
				this.player.statusMessage = 'buys stronger eyes for '+ cost + ' yen';
				if(this.upgrade.count%5==0)
					this.upgrade.cost += 50;
				break;
			case "rangeBonus":
				this.attr.rangeBonus += 5;
				this.player.statusMessage = 'buys longer arms for '+ cost + ' yen';
				if(this.upgrade.count%5==0)
					this.upgrade.cost += 20;
				break;
			case "intimidationBonus":
				this.attr.intimidationBonus += 10;
				this.player.statusMessage = 'becomes scarier for '+ cost + ' yen';
				if(this.upgrade.count%10==0)
					this.upgrade.cost += 10;
				break;
			case "moveSpeedB":
				this.attr.moveSpeedB *= 1.05;
				this.player.statusMessage = 'buys faster legs for '+ cost + ' yen';
				if(this.upgrade.count%5==0)
					this.upgrade.cost += 50;
				break;
			case "health":
				this.player.health += 20;
				this.player.statusMessage = 'heals itself for '+ cost + ' yen';
				if(this.upgrade.count%3==0)
					this.upgrade.cost += 50;
				break;
			case "maxHealth":
				this.player.maxHealth += 5;
				this.player.statusMessage = 'increases its vitality for '+ cost + ' yen';
				this.upgrade.cost += 20;
				break;
			case "energy":
				this.player.energy += 50;
				this.player.lastSlept = Math.max(0,this.player.lastSlept-12);
				this.player.statusMessage = 'recharges itself for '+ cost + ' yen';
				break;
			case "maxEnergy":
				this.player.maxEnergy += 10;
				this.player.statusMessage = 'increases its stamina for '+ cost + ' yen';
				this.upgrade.cost += 20;
				break;
			
		}
		this.player.lastActionState = 'purchase success';
		this.attr.target_upgrade = '';
		
	}	
}

//partnered with each other
//weakens if partner dies
//teleports to each other
//transfers hp between each other
class Koamimami extends Attr{
	constructor(player, data){
		super("koamimami", player);
		this.has_info = true;
		this.partner = '';
		this.partner_attr = '';

		this.revive = false;		
		this.merged = false;
		
		if(!this.partner){
			this.set_partner()
		}
	}
	
	set_partner(){
		let tA = this;
		players.forEach(function(oP){
			if(oP == tA.player)
				return
			let tempAttr = oP.get_attr(tA.name);

			if(tempAttr){
				tA.partner = oP;
				tA.partner_attr = tempAttr;
				tempAttr.partner = tA.player;
				tempAttr.partner_attr = tA;
				log_message(tA.player.name + ' partner ' + oP.name);
				// tA.player.opinions[oP.id] = 300;
				// oP.opinions[tA.player.id] = 300;
				
				// create_alliance(tA.player, oP);				
				// tA.player.alliance.name_id = -1;
				// tA.player.alliance.name = "Team Fart Shart";
			}
		})
	}
	
	gattai(){
		this.player.maxHealth += this.partner.maxHealth/2;
		this.player.health += this.partner.health/2;
		this.player.statusMessage = 'swallows ' + this.partner.name;
		
		this.partner.statusMessage = 'becomes one with ' + this.player.name;
		this.partner.death = 'becomes one with ' + this.player.name;		
		this.partner.health = 0;
						
		this.fightBonus = 1.4;
		this.moveSpeedB = 1.5;
		this.dmgReductionB = 0.8;
		this.intimidationBonus = 20;
				
		this.partner_attr.merged = true;
		this.merged = true;
	}
	
	partner_revive(){
		$('#deathMsg tbody').prepend("<tr><td>Day " + day + " " + hour + ":00</td><td><img src='" + this.partner.img + "'></img><del>" + this.partner.death + "</del></td>>");
		this.partner.death = '';
		this.partner.resetPlannedAction();
				
		//clear status
		this.partner.status_effects.forEach(function(eff){
			if(eff.name!='hinamizawa'){
				eff.wear_off();
			}			
		});
		
		this.partner.maxHealth = this.player.maxHealth/2;
		this.partner.health = this.partner.maxHealth;
		this.player.maxHealth = this.player.maxHealth/2;
		if(this.player.health > this.player.maxHealth)
			this.player.health = this.player.maxHealth
		
		this.revive = true;
		this.partner_attr.revive = true;
		
		this.player.statusMessage = "uses its life force to revive " + this.partner.name;
		this.partner.statusMessage = "brought back to life by " + this.player.name + "'s life force";
	}
	
	calc_bonuses(){
		if(this.partner.dead || this.merged){
			super.calc_bonuses();
			return;
		}			
		let dist = playerDist(this.player, this.partner);
		if(dist<=50){
			this.fightBonus = 1.5;
			this.dmgReductionB = 0.75;
			this.sightBonus = 10;
		}
		// else if(dist>300){
			// this.fightBonus = 0.9;
			// this.dmgReductionB = 1.05;
			// this.moveSpeedB = 0.9;
		// }
		else{
			this.fightBonus = 1;
			this.dmgReductionB = 1;
			this.moveSpeedB = 1;
			this.sightBonus = 0;
		}		
		super.calc_bonuses()
	}
	
	effect(state, data={}){
		switch(state){
			case "surroundingCheck":
				if(this.player.ally_target==this.partner)
					this.player.ally_target = "";
				//prevent following each other
				if(this.player.follow_target==this.partner && this.partner.follow_target==this.player)
					this.player.follow_target = "";
				break;
			case "planAction":
				if(this.partner.dead)
					break;
				let partner_dist = playerDist(this.player,this.partner)
				
				if(players.length == 2 && !this.merged){
					log_message('twin merge ok')
					if(partner_dist<=50){
						this.player.setPlannedAction("merge", 20, KoamimamiFusionAction,{'attr':this})
					}
					else{
						if(this.partner.plannedAction!='twin tele'){
							this.player.setPlannedAction("twin tele", 20, KoamimamiTeleportAction,{'attr':this, 'swap':false})
						}
					}
					break;
				}
				let partnerActions = [['nothing',50]]
				
				if(partner_dist<=50){
					// partnerActions.push(['gift',60])
					if(roll_range(0,99)>(players.length/playerStatic.length)*100 && !this.merged){
						// partnerActions.push(['merge',1])
					}
				}
				else if(partner_dist>250){
					if(this.partner.plannedAction!='twin tele'){
						// partnerActions.push(['tele',20]);
						partnerActions.push(['tele swap',5]);						
					}
					if(this.partner.lastActionState=='fighting' || this.partner.lastActionState=='attacked'){
						// partnerActions.push(['tele',5]);
						partnerActions.push(['tele swap',5]);		
						
					}
				}
				if(this.partner.health<this.player.health && this.player.health>20 && this.partner.health<80 ){
					partnerActions.push(['life swap', 10 + this.player.health - this.partner.health]);
				}
								
				let choice = roll(partnerActions)
				log_message(this.player.name + ' ' + choice)
				if(choice=='nothing')
					break;
				switch(choice){
					case "gift":
						this.player.setPlannedAction("twin gift", 3, KoamimamiItemGiftAction,{'attr':this})
						break;
					case "tele":
						this.player.setPlannedAction("twin tele", 5, KoamimamiTeleportAction,{'attr':this, 'swap':false})
						break;
					case "tele swap":
						this.player.setPlannedAction("twin tele", 5, KoamimamiTeleportAction,{'attr':this, 'swap':true})
						break;					
					case "life swap":
						this.player.setPlannedAction("twin tele", 5, KoamimamiLifeSwapAction,{'attr':this})
						break;				
					case "merge":
						this.player.setPlannedAction("twin tele", 5, KoamimamiFusionAction,{'attr':this})
						break;
				}
				break;
			case "turnEnd":				
				if(this.partner.dead || this.merged)
					break;
				if(this.partner.health<=0){
					if(!this.revive && this.player.health/this.player.maxHealth>0.2){
						this.partner_revive();
					}
					else{
						this.fightBonus = 0.5;
						this.moveSpeedB = 0.8;
						this.dmgReductionB = 1.2;
					}
				}
				break;				
		}
	}	

	effect_calc(state, x, data={}){
		if(this.partner.dead)
			return x
		let oP='';
		let alliance = '';
		let tA = this
		switch(state){
			case "opinionCalc":
			// case "allyCalc":
				oP=data.opponent;
				if(oP == this.partner)
					x+=300;
				else
					x-=30;
				break;
			case "followCalc":
				let follow_type = data.follow_type;
				if(oP == this.partner){
					if(follow_type=='aggro')
						x-=300;
				}
				else if(oP == this.partner.last_opponent)
					if(follow_type=='aggro')
						x+=150;
				break;
			case "aggroCalc":
				oP=data.opponent;
				if(oP == this.partner)
					x-=300;
				else if(oP == this.partner.last_opponent)
					x+=150
				break;
		}
		return x
	}
	
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Twin:</b>"+this.partner.name+"</span><br>"+
			"<span>"+Math.round(this.partner.health) + '/'+ this.partner.maxHealth + "</span><br>"
		if(this.revive)
			html += "<span><b>REVIVED</b></span><br>"
		if(this.merge)
			html += "<span><b>MERGED</b></span><br>"
		if(this.partner.dead)
			html += "<span><b>💀</b></span><br>"
		return html;
	}
}
class KoamimamiTeleportAction extends Action{
	constructor(player,data){
		super("twin tele",player)
		this.attr = data.attr
		this.partner = this.attr.partner
		this.swap = data.swap
	}
	
	perform(){
		let current_coords = [this.player.x, this.player.y]
		this.player.moveToCoords(this.partner.x + roll_range(-25,25), this.partner.y + roll_range(-25,25))
		this.player.statusMessage = "teleports to " + this.partner.name;
		this.player.lastActionState = "twin tele;"
		if(this.swap){
			this.partner.moveToCoords(current_coords[0],current_coords[1]);
			this.player.statusMessage = "swaps places with " + this.partner.name;
			this.player.lastActionState = "twin swap;"
		}
	}
	
}
class KoamimamiItemGiftAction extends Action{}
class KoamimamiLifeSwapAction extends Action{
	constructor(player,data){
		super("twin heal",player)
		this.attr = data.attr
		this.partner = this.attr.partner
		this.exchange_ratio = 0.75
	}
	perform(){
		if(this.player.health<this.player.maxHealth*0.2){
			this.player.statusMessage = 'does not have enough life force to give to ' + this.partner.name;
			this.player.lastActionState = 'twin heal fail'			
		}
		
		let hp_diff = this.player.health - this.partner.health
		let gift_hp = roll_range(Math.round(hp_diff*0.1), Math.round(hp_diff*0.4))
		gift_hp = Math.min(gift_hp, this.player.maxHealth*0.8)
		gift_hp = Math.min(gift_hp, this.partner.maxHealth - this.partner.health)
		log_message(this.player.name + ' hp gift ' + gift_hp)
		
		this.player.health -= gift_hp;
		this.partner.health += gift_hp;
		
		this.player.statusMessage = 'transfers some of its life force to ' + this.partner.name;
		this.player.lastActionState = 'twin heal'
		
	}
}
class KoamimamiFusionAction extends Action{
	constructor(player,data){
		super("twin merge",player)
		this.attr = data.attr
		this.partner = this.attr.partner
		this.swap = data.swap
	}
	perform(){
		let partner_dist = playerDist(this.player,this.partner)
		if(partner_dist<=50){
			this.attr.gattai()
			this.player.lastActionState = 'twin merge'
		}
		else{
			this.player.statusMessage = 'too far to merge with ' + this.partner.name;
			this.player.lastActionState = 'twin merge fail'
		}
	}
}

//has a super meter
//performs a suplex when full
SUPLEX_RANGE = 50;
THROW_RANGE = 25;
MAKOCHI_THROW_DIST = 200;
class Makochi extends Attr{	
	constructor(player){
		super("makochi", player);
		this.has_info = true;
		this.meter = 50;
		this.max_meter = 0;
		this.special = '';
		this.fightBonus = 1.1;
	}
	
	//breaks bones
	suplex_attack(target, fightMsg){
		if(playerDist(this.player, target)>SUPLEX_RANGE)
			return
		
		let dmg = roll_range(10,50);
		
		target.take_damage(dmg, this.player, "unarmed", fightMsg)
		fightMsg.events.push(this.player.name + " suplexs "+ target.name +" for "+ roundDec(dmg) + " damage" );
		
		let bones_broken = Math.round(roll_range(0,dmg+15)/5)+1
		bones_broken = Math.min(10, bones_broken);		
		if(bones_broken==1)
			fightMsg.events.push(this.player.name + " breaks "+ bones_broken + " bone in " +target.name + "'s body");
		else
			fightMsg.events.push(this.player.name + " shatters "+ bones_broken + " bones in " +target.name + "'s body, crippling them");
		
		let eff_data = {"fightBonus":[0.8,-0.02], "rangeBonus":[-20,0], "moveSpeedB":[0.6,-0.05], "dmgReductionB":[1,0.01]};
		let temp_effect = new StatusEffect("broken bones", bones_broken, roll_range(3, 3+bones_broken), eff_data)
		temp_effect.icon = "🦴"
		target.inflict_status_effect(temp_effect)
		this.player.statusMessage = "suplexs " + target.name;
		target.statusMessage = "suplexed and crippled by " + this.player.name;
		if(target.health<=0){
			target.death = "suplexed to death by " + this.player.name;
		}
		this.meter=0;
	}
	
	//throws target
	throw_attack(target, fightMsg){
		if(playerDist(this.player, target)>THROW_RANGE)
			return
		let dmg = roll_range(25,60);
		target.take_damage(dmg, this.player, "unarmed", fightMsg)
		fightMsg.events.push(this.player.name + " throws "+ target.name +" for "+ roundDec(dmg) + " damage" );
		
		//throw target in random direction
		let end_x = 0;
		let end_y = 0;
		let rand_angle = 0;
		let tries = 5;
		do {
			rand_angle = roll_range(0,359);
			end_x = Math.cos(degToRad(rand_angle))*(MAKOCHI_THROW_DIST) + target.x;
			end_y = Math.sin(degToRad(rand_angle))*(MAKOCHI_THROW_DIST) + target.y;
			tries--;
		} while (tries > 0 && !inBoundsCheck(end_x + target.x,end_y + target.y));
		target.moveToCoords(end_x, end_y)
		
		//aoe
		let tP= this.player;
		players.forEach(function(oP){
			if(oP==target)
				return
			if(playerDist(target, oP)<50){
				oP.take_damage(roll_range(1,10), tP, "unarmed");
				oP.currentAction.turn_complete = true;
				oP.statusMessage = "hit by a thrown " + target.name;
				pushMessage(oP, oP.name + " hit by a thrown " + target.name)
				if(oP.health<=0){
					tP.kills++;
					oP.death = "killed by a thrown " + target.name;
				}
			}
		});
		
		this.player.statusMessage = "throws " + target.name;
		target.statusMessage = "thrown  by " + this.player.name;
		if(target.health<=0){
			target.death = "thrown to death by " + this.player.name;
		}
		this.meter=0;
	}
	
	effect(state, data={}){	
		switch(state){
			case "takeDmg":
				this.meter += data.damage * 1.2;
				break;
			case "dealDmg":
				this.meter += data.damage * 1.5;
				break;
			case "turnStart":
				if(this.meter<this.max_meter)
					this.meter += 0.5;
				break;
			case "fightStart":
				if(this.meter>=this.max_meter){
					/*
					let special_attack = [['',2]]
					if(playerDist(this.player, data.opponent)<=SUPLEX_RANGE)
						special_attack.push(['suplex',4]);
					if(playerDist(this.player, data.opponent)<=THROW_RANGE)
						special_attack.push(['throw',8]);
					this.special = roll(special_attack);
					*/
					// this.player.attack_action = new MakochiSuplexAttack(this.player, this);
					this.player.attack_action = new MakochiThrowAttack(this.player, this);
				}
				break;
		}
	}
	/*
	effect_calc(state, x, data={}){
		switch(state){
			case "dmgCalcOut":
				if(!this.special)
					break;
				if(x<=0)
					break;
				if(this.meter<this.max_meter)
					break;
				if(x<=0)
					break;
				if(this.special=='suplex')
					this.suplex_attack(data.opponent, data.fightMsg)
				else if(this.special=='throw')
					this.throw_attack(data.opponent, data.fightMsg)
				break;
		}
		return x;
	}
	*/
	stat_html(){
		let html= super.stat_html()
		
		// html += "<span><b>Meter:</b>"+roundDec(this.meter)+'/'+this.max_meter+"</span><br>"
		
		html += "<div style='position:relative;'>"
		if(this.meter<this.max_meter){
			let width = 112 * (this.meter/this.max_meter)
			html+="<img src='icons/makochi_meter_empty.png'>"+
			"<img src='icons/makochi_meter_bar.png' style='position:absolute; top:5px; left:4px; object-fit:cover; width:"+width+"px; height:16px;'>"			
		}
		else{
			html+="<img src='icons/makochi_meter_full.png'>"
		}
		html+="</div>"
		
		return html;
	}
}

class MakochiThrowAttack extends CombatAction{
	constructor(player, attr){
		super("makochi throw", player, true, 5);
		this.display_name = "command grab"
		this.player = player;
		this.attr = attr;
	}
	
	execution_fail(action, attacker, defender, counter, fightMsg){
		if(fightMsg.events)
			fightMsg.events.push(this.player.name + ' whiffs their command grab');
		this.attr.meter=0;
	}
	
	fight_target(attacker, defender, counter, fightMsg){
		if(playerDist(attacker, defender)>THROW_RANGE){
			fightMsg.events.push(attacker.name + " tries to grab " + defender.name + " but they get away" );
			attacker.statusMessage = "tries to grab " + defender.name + " but they get away";
			return
		}
		
		let dmg = roll_range(25, 50);
		defender.take_damage(dmg, attacker, "unarmed", fightMsg)
		fightMsg.events.push(attacker.name + " throws "+ defender.name +" for "+ roundDec(dmg) + " damage" );
		
		//throw target in random direction
		let end_x = 0;
		let end_y = 0;
		let rand_angle = 0;
		let tries = 5;
		do {
			rand_angle = roll_range(0,359);
			end_x = Math.cos(degToRad(rand_angle))*(MAKOCHI_THROW_DIST) + defender.x;
			end_y = Math.sin(degToRad(rand_angle))*(MAKOCHI_THROW_DIST) + defender.y;
			tries--;
		} while (tries > 0 && !inBoundsCheck(end_x + defender.x,end_y + defender.y));
		defender.moveToCoords(end_x, end_y)
		
		//aoe
		let tP= attacker;
		players.forEach(function(oP){
			if(oP==defender)
				return
			if(playerDist(defender, oP)<50){
				oP.take_damage(roll_range(1,10), tP, "unarmed");
				oP.currentAction.turn_complete = true;
				oP.statusMessage = "hit by a thrown " + defender.name;
				pushMessage(oP, oP.name + " hit by a thrown " + defender.name)
				if(oP.health<=0){
					tP.kills++;
					oP.death = "killed by a thrown " + defender.name;
				}
			}
		});
		
		attacker.statusMessage = "throws " + defender.name;
		defender.statusMessage = "thrown  by " + attacker.name;
		if(defender.health<=0){
			defender.death = "thrown to death by " + attacker.name;
		}
		this.meter=0;	
	}
	
	kill(attacker, defender, counter, fightMsg){
		defender.death = "thrown to death by " + attacker.name;
		attacker.statusMessage = "throws " + defender.name + " to death";
	}
}

class MakochiSuplexAttack extends CombatAction{
	constructor(player, attr){
		super("makochi suplex", player, true, 5);
		this.display_name = "suplex"
		this.player = player;
		this.attr = attr;
	}
	
	execution_fail(action, attacker, defender, counter, fightMsg){
		if(fightMsg.events)
			fightMsg.events.push(this.player.name + ' whiffs their suplex');
		this.attr.meter=0;
	}
	
	fight_target(attacker, defender, counter, fightMsg){
		if(playerDist(attacker, defender)>SUPLEX_RANGE){
			fightMsg.events.push(attacker.name + " tries to suplex " + defender.name + " but they get away" );
			attacker.statusMessage = "tries to suplex " + defender.name + " but they get away";
			return
		}
		
		let dmg = roll_range(10, 40);
		
		defender.take_damage(dmg, attacker, "unarmed", fightMsg)
		fightMsg.events.push(attacker.name + " suplexs "+ defender.name +" for "+ roundDec(dmg) + " damage" );
		
		let bones_broken = Math.round(roll_range(0,dmg+15)/5)+1
		bones_broken = Math.min(10, bones_broken);		
		if(bones_broken==1)
			fightMsg.events.push(attacker.name + " breaks "+ bones_broken + " bone in " +defender.name + "'s body");
		else
			fightMsg.events.push(attacker.name + " shatters "+ bones_broken + " bones in " +defender.name + "'s body, crippling them");
		
		let eff_data = {"fightBonus":[0.8,-0.02], "rangeBonus":[-20,0], "moveSpeedB":[0.6,-0.05], "dmgReductionB":[1,0.01]};
		let temp_effect = new StatusEffect("broken bones", bones_broken, roll_range(3, 3+bones_broken), eff_data)
		temp_effect.icon = "🦴"
		defender.inflict_status_effect(temp_effect)
		attacker.statusMessage = "suplexs " + defender.name;
		defender.statusMessage = "suplexed and crippled by " + attacker.name;
		if(defender.health<=0){
			defender.death = "suplexed to death by " + attacker.name;
		}
	}
	
	kill(attacker, defender, counter, fightMsg){
		defender.death = "suplexed to death by " + attacker.name;
		attacker.statusMessage = "suplexes " + defender.name + " to death";
	}
}

//can create trap entities
class Yukipo extends Attr{	
	constructor(player){
		super("yukipo", player);
		this.holes = [];
		this.max_holes = 10;
		this.has_info = true;
		this.last_hole = 10;
	}

	effect(state, data={}){
		let oP="";
		switch(state){
			case "planAction":
				if(this.holes.length>=this.max_holes)
					return;
				if(roll([['dig', 10 + this.last_hole * 11],['notdig',80 + this.holes.length * 4]]) == 'dig'){
					this.player.setPlannedAction("dig", 3, YukipoDigAction,{'attr':this})
				}
				this.last_hole++;
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()+
			"<span><b>Holes:</b>"+this.holes.length+"</span><br>"
		
		return html;
	}
}
class YukipoDigAction extends Action{
	constructor(player,data){
		super("yukipo dig",player)
		this.attr=data.attr
	}
	perform(){
		let tempTrap = new YukipoTrapEntity(this.player.x, this.player.y,this.player, this.attr);
		tempTrap.draw();
		doodads.push(tempTrap);
		this.attr.holes.push(tempTrap);
		this.player.statusMessage = "digs"
		this.player.lastActionState = "digging"
		this.attr.last_hole = 0;
	}
}
class YukipoTrapEntity extends TrapEntity{
	constructor(x,y,owner, attr){
		super(x,y,owner);
		this.attr = attr
		//chance to trigger
		this.triggerChance=50;
		this.ownerTriggerChance = 0;
		
		this.triggerRange = 30;
		this.duration=40;
		this.max_triggers=3;
	}
	
	trigger(trigger_player){
		log_message(trigger_player.name + " triggered trap entity")
		if(trigger_player == this.owner){
			pushMessage(trigger_player, trigger_player.name + " fell into their own hole");
		}
		else if(trigger_player!=""){
			pushMessage(trigger_player, trigger_player.name + " fell into "+ this.owner.name +"'s hole");
		}
		
		trigger_player.inflict_status_effect(new Trapped(10, this.owner));
		this.destroy();
	}
	
	destroy(){
		this.attr.holes = arrayRemove(this.attr.holes,this);
		super.destroy()
	}
}

var CHICCHAN_COMMAND_RANGE = 50;
//puchis fear this
class Chicchan extends Attr{
	constructor(player){
		super("chicchan", player);
		this.has_info = true;
		this.intimidationBonus = 50;
		this.last_meatshield = "";
	}
	effect(state, data={}){	
		switch(state){
			case "planAction":
				let command_target = '';
				let lowest_opinion = 50;
				let tP = this.player;
				let last_meatshield = this.last_meatshield;
				this.player.awareOf.forEach(function(oP){
					if(playerDist(tP,oP)>CHICCHAN_COMMAND_RANGE)
						return
					if(oP==last_meatshield)
						return;
					if(tP.opinions[oP.id]<lowest_opinion){
						command_target = oP;
						lowest_opinion = tP.opinions[oP.id];
					}
				});
				log_message("chicchan command target " + command_target.name);
				if(command_target){
					if((!this.player.offhand) && roll_range(0,99)<=30 && players.length>2){
						this.player.setPlannedAction("meat shield command", 6, PuchiMeatShieldAction,  {'attr':this, 'target':command_target})
					}
				}
				if(this.player.fight_target && roll_range(0,99)<=50){
					this.player.setPlannedAction("self harm command", 7, PuchiCommandAction,  {'attr':this, 'target':this.player.fight_target})
				}
				break;
		}
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				return [];
				break;
		}
		return x
	}
}
class PuchiCommandAction extends Action{
	constructor(player, data){
		super("chicchan command", player);
		this.attr = data.attr;
		this.target = data.target;
	}
	
	perform(){
		//add red fighting border
		// this.player.div.addClass("fighting");
		
		//no target planned
		if(!this.target){
			this.player.statusMessage = "orders their inner mind goblin to kill itself... NOW";
			this.player.lastActionState = "chicchan command null";
			return;
		}
				
		this.player.calc_bonuses();
		this.target.calc_bonuses();
		
		if(this.player.inAlliance(this.target))
			this.player.alliance.unity -= 100;
		
		//if target is already dead
		if(this.target.health<=0){
			this.player.statusMessage = "orders the corpse of " + this.target.name;
			this.player.lastActionState = "chicchan command dead";
			return;
		}
			
		//make sure target is still in range
		let dist = playerDist(this.player, this.target);
		if(CHICCHAN_COMMAND_RANGE < dist){
			this.player.statusMessage = "too far away to order "+ this.target.name;
			this.player.lastActionState = "chicchan command range fail";
			return;
		}

		if((this.player.intimidation + roll_range(0,30)) < (this.target.intimidation + roll_range(0,50))){
			this.player.statusMessage = "orders " + this.target.name +" to kill themself but they refuse";
			this.player.lastActionState = "chicchan command fail";
			return
		}
					
		//calculate damage for both fighters
		// this.target.opponents.push(this);
		fight_target(this.target, this.target);
		if(this.target.health<=0){
			this.player.statusMessage = "orders " + this.target.name + " to kill themself... NOW";
			this.target.statusMessage = "ordered by " + this.player.name + " to kill themself... NOW";
			this.target.death = "ordered by " + this.player.name + " to an hero";
			this.player.kills++;
		}
		else{
			this.player.statusMessage = "orders " + this.target.name + " to attack themself";
			this.target.statusMessage = "ordered by " + this.player.name + " to self harm";
		}
		this.player.lastActionState = "chicchan command";		
	}
}
class PuchiMeatShieldAction extends Action{
	constructor(player, data){		
		super("chiichan meat shield", player);
		this.attr = data.attr;
		this.target = data.target;
	}
		
	perform(){
		if(playerDist(this.player, this.target)>CHICCHAN_COMMAND_RANGE){
			this.player.statusMessage = "too far to command " + this.target.name;
			this.player.lastActionState = "meat shield range fail"
		}
		else{
			this.player.calc_bonuses();
			this.target.calc_bonuses();
			let tP_roll = (this.player.intimidation + roll_range(0,30))
			let oP_roll = (this.target.intimidation + roll_range(0,30))
			// log_message(tP_roll+', '+oP_roll)
			if(tP_roll > oP_roll){
				let shield_power = 5 + Math.round((this.player.intimidation - this.target.intimidation)/10)
				shield_power = Math.min(shield_power,9)
				shield_power = Math.max(shield_power,4)
				let max_duration = 10 + Math.round((this.player.intimidation - this.target.intimidation)/5)
				max_duration = Math.min(max_duration,40)
				max_duration = Math.max(max_duration,5)
				this.player.equip_item(new MeatShield(this.target, shield_power, max_duration))
				this.player.statusMessage = "forces " +this.target.name + " to be its meat shield"
				this.player.lastActionState = "meat shield success";
				this.attr.last_meatshield = this.target;
			}
			else{				
				this.player.statusMessage = "orders " + this.target.name +" to be a meat shield but they refuse";
				this.player.lastActionState = "meat shield fail"
			}			
		}
	}
}

//can teleport
class Miurasan extends Attr{
	constructor(player){
		super("miurasan", player);
		this.has_info = true;
		this.last_tele = 50;
		this.total_teles = 0;
	}
	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				this.last_tele++;
				break;
			case "planAction":
				if(this.last_tele<roll_range(1,this.total_teles*2))
					return;
				//oob
				if(!safeBoundsCheck(this.player.x, this.player.y) && this.player.plannedAction=="move"){
					this.player.plannedAction = "miuraTeleportEscape"
					this.player.plannedActionClass = MiurasanTeleportAction
					this.player.plannedActionData = {"tele_goal":"escape", "attr":this};
				}
				//player/terrain escape
				if(this.player.plannedAction=="playerEscape" || this.player.plannedAction=="terrainEscape"){
					this.player.plannedAction = "miuraTeleportEscape"
					this.player.plannedActionClass = MiurasanTeleportAction
					this.player.plannedActionData = {"tele_goal":"escape", "attr":this};
				}
				//low hp after fight
				if(this.player.lastActionState =="fighting" || this.player.lastActionState=="attacked" || this.player.health < roll_range(20,40)){
					// this.player.setPlannedAction("mirrorTeleportEscape", 6);
					this.player.setPlannedAction("miuraTeleportEscape", 6, MiurasanTeleportAction, {"tele_goal":"escape", "attr":this});
				}
				//look for fight				
				if((this.player.aggroB - this.player.peaceB)+this.player.lastFight*2 > roll_range(100,400)){
					// this.player.setPlannedAction("mirrorTeleportAttack", 4); 
					this.player.setPlannedAction("miuraTeleportAttack", 4,MiurasanTeleportAction,{"tele_goal":"attack", "attr":this});
				}				
				// random
				if(Math.random()<0.1){
					// this.player.setPlannedAction("mirrorTeleport", 4);
					this.player.setPlannedAction("miuraTeleport", 4, MiurasanTeleportAction, {"tele_goal":"neutral", "attr":this});
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}
class MiurasanTeleportAction extends MirrorTeleportAction{
	constructor(player, data){		
		super(player,data);
		this.name = "miura teleport";
		this.attr = data.attr
	}
	
	perform(){
		//choose target
		if(!this.target){
			this.target = this.choose_dest()
		}	
		//teleport
		this.player.statusMessage = "teleports"
		if(this.tele_goal=="escape"){
			log_message(this.player.name +" tele escape")
			this.player.statusMessage = "teleports to safer ground"
		}
		else if(this.tele_goal=="attack"){
			log_message(this.player.name +" tele attack")
			this.player.statusMessage = "teleports to " + this.tele_target.name
		}
		this.player.lastActionState = "miura teleport"			
		
		this.player.moveToCoords(this.target[0], this.target[1]);
		this.attr.last_tele = 0;
		this.attr.total_teles++;
	}
}

//extra healing from food
//buffs itself from onigiri
class Afu extends Attr{
	constructor(player){
		super("afu", player);
		this.has_info = true;
	}
	
	effect(state, data={}){		
		switch(state){
			case "doActionAfter":
				if(data.action instanceof EatAction){
					let eff_lv = 1;
					if(data.action.food.name=='onigiri'){
						eff_lv = 2;
					}
					let eff_data = {
						"fightBonus":[1,0.075],
						"dmgReductionB":[1,-0.05],
						"moveSpeedB":[1.1,0.1],
						"sightBonus":[10,4],
						// "rangeBonus":[0,5],
						"intimidationBonus":[20,0],
						"aggroBonus":[50,0],
					}
					let temp_eff = new StatusEffect("well fed", eff_lv, roll_range(5,6+eff_lv), eff_data)
					temp_eff.icon = "😋"
					this.player.inflict_status_effect(temp_eff)
				}
				break;
			case "healDmg":
				if(data.dmg_type=='food'){
					this.player.health += 10;
					this.player.energy += 5;
				}
				break;
			case "planAction":
				if(!this.player.offhand)
					if(roll_range(0,99)<30)
						this.player.setPlannedAction('forage', 5, ForageAction);
				if(this.player.offhand instanceof Food)
					if(roll_range(0,99)<50)
						this.player.setPlannedAction("eat", 9, EatAction, {'food':this.player.offhand});
				
				break;
		}
	}
	effect_calc(state, x, data={}){
		switch(state){
			case "itemOdds":
				if(data.item_type=='off')
					x.push(['food',800])
				else if(data.item_type=='food')					
					x.push(['onigiri',100])
				break;
		}
		return x
	}
}

//has papermaster abilities
class Takanya extends PaperMaster{
	constructor(player){
		super(player);
		this.name = "takanya"
		this.display_name = "Takanya"
	}	
}


var critter_data = {
	"crocodile":{
		"icon":"🐊",
		"triggerChance":70,
		"triggerRange":40,
		"max_triggers":5,
		"duration":40,
		"moveSpeed":30,
		"dmg":[5,15],
		"atkMsg":" bitten by a crocodile",
		"killMsg":"torn to shreds by a crocodile",
	},
	"monkey":{
		"icon":"🐒",
		"triggerChance":90,
		"triggerRange":40,
		"max_triggers":5,
		"duration":50,
		"moveSpeed":40,
		"dmg":[3,10],
		"atkMsg":" raped by monke",
		"killMsg":"raped to death by monke",
	},
	"snake":{
		"icon":"🐍",
		"triggerChance":30,
		"triggerRange":60,
		"max_triggers":2,
		"duration":25,
		"moveSpeed":30,
		"dmg":[5,10],
		"atkMsg":" bitten by a snake",
		"killMsg":"swallowed by a snake",
	},	
	"elephant":{
		"icon":"🐘",
		"triggerChance":50,
		"triggerRange":25,
		"max_triggers":3,
		"duration":20,
		"moveSpeed":20,
		"dmg":[10,30],
		"atkMsg":" stepped on by an elephant",
		"killMsg":"crushed by an elephant",
	},	
}
//summons critters with various effects
class Chibiki extends Attr{	
	constructor(player){
		super("chibiki", player);
		this.has_info = true;
		this.critter = '';
		this.last_summon = 50;
	}
	
	effect(state, data={}){	
		switch(state){
			case "turnStart":
				this.last_summon++;
				break;
			case "planAction":
				if(this.critter)
					return;
				let r = roll_range(0,5+this.last_summon)
				if(r>20)
					this.player.setPlannedAction("chibiki summon", 7, ChibikiSummonAction,{'attr':this})
				log_message('chibiki prob '+r)
				break;	
			case "turnEnd":
				if(this.critter)
					this.critter.move();
				break;
			case "death":
				if(this.critter)
					this.critter.destroy();
				break;
		}
	}
	stat_html(){
		let html= super.stat_html()
		if(this.critter){
			html+="<span><b>Critter:</b>"+this.critter.icon+"</span><br>"+
				"<span><b>Duration:</b>"+this.critter.duration+"</span><br>"
		}
		return html;
	}
}

class ChibikiSummonAction extends Action{
	constructor(player, data){		
		super("chibiki summon", player);
		this.attr = data.attr
	}
	perform(){
		let critter_type = roll([['crocodile',4],['monkey',3],['snake',4],['elephant',3],])
		let tempCritter = new Critter(critter_type, this.player.x + roll_range(-20,20), this.player.y + roll_range(-20,20),this.player, this.attr);
		tempCritter.draw();
		doodads.push(tempCritter);
		this.attr.critter = tempCritter;
		
		this.player.statusMessage = "summons a " + critter_type;
		this.attr.last_summon = 0;
		log_message(this.player)

	}
}
class Critter extends MovableEntity{
	constructor(critter_type, x, y, owner, attr){
		super(critter_type,x,y,owner);
		this.attr = attr
				
		this.icon = critter_data[critter_type].icon
		
		this.ownerTriggerChance = -10;
		this.dead_trigger = false;
		
		this.triggerChance = critter_data[critter_type].triggerChance;
		this.triggerRange = critter_data[critter_type].triggerRange;
		this.max_triggers = critter_data[critter_type].max_triggers;
		
		this.duration = critter_data[critter_type].duration;
		this.moveSpeed = critter_data[critter_type].moveSpeed; 
		this.dmg = critter_data[critter_type].dmg; 
		
		this.atkMsg = critter_data[critter_type].atkMsg; 
		this.killMsg = critter_data[critter_type].killMsg;
	}
	trigger(tP){
		let dmg = roll_range(this.dmg[0],this.dmg[1])		
		if(dmg>tP.health)
			dmg = tP.health;
		log_message(this.name + " attacks " + tP.name + " for " + dmg)
		tP.take_damage(dmg, this, 'unarmed')
		if(tP.currentAction.name)
			tP.currentAction.entity_attacked(this)
		pushMessage(tP, tP.name + this.atkMsg + ' for '+ dmg+' damage');
		let eff_data = {}
		let temp_eff = "";
		switch(this.name){
			case "crocodile":
				temp_eff = new Bleed(1,this.owner);
				break;
			case "snake":
				temp_eff = new Poison(1, 5, this.owner);
				break;
			case "monkey":
				if(roll_range(0,99)<30)
					temp_eff = new AidsStatus(1, "", "parent");
				break;
			case "elephant":
				eff_data = {
					"fightBonus":[0.8,-0.02], 
					"rangeBonus":[-20,0], 
					"moveSpeedB":[0.6,-0.05], 
					"dmgReductionB":[1,0.01]
				};
				temp_eff = new StatusEffect("broken bones", roll_range(1,4), roll_range(2,6), eff_data)
				temp_eff.icon = "🦴"
				
				break;
		}
		if(temp_eff)
			tP.inflict_status_effect(temp_eff);
		if(tP.health<=0){
			tP.death = this.killMsg;
			this.owner.kills++;
		}
		this.duration-=5;
		if(this.duration<=0)
			this.expire();
	}
	
	move(){
		this.moveToTarget(this.owner.x + roll_range(-20,20), this.owner.y + roll_range(-20,20));		
	}
	
	update(){
		if(this.owner.health<=0){
			this.destroy;
			return;
		}
		super.update();		
	}
	destroy(){
		this.attr.critter = "";
		super.destroy();
	}
}

//flies and can dodge attacks
class Piyo extends Attr{
	constructor(player){
		super("piyo", player);		
		this.flying = false;
	}
	
	effect(state, data={}){		
		switch(state){
			case "doActionBefore":
				if(!this.flying && (this.player.currentAction instanceof MoveAction)){
					if(Math.random()<0.6){						
						this.player.inflict_status_effect(new PiyoFlight(50, this));	
					}
				}					
				break;
		}
	}
}
class PiyoFlight extends Flight{
	constructor(duration, attr){
		super(duration);
		this.attr=attr
		this.dodge_chance = 80;
		this.fall_chance = 25;
	}	
	
	afflict(player){
		this.attr.flying=true;
		this.attr.moveSpeedB = 1;
		super.afflict(player)
	}
	wear_off(){
		
		this.attr.flying=false;
		this.attr.moveSpeedB = 0.9;
		super.wear_off()
	}
}