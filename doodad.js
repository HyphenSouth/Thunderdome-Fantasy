function setDoodadIcon(icon){
	// return '<img class="item_img" src="' + icon +'"></img>';
	return '<img src="'+icon+'"></img>';
}

//any item that appears on the map
class Doodad {
	constructor(name, x,y,owner){
		this.name = name;
		this.x = x;
		this.y = y;
		this.owner = owner;
		this.icon = "❓"
		
		this.id = doodadsNum;
		doodadsNum++;
		
		//trigger radius
		this.triggerRange = 25;
		//chance to trigger
		this.triggerChance=25;
		this.ownerTriggerChance = 5;
		//how long doodad can stay out
		this.duration=30;
		this.max_triggers = 9999 //maximum triggers per turn
	}
	draw(){
		let doodDiv = $('#doodad_' + this.id);
		if(!doodDiv.length){
			$('#doodads').append(
			"<div id='doodad_" + this.id + "' class='doodad' style='transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px);'>" + 
				this.icon + 
			"</div>");
			doodDiv = $('#doodad_' + this.id);
			this.div = doodDiv;
		}
		else{
			this.div.html(this.icon);
		}
	}
	//look for players in range
	update(){		
		if(this.duration<=0){
			this.expire();
		}
		else{
			let tD = this;
			let trigger_cnt = 0
			for(let i=0; i<players.length;i++){
				let tP = players[i]
				let dist = hypD(tP.x - tD.x, tP.y - tD.y);
				if(dist <= tD.triggerRange){
					log_message(tD.name+" "+ tP.name+" in range")	
					let trig = tD.triggerChance
					if(tP==tD.owner){
						trig=tD.ownerTriggerChance
					}
					if(trig>=roll_range(0,100)){
						// log_message(tP.name +" triggered a "+tD.name);
						tD.trigger(tP);
						trigger_cnt++
					}
					if(trigger_cnt>=this.max_triggers){
						break;
					}
				}
			}
			/*
			players.forEach(function(tP,index){
				let trigger_cnt = 0
				let dist = hypD(tP.x - tD.x, tP.y - tD.y);
				if(dist <= tD.triggerRange){
					log_message(tD.name+" "+ tP.name+" in range")	
					let trig = tD.triggerChance
					if(tP==tD.owner){
						trig=tD.ownerTriggerChance
					}
					if(trig>=roll_range(0,100)){
						// log_message(tP.name +" triggered a "+tD.name);
						tD.trigger(tP);
						trigger_cnt++
					}
					if(trigger_cnt>=max_triggers){
						return
					}
				}
			});
			*/
		}
		this.duration--;
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
		this.explode_range = 50;
		this.dmg = 50;
		this.triggerRange = 24;
		this.max_triggers=1;
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
			if(dist <= tD.explode_range && oP.health>0){
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
		this.triggerRange = 24;
		this.duration=50;
		this.max_triggers=2;
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

class FireEntity extends Doodad{
	constructor(x,y, owner=""){
		super("fire",x,y,owner);
		this.icon = "🔥";
		this.duration=2;
		this.triggerRange = 24;	
		this.spread=true;
	}

	trigger(trigger_player){	
		trigger_player.inflict_status_effect(new Burn(2, 3, this.owner));
	}

	update(){
		if(getTerrainType(this.x,this.y)=="water"){
			this.destroy();
		}
		//spread to trees
		if(this.spread && getTerrainType(this.x,this.y)=="tree" &&Math.random()<0.2){
			let newTerrain = new FireTerrain(this.x, this.y, roll_range(1,4))
			setTerrain(newTerrain)
		}
		super.update();
	}
}

class CampfireEntity extends Doodad{
	constructor(x,y,owner){
		super("campfire",x,y,owner);
		this.icon = setDoodadIcon('./icons/campfire.png');
		this.triggerRange = 24;
		this.triggerChance=25;
		this.ownerTriggerChance = 95;
	}
	expire(){
		log_message(this.name+" expires");
		if(Math.random()<4){
			let tempFire = new FireEntity(this.x, this.y,"")
			tempFire.draw()
			tempFire.duration = roll_range(2,4);
			doodads.push(tempFire);
		}
		this.destroy();
	}
	trigger(trigger_player){
		log_message(trigger_player.name + " triggered campfire entity")
		if(trigger_player==this.owner){
			trigger_player.inflict_status_effect(new Comfy(4, 2));
		}
		else{
			trigger_player.inflict_status_effect(new Comfy(2, 2));
		}
	}
}

class MirrorEntity extends Doodad{
	constructor(x,y,owner){
		super("mirror",x,y,owner);
		this.icon = setDoodadIcon('./icons/mirror_broken2.png');
		this.triggerRange = 30;
		this.triggerChance=40;
		this.max_triggers = 1;
	}
	
	trigger(trigger_player){
		log_message(trigger_player.name + " triggered mirror entity")
		let newX = 0;
		let newY = 0;
		//get new cords to move to
		let tries = 0;
		do {
			newX = Math.floor(Math.random()*mapSize);
			newY = Math.floor(Math.random()*mapSize);
			tries++;
		} while(!safeBoundsCheck(newX,newY) && tries < 3);
		
		pushMessage(trigger_player, trigger_player.name + " finds a scrying mirror on the ground");
		//oob coords
		if(!inBoundsCheck(newX, newY)){
			log_message("mirror tele death")
			trigger_player.health=0
			trigger_player.death = "accidentally teleports into space and dies"
			trigger_player.lastAction = "teleport"
		}
		else{
			trigger_player.statusMessage = "teleported by a stray scrying mirror"
		}
		trigger_player.moveToCoords(newX, newY);
		trigger_player.resetPlannedAction()
		trigger_player.finishedAction = true;

		this.destroy();
	}
}

class MovableEntity extends Doodad{
	constructor(name,x,y, owner){
		super(name,x,y,owner);
		this.moveSpeed = 40	
	}
	//move to random location
	moveRandom(){
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
		this.moveToTarget(newX, newY)
	}
	//move based on speed
	moveToTarget(newX,newY){
		let distX = newX - this.x;
		let distY = newY - this.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		let targetX = 0;
		let targetY = 0;
		if(dist <= this.moveSpeed){
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
		this.moveToCoords(targetX, targetY);
	}
	moveToCoords(targetX,targetY){
		this.x = targetX;
		this.y = targetY;
		targetX = targetX / mapSize * $('#map').width() - iconSize/2;
		targetY = targetY / mapSize * $('#map').height() - iconSize/2;
		
		//update icons on map
		let doodadDiv = $('#doodad_' + this.id);
		doodadDiv.css({transform:"translate(" + targetX + "px," + targetY + "px)"},function(){
		});
		log_message(this.name +" moves to (" +this.x +","+ this.y+")", 1);
	}
}

max_decoys=3
decoy_count=0;
class DecoyEntity extends MovableEntity{
	constructor(x,y, owner){
		super("decoy",x,y,owner);
		this.name = this.owner.name+"'s decoy";
		this.icon = "";
		this.img = this.owner.img
		this.moveSpeed = 20
		
		//trigger radius
		this.triggerRange = 50;
		//chance to trigger
		this.triggerChance = 90;
		this.ownerTriggerChance = 0;
		//how long doodad can stay out
		
		this.duration=10;
		this.followers=[];
		this.attackers=[];
		this.active=true;
		this.attack_func = function(attacker, tD){
			log_message(attacker.name+" attacks "+tD.name);
			attacker.statusMessage = "attacks "+ tD.name;
		}	//func when attacked
		decoy_count++;
	}
	trigger(trigger_player){
		let tempEff = new DecoyEffect(1, 1, this.owner, this)
		// tempEff.name = "illusion"
		trigger_player.inflict_status_effect(tempEff);
	}
	attacked(attacker){
		this.attack_func(attacker, this)
	}
	
	draw(){
		let doodDiv = $('#doodad_' + this.id)
		if(!doodDiv.length){
			$('#doodads').append(
			"<div id='doodad_" + this.id + "' class='doodad decoy' style='transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px);'>" + 
				// this.name+
			"</div>");
			doodDiv = $('#doodad_' + this.id);
			doodDiv.css('background-image',"url(" + this.img + ")");
			this.div = doodDiv;
		}
	}
	
	destroy(){
		decoy_count--;
		super.destroy()
	}
	update(){
		if(this.active){
			this.followers=[];
			this.attackers=[];
			this.moveRandom();
			super.update();
		}
		else{
			this.destroy();
		}
	}
}

function spawn_duck(x,y){
	let tempDuck = new FuckDuck(x, y);
	tempDuck.draw();
	doodads.push(tempDuck);
}

class FuckDuck extends MovableEntity{
	constructor(x,y){
		super("duck",x,y,"");
		// this.icon = "🦆";
		this.icon = setDoodadIcon('./icons/duck2.png');
		this.explode_range = 100;
		this.duration=99999;
		
		this.triggerRange = 24;
		this.triggerChance=100;
		this.dmg = 100;
		
		this.fuck_count = 0;
		this.fuck_max = roll_range(3,10)
		
		this.moveSpeed = 60
		
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
			if(dist <= tD.explode_range && oP.health>0 && oP!=trigger_player){
				tD.damage_player(oP);
				log_message(oP.name + " hit by duck");
			}
		});
		this.active=false;
	}
	
	update(){
		if(this.active){
			this.moveRandom();
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










