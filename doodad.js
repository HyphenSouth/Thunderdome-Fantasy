
//any item that appears on the map
class Doodad {
	constructor(name, x,y,owner){
		this.name = name;
		this.x = x;
		this.y = y;
		this.owner = owner;
		
		this.id = doodadsNum;
		doodadsNum++;
		
		//effect radius
		this.range = 0;
		//damage
		this.dmg = 0;
		//trigger radius
		this.triggerRange = 0;
		//bonuse to trigger chance
		this.triggerChance=0;	//-5 or lower for no chance
		//how long doodad can stay out
		this.maxDuration=30;
		this.duration=0;
		
	
	}
	draw(){
		let doodDiv = $('#doodad_' + this.id);
		if(!doodDiv.length){
			$('#doodads').append("<div id='doodad_" + this.id + "' class='doodad' style='transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px)'>" + this.icon + "</div>");
			doodDiv = $('#doodad_' + this.id);
			this.div = doodDiv;
		}
	}
	//look for players in range
	update(){
		this.duration++;
		if(this.duration > this.maxDuration){
			this.expire();
		}
		else{
			let tD = this;
			players.forEach(function(tP,index){
				let dist = hypD(tP.x - tD.x, tP.y - tD.y);
				if(dist <= tD.triggerRange){
					log_message(tD.name+" "+ tP.name+" in range")
					let triggerChance = 5 + tD.triggerChance;
					let triggerNoChance = 15;
					// let triggerNoChance = 0;
					if(tD.owner == tP)
						triggerNoChance += 100;
					log_message(triggerChance)
					log_message(triggerNoChance)
					let trapR = roll([["yes",triggerChance],["no",triggerNoChance]])
					log_message(trapR);
					if(trapR == 'yes'){
						// log_message(tP.name +" triggered a "+tD.name);
						tD.trigger(tP);
					}
				}
			});
		}
	}
	expire(){
		log_message(this.name+" expires");
		this.destroy();
	}
	trigger(trigger_player){
		this.destroy();
	}
	destroy(){
		log_message(this.name+" destroy");
		doodads = arrayRemove(doodads,this);
		this.div.remove();
	}
}

class BombEntity extends Doodad{
	constructor(x,y,owner){
		// "bomb" : ["💣",100,100,24, "explosive"],
		super("bomb", x,y,owner);
		this.icon = "💣";
		this.range = 100;
		this.dmg = 100;
		this.triggerRange = 24;
		this.triggerChance=0;	
		this.active=true;
	}
	
	//bombs stay out for one more turn for the explosion effect
	update(){
		// log_message(this.owner.name+"'s bomb "+this.active)
		if(this.active){
			super.update();
		}
		else{
			this.destroy();
		}
	}
	
	//deal damage to players
	damage_player(oP){		
		let	dmg = Math.floor(Math.random() * this.dmg);
		oP.calc_bonuses();
		oP.apply_all_effects("defend", {"opponent":this});
		dmg = dmg * oP.dmgReductionB;
		if(dmg > oP.health)
			dmg = oP.health;
		oP.take_damage(dmg, this, "explosive")
		//killed the player
		if(oP.health <= 0){
			this.owner.kills++;
			if(oP == this.owner){
				oP.death = "blown up by their own bomb";
				pushMessage(oP, oP.name + " blown up by their own bomb");
			} else {
				oP.death = "blown up by " + this.owner.name;
				this.owner.kills++;
				pushMessage(oP, oP.name + " blown up by " + this.owner.name);
			}
		}
		else{
			if(oP == this.owner){
				pushMessage(oP, oP.name + " hit by their own bomb");
			} else {
				pushMessage(oP, oP.name + " hit by "+ this.owner.name +"'s bomb");
			}
		}
	}
	
	//explode when expire
	expire(){
		this.trigger("");
	}

	trigger(trigger_player){
		this.icon="💥";
		if(trigger_player == this.owner){
			pushMessage(trigger_player, trigger_player.name + " triggered their own bomb");
		}
		else if(trigger_player!=""){
			pushMessage(trigger_player, trigger_player.name + " triggered "+ this.owner.name +"'s bomb");
		}
		
		//look for players in the blast radius
		let tD = this;
		players.forEach(function(oP,index){
			let dist = hypD(oP.x - tD.x,oP.y - tD.y);
			if(dist <= tD.range && oP.health>0){
				tD.damage_player(oP);
				log_message(oP.name + " hit by bomb");
			}
		});
		this.active=false;
	}
}

class TrapEntity extends Doodad{
	constructor(x,y,owner){
		super("trap",x,y,owner);
		// "trap" : ["🕳",24,[0,50],24, "none"]
		this.icon = "🕳";
		this.range = 24;
		this.triggerRange = 24;
		this.triggerChance=0;
	}
	
	trigger(trigger_player){
		log_message(trigger_player.name + " triggered trap entity")
		if(trigger_player == this.owner){
			pushMessage(trigger_player, trigger_player.name + " fell into their own trap");
		}
		else if(trigger_player!=""){
			pushMessage(trigger_player, trigger_player.name + " fell into "+ this.owner.name +"'s trap");
		}
		
		trigger_player.inflict_status_effect(new Trapped(5, this.owner));
		this.destroy();
	}
}




