defaultFoodOdds = [["apple",10],["pie",10],["banana",10],["ebiroll",5],["str_potion",0],["purple",50]]

class Food extends Offhand{
	constructor(name) {
		super(name);
		this.uses=1;	
		this.heal = 0;
		this.energy_heal = 0;
		
		if(name in food_data){
			let data = food_data[name];
			if("icon" in data){
				if(data.icon_type=="img"){
					this.icon = setItemIcon(data["icon"]);
				}
				else{
					this.icon=data["icon"];
				}
			}
			if("uses" in data){this.uses = processDataNum(data["uses"])}			
			if("heal" in data){this.heal = processDataNum(data["heal"])}			
			if("energy_heal" in data){this.energy_heal = processDataNum(data["energy_heal"])}			
		}
	}
	equip(wielder){
		super.equip(wielder)
		if(this.uses>1){
			this.player.statusMessage =  "found " + this.uses+" "+this.name+"s";
		}
		return true;
	}
	
	eat(){
		this.player.heal_damage(this.heal, this, "food")
		this.player.energy += this.energy_heal;
		this.player.statusMessage =  "eats a " +this.name;
		this.player.resetPlannedAction();
		this.use();
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				let health_percent = ((this.player.health+this.heal*0.4)/this.player.maxHealth) *100;
				if(health_percent < roll_range(10,100) && getTerrain(this.player.x,this.player.y).danger==0 && this.player.lastAction != "foraging" && this.player.lastAction != "sleeping"){
					let eatLv=3;
					if(health_percent<20){eatLv = 7;}
					if(health_percent < 10){eatLv = 14;}
					if(health_percent < 5){eatLv = 19;}
					this.player.setPlannedAction("eat", eatLv);
				}
				break;
			case "eat":
				this.eat();
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
	
	show_info(){
		let item_info = 
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Quantity:</b>"+this.uses+"</span><br>"+
			this.stat_html()+
		"</div>"				
		$('#extra_info_container').html(item_info);
	}
	stat_html(){
		let html = 	""
		if(this.heal>0){
			html = html+"<span><b>Heals:</b>"+this.heal+"hp</span><br>"
		}
		if(this.energy_heal>0){
			html = html+"<span><b>Energy:</b>"+this.energy_heal+"ep</span><br>"
		}
		return html;
	}
}

class StrPotion extends Food{
	constructor() {
		super("str_potion")
		this.display_name = 'Strength Potion'
	}
	equip(wielder){
		super.equip(wielder)
		this.player.statusMessage =  "found a strength potion";
		return true;
	}
	eat(){
		let str_eff = new StatusEffect("strength", 2, 4, {"fightBonus":[1,0.1]})
		str_eff.icon = "💪";
		this.player.inflict_status_effect(str_eff)
		this.player.statusMessage =  "drinks a strength potion";
		this.player.resetPlannedAction();
		this.use();
	}
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(25 + this.player.inRangeOf.length*5  + this.player.aggroB/20 > roll_range(0,100)){
					this.player.setPlannedAction("eat", 6);
				}
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}

class Ebiroll extends Food{
	constructor() {
		super("ebiroll")
	}
	equip(wielder){
		super.equip(wielder)
		this.player.statusMessage =  "found an 🌊Ebiroll🌊!";
		return true;
	}
	
	eat(){
		if(Math.random()<0.5){
			this.player.heal_damage(this.heal, this, "food")
			this.player.energy += this.energy_heal;
			this.player.statusMessage =  "eats the Ebiroll";
		}
		//eating a whole shrimp hurts you
		else{
			let dmg = roll_range(1,10)
			this.player.take_damage(dmg, this, "food")
			if(this.player.health<=0){
				this.player.statusMessage =  "chokes to death on the Ebiroll";
				this.player.death =  "choked on an Ebiroll";
			}
			else{
				this.player.statusMessage =  "chokes on the Ebiroll";
			}
		}
		this.player.resetPlannedAction();
		this.use();
	}
	stat_html(){
		let html = 	super.stat_html()+
		"<span class='desc'>"+
			"<span>EBIROLLLL</span><br>"+	
			"<span>EBIROLLLLLL</span><br>"+	
			"<span>EBIGOAAAAAAAAL</span>"+
		"</span>"
		return html;
	}
}

class PurpleSweet extends Food{
	constructor() {
		super("purple")		
		this.display_name = 'Purple Sweet'
	}
	equip(wielder){
		super.equip(wielder)
		this.player.statusMessage =  "finds " + this.uses + " purple sweets";
		return true;
	}
	
	effect(state, data={}){
		switch(state){
			case "takeDmg":
				if(data.fightMsg.events){
					data.fightMsg.events.push(this.player.name + ' quickly eats a purple sweet')
				}
				this.eat()
				break;
			default:
				super.effect(state, data)
				break;
		}
	}
}