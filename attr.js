function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			return new Nenene(player);
			break;	
		case "cunny":
			return new Cunny(player);
			break;		
		case "joshiraku":
			return new Joshiraku(player);
			break;		
		case "bong":
			return new Bong(player)
			break;
		case "melee":
			return new Melee(player)
			break;
		case "ranger":
			return new Ranger(player)
			break;
		case "magic":
			return new Magic(player)
			break;
		case "bigguy":
			return new BigGuy(player)
			break;
		default:
			return new Attr(attr_name, player)
			break;
	}
}
class Attr{
	constructor(name, player){
		this.name = name;
		this.player = player
		this.display = true;
	}
	
	calc_bonuses(){}
	effect(state, data={}){}
}

class Nenene extends Attr{
	constructor(player){
		super("nenene", player);
		this.display=false;
	}
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let name = "Nenene"
				for(let i=0; i<roll_range(0,8); i++){
					name = name+"ne"
				}
				this.player.name = name;
				this.player.div.find('.charText').text(name)
				this.player.tblDiv.find('.info div:first-child b').text(name)
				break;
		}
	}
}

class Joshiraku extends Attr{
	constructor(player){
		super("joshiraku", player);
		this.display=false;
		this.imgs = [
			'https://cdn.myanimelist.net/images/characters/7/173549.jpg',
			'https://cdn.myanimelist.net/images/characters/13/145959.jpg',
			'https://cdn.myanimelist.net/images/characters/13/149113.jpg',
			'https://cdn.myanimelist.net/images/characters/5/177655.jpg',
			'https://cdn.myanimelist.net/images/characters/6/177653.jpg',
		]
	}
	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let img = this.imgs[roll_range(0,this.imgs.length-1)]
				this.player.img = img;
				this.player.div.css('background-image', 'url("'+img+'")');
				playerStatic[0].tblDiv.find('img').attr("src", img)
				break;
		}
	}
}

class Cunny extends Attr{
	constructor(player){
		super("cunny", player);
	}
	calc_bonuses(){
		this.player.moveSpeedB*=1.5;
		this.player.intimidation -=10;
	}
	effect(state, data={}){
		switch(state){
			case "opAware":
				let oP=data['opponent'];
				if (Math.random() < 0.05){
					let temp_charm = new Charm(this.player);
					temp_charm.level=2;
					temp_charm.icon = "😭"
					if(Math.random()<0.1){
						temp_charm.aggro = true;
						temp_charm.level=1;
						temp_charm.icon = "💢"
						temp_charm.display_name = "Correction"
					}
					oP.inflict_status_effect(temp_charm);
				}
				break;
		}
	}
}

class Bong extends Attr{
	constructor(player){
		super("bong", player);
	}
	
	tea(){
		this.player.energy += this.player.maxEnergy*0.5;
		this.player.health += this.player.maxHealth*0.3;
		this.player.lastAction = "tea";
		this.player.statusMessage = "Stops to drink tea";
		this.player.resetPlannedAction();
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(hour == 15){
					this.player.setPlannedAction("tea", 5);
				}
				break;
			case "tea":
				this.tea();
				break;
		}
	}
}

class Melee extends Attr{
	constructor(player){
		super("melee", player);
	}
	calc_bonuses(){
		if(!this.player.weapon){
			this.player.fightDmgB *= 1.05
		}
		else{
			if(this.player.weapon.dmg_type=='melee'){
				this.player.fightDmgB *= 1.1
			}
		}
	}
}
class Ranger extends Attr{
	constructor(player){
		super("ranger", player);
	}
	
	calc_bonuses(){
		if(this.player.weapon && this.player.weapon.dmg_type=='ranged'){
			this.player.fightDmgB *= 1.1;
			this.player.fightRangeB += 10;
		}
		this.player.sightRangeB += 10;
	}
}
class Magic extends Attr{
	constructor(player){
		super("magic", player);
	}
	
	calc_bonuses(){
		if(this.player.weapon && this.player.weapon.dmg_type=='magic'){
			this.player.fightDmgB *= 1.2;
			this.player.fightRangeB += 10;
		}
	}
}

class BigGuy extends Attr{
	constructor(player){
		super("bigguy", player);
	}
	
	calc_bonuses(){
		if(!this.player.weapon){
			this.player.fightDmgB *= 1.1
		}
		this.player.dmgReductionB*=0.9
		this.player.moveSpeedB *= 0.75
		this.player.visibilityB += 30
		this.player.intimidation +=15;
	}
}







