var doodad_data = {
				//icon, range, dmg, triggerRange, type
	"bomb" : ["💣",100,100,24, "explosive"],
	"trap" : ["🕳",24,[0,50],24, "none"]
}
//any item that appears on the map
class Doodad {
	constructor(name, x,y,owner){
		this.name = name;
		this.x = x;
		this.y = y;
		this.owner = owner;
		
		this.id = doodadsNum;
		doodadsNum++;
		
		this.range = 0;
		this.dmg = 0;
		this.triggerRange = 0;
		this.triggerChance=0;	//-5 or lower for no chance

		if(name in doodad_data){
			let data = doodad_data[name];
			for(var i = 1;i<=3;i++){
				if(typeof data[i] =="object"){
					data[i] = roll_range(data[i][0], data[i][1]);
				}
			}
			this.icon = data[0];
			this.range = data[1];
			this.dmg = data[2];
			this.triggerRange = data[3];
			this.triggerChance = data[4];
		}		
	}
	draw(){
		let doodDiv = $('#doodad_' + this.id);
		if(!doodDiv.length){
			$('#doodads').append("<div id='doodad_" + this.id + "' class='bomb' style='transform:translate(" + (this.x / 1000 * $('#map').width() - iconSize/2) + "px," + (this.y / 1000 *  $('#map').height() - iconSize/2) + "px)'>" + this.icon + "</div>");
			doodDiv = $('#doodad_' + this.id);
			this.div = doodDiv;
		}
	}
	//look for players in range
	update(){
		let tD = this;
		players.forEach(function(tP,index){
			let dist = hypD(tP.x - tD.x, tP.y - tD.y);
			if(dist <= tD.triggerRange){
				let triggerChance = 5 + tD.triggerChance;
				let triggerNoChance = 15;
				if(tD.owner == tP)
					triggerNoChance += 100;
				if(roll([["yes",triggerChance],["no",triggerNoChance]]) == 'yes')
					tD.trigger(tP);
			}
		});
	}
	trigger(trigger_player){
	}
	destroy(){
		doodads = arrayRemove(doodads,this);
		this.div.remove();
	}
}

class BombEntity extends Doodad{
	constructor(x,y,owner){
		super("bomb", x,y,owner);
	}
	
	//deal damage to players
	damage_player(oP){
		let	dmg = Math.floor(Math.random() * this.dmg);
		oP.take_damage(dmg, this, "explosive")
		//killed the player
		if(oP.health <= 0){
			this.owner.kills++;
			if(oP == this.owner){
				oP.death = "blown up by their own bomb";
				pushMessage(oP, oP.name + " blown up by their own bomb");
			} else {
				oP.death = "blown up by " + this.owner.name;
				pushMessage(oP, oP.name + " blown up by " + this.owner.name);
			}
		}
		else{
			pushMessage(oP, oP.name + " hit by "+ this.owner.name +"'s bomb");
		}
	}


	trigger(trigger_player){
		if(trigger_player == this.owner){
			pushMessage(trigger_player, trigger_player.name + " triggered their own bomb");
		}
		else if(trigger_player!=""){
			pushMessage(trigger_player, trigger_player.name + " triggered "+ this.owner.name +"'s bomb");
		}
		
		//look for players int eh blast radius
		let tD = this;
		players.forEach(function(oP,index){
			let dist = hypD(oP.x - tD.x,oP.y - tD.y);
			if(dist <= tD.range){
				tD.damage_player(oP);
				log_message(oP.name + " hit by bomb");
			}
		});
	}
}

class TrapEntity extends Doodad{
	constructor(x,y,owner){
		super("trap",x,y,owner);
	}
	
	trigger(trigger_player){
		if(trigger_player == this.owner){
			pushMessage(trigger_player, trigger_player.name + " fell into their own trap");
		}
		else if(trigger_player!=""){
			pushMessage(trigger_player, trigger_player.name + " fell into "+ this.owner.name +"'s trap");
		}
		
		trigger_player.inflict_status_effect(new Trapped(5, this.owner));
	}
}




