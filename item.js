var weapon_data = {
    //icon, sightBonus, rangeBonus, fightBonus, aggroBonus, peaceBonus, uses, type
    "lance": ["🔱", 0, 0, 1.3, 0, 0, [4,9], "melee"],
    "gun"  : ["🔫", 0, 20, 1.3, 0, 0, 4, "ranged"],
    "bow"  : ["🏹", 0, 30, 1.1, 0, 0, 10, "ranged"], 
    "knife": ["🔪", 0, 0, 1.1, 0, 0, [4,9], "melee"],
    "bomb" : ["💣", 0, 0, 0, 0, 0, 0, "doodad"],
    "trap" : ["🕳", 0, 0, 0, 0, 0, 0, "doodad"],
    //"nanasatsu" : ["🗡", 0, 0, 2, 1000, 0, 99999, "melee"]
    "nanasatsu" : ['<img style="width:20px;height:20px;" src="./icons/nanasatsu.png"></img>', 0, 0, 2, 1000, -1000, 99999, "melee"]
}
var weapon_data_2 = {
    //icon, sightBonus, rangeBonus, fightBonus, aggroBonus, peaceBonus, uses, type
    "lance": {
        "icon":"🔱",
        "type":"melee",
        "fightBonus":1.3,
        "uses":[4,9]
    },

    "gun"  : ["🔫", 0, 20, 1.3, 0, 0, 4, "ranged"],
    "bow"  : ["🏹", 0, 30, 1.1, 0, 0, 10, "ranged"], 
    "knife": ["🔪", 0, 0, 0, 0, 0, [4,9], "melee"],
    "bomb" : ["💣", 0, 0, 0, 0, 0, 0, "doodad"],
    "trap" : ["🕳", 0, 0, 0, 0, 0, 0, "doodad"],
    "nanasatsu" : ["🗡", 0, 0, 2, 1000, -10, 99999, "melee"]
}


function create_weapon(weapon_name, wielder){
    if(weapon_name == "Nothing"){
        return "";
    }
    else if(weapon_name=="nanasatsu"){
        return new Nanasatsu(wielder);
    }
    else if(weapon_name=="lance"){
        return new Lance(wielder);
    }
    else{
        return new Weapon(weapon_name,wielder);
    }	
}

//class to hold data for items
class Weapon {
	constructor(name, wielder){
		this.name = name;
        this.icon = "";
		this.sightBonus = 0;
		this.rangeBonus = 0;
		this.fightBonus = 0;

        this.aggroBonus = 0;
        this.peaceBonus = 0;
        
		this.uses  = 0;
        this.type="";
        this.wielder = wielder;
        
        if(name in weapon_data){
            let data = weapon_data[name];
            for(var i = 1;i<=6;i++){
                if(typeof data[i] =="object"){
                    data[i] = roll_range(data[i][0], data[i][1]);
                }
            }
            this.icon = data[0];
            this.sightBonus = data[1];
            this.rangeBonus = data[2];
            this.fightBonus = data[3];
            this.aggroBonus = data[4];
            this.peaceBonus = data[5];
            this.uses = data[6];
            this.type = data[7];
        }        
	}
    
    calc_bonuses(){
        this.wielder.sightRangeB += this.sightBonus;
		this.wielder.fightRangeB += this.rangeBonus;
		this.wielder.fightDmgB *= this.fightBonus;
        this.wielder.peaceB += this.peaceBonus;
		this.wielder.aggroB += this.aggroBonus;
    }
    /*
    Effects on wielder:
        planning
        equip
        unequip
        moving
        foraging
        sleeping
        escaping
    */
    self_effect(state, data={}){
        switch(state){
            case "equip":
                this.wielder.weapon = this;
                // this.wielder.lastAction = "found " + this.name;
                this.calc_bonuses();
                break;
            case "unequip":
                this.wielder.weapon="";
                this.wielder="";
                break;
            case "planning":
                this.wielder.div.removeClass("sexSword");
                break;
            case "use":
                this.uses--;
                if(this.uses == 0){
                    this.self_effect("break");
                }
                break;
            case "break":
                log_message(this.wielder.name +"'s " + this.name+" breaks");
                this.wielder.weapon = "";   
                this.wielder.wielder = "";
                break;
            case "death":
                break;
        }
    }
    /*
    Effects on others:
        moving
        planning
        sleeping
        attack
        win
        lose
    */
    others_effect(state, oP, data={}){
        switch(state){
            case "attack":
                this.self_effect("use");
                break;
        }
    }
    
}

class Lance extends Weapon {
    constructor(wielder) {
        super("lance", wielder);
    }
    self_effect(state, data={}){
        switch(state){
            case "planning":
                super.self_effect(data);
                if(roll([["die",1],["live",20000]]) == "die"){
                    this.wielder.health = 0;
                    this.wielder.death = "Died by their own spear";
                    this.wielder.die();
                    log_message(this.wielder.name + ' killed by lance')
                }
                break;
            default:
                super.self_effect(state, data);
                break;
        }
    }
}


class Nanasatsu extends Weapon {
    constructor(wielder) {
        super("nanasatsu", wielder);
        this.kills=0;
    }
    self_effect(state, data={}){
        switch(state){
            case "equip":
                super.self_effect("equip")
                sexSword = false;
                // this.wielder.plannedAction = "Find sex sword";
                this.wielder.statusMessage = "<span style='color:red'>found SEX SWORD</span>";
                pushMessage(this.wielder,this.wielder.name +  "<span style='color:red'> found SEX SWORD</span>");
                break;
            //turn start
            case "planning":
                this.wielder.div.addClass("sexSword");
                //lose health
                this.wielder.health -= (this.fightBonus - 1.5 - this.kills/20);
                //this.wielder.health -= (this.fightBonus +2000);
                //death message
                if(this.wielder.health <= 0){
                    this.wielder.death = "Succumbed to SEX SWORD";
                    this.wielder.die();
                    log_message(this.wielder.name + ' killed by sword')
                }
                break;
            default:
                super.self_effect(state, data);
                break;
        }
    }
    //effects on others
    others_effect(state, oP, data={}){
        switch(state){
            //killing an opponent
            case "win":
                this.kills++;  
                break;
            case "attack":
                let dmg=data['damage'];
                log_message(this.wielder.name + " SEX SWORD attack")
                log_message(this.wielder.health + " before");
                log_message(dmg);
                this.wielder.health += Math.pow(dmg,0.66);
                this.fightBonus += dmg/1000;
                log_message(this.wielder.health + " after");
                break;
            //killed by opponent
            case "lose":
                //transfer ownership to killer
                if(Math.random() > 0.1){
                    this.self_effect("unequip");
                    this.wielder=oP;
                    this.self_effect("equip");
                    log_message("sex sword is passed onto " + oP.name);
                }
                break;
            //if seen by moving player
            case "aware":
                // if (Math.random() > 1000){
                if (Math.random() > 0.1){
                    //if found start moving towards sex sword
					oP.lastAction = "following";
					oP.statusMessage = "following SEX SWORD";
					oP.currentAction.name = "";
					let newX = this.wielder.x;
					let newY = this.wielder.y;
                    oP.currentAction.targetX = newX;
                    oP.currentAction.targetY = newY;
                }
                break;
            //if in fighting range of another player
            case "in range":
                // if (Math.random() > 100){
                if (Math.random() > 0.3){
                    if(oP.setPlannedAction("fight", 7)){
                        oP.plannedTarget = this.wielder;
                        this.wielder.setPlannedAction("fight", 5);
                    }
				}
                break;
            default:
                super.others_effect(state, oP, data);
                break;
        }
    }

}















