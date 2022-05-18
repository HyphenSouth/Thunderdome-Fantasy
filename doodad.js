
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
		//trigger radius
		this.triggerRange = 0;
		//bonuse to trigger chance
		this.triggerChanceB=0;	//-5 or lower for no chance
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
					let triggerChance = 5 + tD.triggerChanceB;
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
		this.triggerChanceB=0;	
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
		this.triggerChanceB=0;
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

class Fire extends Doodad{
	constructor(x,y, owner=""){
		super("fire",x,y,owner);
		this.icon = "🕳";
		this.maxDuration=5;
		this.triggerChance=5;
		this.range = 24;
		this.triggerRange = 24;		
	}
}

function spawn_duck(x,y){
	let tempDuck = new FuckDuck(x, y);
	tempDuck.draw();
	doodads.push(tempDuck);
}

class FuckDuck extends Doodad{
	constructor(x,y){
		super("duck",x,y,"");
		// this.icon = "🦆";
		this.icon = '<img style="width:24px;" src="./icons/duck2.png"></img>';
		this.range = 100;
		this.maxDuration=99999;
		this.triggerRange = 24;
		this.triggerChanceB=50;
		this.fuck_count = 0;
		this.fuck_max = 10
		this.moveSpeed = 60
		this.dmg = 100;
		this.active=true;
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
			oP.death = "blown up by exploding duck";
			pushMessage(oP, oP.name + " blown up by exploding duck");
		}
		else{
			pushMessage(oP, oP.name + " hit by an exploding duck");
		}
	}	
	explode(trigger_player){
		log_message('explode',5)
		this.icon="💥";
		// this.icon='<img style="width:24px; height:24px;" src="./icons/duck_explode.png"></img>';
		trigger_player.statusMessage = "fucks the duck until explode"
		pushMessage(trigger_player, trigger_player.name + " fucks the duck until explode");
		let tD = this;
		players.forEach(function(oP,index){
			let dist = hypD(oP.x - tD.x,oP.y - tD.y);
			if(dist <= tD.range && oP.health>0 && oP!=trigger_player){
				tD.damage_player(oP);
				log_message(oP.name + " hit by duck");
			}
		});
		this.active=false;
	}
	
	update(){
		if(this.active){
			//move
			//get new cords to move to
			let newX = 0;
			let newY = 0;
			let tries = 0;
			do {
				newX = Math.floor(Math.random()*mapSize);
				newY = Math.floor(Math.random()*mapSize);
				tries++;
			} while(!safeBoundsCheck(newX,newY) && tries < 10);
			//if safe location can't be found, move to center
			if(tries>=10){
				log_message(this.name + " cant find safe location", 0);
				newX = mapSize/2
				newY = mapSize/2
			}	
			
			let distX = newX - this.x;
			let distY = newY - this.y;
			let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
			let targetX = 0;
			let targetY = 0;
			
			if(dist <= this.moveSpeed * this.moveSpeedB){
				//target within reach
				targetX = newX;
				targetY = newY;
			} else {
				//target too far away
				let shiftX = distX / (dist/this.moveSpeed);
				let shiftY = distY / (dist/this.moveSpeed);
				//destination coords
				targetX = this.x + shiftX;
				targetY = this.y + shiftY;
			}
			
			this.x = targetX;
			this.y = targetY;
			targetX = targetX / mapSize * $('#map').width() - iconSize/2;
			targetY = targetY / mapSize * $('#map').height() - iconSize/2;
			
			//update icons on map
			let doodadDiv = $('#doodad_' + this.id);
			doodadDiv.css({transform:"translate(" + targetX + "px," + targetY + "px)"},function(){
			});
			log_message(this.name +" moves to (" +this.x +","+ this.y+")", 1);
			
			super.update();
		}
		else{
			this.destroy();
		}
	}
	
	trigger(trigger_player){
		if(trigger_player.lastAction == "moving" && this.fuck_count<this.fuck_max){
			trigger_player.statusMessage = "fucks the duck"
			this.fuck_count++;
			log_message("duck fucked "+this.fuck_count+"/"+this.fuck_max)
			if(this.fuck_count>=this.fuck_max){
				this.explode(trigger_player);
			}
			else{
				pushMessage(trigger_player, trigger_player.name + " fucks the duck");
			}
		}		
	}	
}










