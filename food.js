var food_data = {
	"apple" : {
		"icon":"🍎",
		"uses": [1,5],
		"heal": 8
	},
	"pie" : {
		"icon":"🥧", 
		"uses": 1,
		"heal": 20	
	},
	"banana" : {
		"icon":"🍌", 
		"uses": [2,4],
		"heal": 8,
		"energy_heal": 10
	},
	"health_potion" : {
		"icon":"?", 
		"uses": [2,4],
		"heal": 8
	},
	"str_potion" : {
		"icon" : "./icons/str_pot.png",
		"icon_type" : "img",
		"uses": 1,
	},
	"ebiroll" : {
		"icon":"🦐", 
		"uses": 1,
		"heal": 30
	}
}
defaultFoodOdds = [["apple",10],["pie",10],["banana",10],["ebiroll",5],["str_potion",10]]
function create_food(food_name){
	switch(food_name){
		case "ebiroll":
			return new Ebiroll();
			break;
		case "str_potion":
			return new StrPotion();
			break;
		default:
			if(food_name in food_data){
				return new Food(food_name);
			}
			else{
				return "";
			}
			break;		
	}
	return "";
}
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
			this.wielder.statusMessage =  "found " + this.uses+" "+this.name+"s";
		}
		return true;
	}
	
	eat(){
		this.wielder.heal_damage(this.heal, this, "food")
		this.wielder.heal += this.energy_heal;
		this.wielder.statusMessage =  "eats a " +this.name;
		this.wielder.resetPlannedAction();
		this.use();
	}
	
	effect(state, data={}){
		switch(state){
			case "planAction":
				let health_percent = ((this.wielder.health+this.heal*0.4)/this.wielder.maxHealth) *100;
				if(health_percent < roll_range(10,100) && getTerrain(this.wielder.x,this.wielder.y).danger==0 && this.wielder.lastAction != "foraging" && this.wielder.lastAction != "sleeping"){
					//set priority for foraging depending on energy
					let eatLv=3;
					if(health_percent<20){eatLv = 7;}
					if(health_percent < 10){eatLv = 14;}
					if(health_percent < 5){eatLv = 19;}
					this.wielder.setPlannedAction("eat", eatLv);
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
			"<span style='font-size:12px'>"+this.wielder.name+"</span><br>"+
			"<span><b>Quantity:</b>"+this.uses+"</span><br>"+
			this.item_html()+
		"</div>"				
		$('#extra_info_container').html(item_info);
	}
	item_html(){
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
		this.wielder.statusMessage =  "found a strength potion";
		return true;
	}
	eat(){
		let str_eff = new Buff("strength", 2, 4, {"fightBonus":[1,0.1]})
		str_eff.icon = "💪";
		this.wielder.inflict_status_effect(str_eff)
		this.wielder.statusMessage =  "drinks a strength potion";
		this.wielder.resetPlannedAction();
		this.use();
	}
	effect(state, data={}){
		switch(state){
			case "planAction":
				if(25 + this.wielder.inRangeOf.length*5  + this.wielder.aggroB/20 > roll_range(0,100)){
					this.wielder.setPlannedAction("eat", 6);
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
		this.wielder.statusMessage =  "found an 🌊Ebiroll🌊!";
		return true;
	}
	
	eat(){
		if(Math.random()<0.5){
			this.wielder.heal_damage(this.heal, this, "food")
			this.wielder.heal += this.energy_heal;
			this.wielder.statusMessage =  "eats the Ebiroll";
		}
		//eating a whole shrimp hurts you
		else{
			let dmg = roll_range(1,10)
			this.wielder.take_damage(dmg, this, "food")
			if(this.wielder.health<=0){
				this.wielder.statusMessage =  "chokes to death on the Ebiroll";
				this.wielder.death =  "choked on an Ebiroll";
			}
			else{
				this.wielder.statusMessage =  "chokes on the Ebiroll";
			}
		}
		this.wielder.resetPlannedAction();
		this.use();
	}
	item_html(){
		let html = 	super.item_html()+
		"<span class='desc'>"+
			"<span>EBIROLLLL</span><br>"+	
			"<span>EBIROLLLLLL</span><br>"+	
			"<span>EBIGOAAAAAAAAL</span>"+
		"</span>"
		return html;
	}
}