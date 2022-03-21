var item_data = {
    //icon, sightBonus, rangeBonus, fightBonus, aggroBonus, peaceBonus, uses, type
    "lance": ["🔱", 0, 0, 1.3, 0, 0, [4,9], "melee"],
    "gun"  : ["🔫", 0, 20, 1.3, 0, 0, 4, "ranged"],
    "bow"  : ["🏹", 0, 30, 1.1, 0, 0, 10, "ranged"], 
    "knife": ["🔪", 0, 0, 0, 0, 0, [4,9], "melee"],
    "bomb" : ["💣", 0, 0, 0, 0, 0, 0, "doodad"],
    "trap" : ["🕳", 0, 0, 0, 0, 0, 0, "doodad"],
    "nanasatsu" : ["🗡", 0, 0, 2, 1000, -10, 99999, "melee"]
}

function create_item(weapon_name, wielder){
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
        return new Item(weapon_name,wielder);
    }	
}

//class to hold data for items
class Item {
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
        
        if(name in item_data){
            let data = item_data[name];
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
		this.wielder.fightB *= this.aggroBonus;
    }
    
    //effects on the wielder
    weapon_effect(state, data={}){
        switch(state){
            case "equip":
                this.wielder.lastAction = "found " + this.name;
                this.calc_bonuses();
                break;
            case "turn start":
                this.wielder.div.removeClass("sexSword");
                break;
            case "attack":
                this.uses--;
                if(this.uses == 0){
                    this.wielder.weapon = "";   
                    this.wielder.wielder = "";
                    this.weapon_effect("break");
                }
                break;
            case "break":
                break;
            case "death":
                break;
        }
    }
    
/*    

    equip(){
            this.wielder.lastAction = "found " + this.name;
            this.calc_bonuses();
    }
    
    turn_start_check(){
        this.wielder.div.removeClass("sexSword");
    }
    

    use(dmg){
        tP.weapon.uses--;
		if(this.uses == 0){
            this.wielder.weapon = "";   
        }            
    }
*/
}

class Lance extends Item {
    constructor(wielder) {
        super("lance", wielder);
    }
    weapon_effect(state, data={}){
        switch(state){
            case "turn start":
                super.weapon_effect(data);
                if(roll([["die",1],["live",20000]]) == "die"){
                    this.wielder.health = 0;
                    this.wielder.death = "Died by their own spear";
                    this.wielder.die();
                    log_message(this.wielder.name + ' killed by lance')
                }
            default:
                super.weapon_effect(state, data);
                break;

        }
    }
    /*    
    turn_start_check(){
        super.turn_start_check()
        //randomly die with a lance
        if(roll([["die",1],["live",20000]]) == "die"){
            this.wielder.health = 0;
            this.wielder.death = "Died by their own spear";
            this.wielder.die();
            log_message(this.wielder.name + ' killed by lance')
            //action();
            return;
        }
    }*/
}


class Nanasatsu extends Item {
    constructor(wielder) {
        super("nanasatsu", wielder);
    }
    
    weapon_effect(state, data={}){
        switch(state){
            case "equip":
                super.equip()
                sexSword = false;
                this.wielder.plannedAction = "Find sex sword";
                this.wielder.lastAction = "<span style='color:red'>found SEX SWORD</span>";
            case "turn start":
                this.div.addClass("sexSword");
                //lose health
                this.wielder.health -= (this.weapon.fightBonus - 1.5 - this.kills/20);
                //this.health -= (this.weapon.fightBonus +2000);
                //death message
                if(this.wielder.health <= 0){
                    this.wielder.death = "Succumbed to SEX SWORD";
                    this.wielder.die();
                    log_message(this.wielder.name + ' killed by sword')
                }
                break;
            case "attack":
                let dmg=data['damage'];
                log_message(this.wielder + "SEX SWORD attack")
                log_message(this.wielder.dmg + "before");
                this.wielder.health += Math.pow(dmg,0.66);
                this.fightBonus += dmg/1000;
                log_message(this.wielder.dmg + "after");
                break;
            //if seen by a nearby player
            case "planning":
                let oP = data['opponent'];
                if (Math.random() > 0.3){
					oP.plannedTarget = this.wielder;
					oP.plannedAction = "fight_special";
					this.wielder.plannedAction = "fight";
				}
                break;
            //if seen by moving player
            case "moving":
                oP = data['opponent'];
                if (Math.random() > 0.1){
                    //if found start moving towards sex sword
					newX = this.wielder.x;
					newY = this.wielder.y;
					oP.lastAction = "following SEX SWORD";
					oP.currentAction.name = "";
                }
                break;
            //killed by opponent
            case "lose":
                oP = data['opponent'];
                if(Math.random() > 0.1){
                    oP.weapon = this;
                    this.wielder.weapon = "";
                    this.wielder=oP;
                }
            default:
                super.weapon_effect(state, data);
                break;
        }
    }

    /*
    equip(){
        super.equip()
        sexSword = false;
        this.wielder.plannedAction = "Find sex sword";
		this.wielder.lastAction = "<span style='color:red'>found SEX SWORD</span>";
    }
    turn_start_check(){
        this.div.addClass("sexSword");
        //lose health
		this.wielder.health -= (this.weapon.fightBonus - 1.5 - this.kills/20);
		//this.health -= (this.weapon.fightBonus +2000);
        //death message
		if(this.wielder.health <= 0){
			this.wielder.death = "Succumbed to SEX SWORD";
			this.wielder.die();
            log_message(this.wielder.name + ' killed by sword')
			//action();
		}
    }
    use(dmg){
		console.log(this.wielder + "before");
		console.log(dmg);
		this.wielder.health += Math.pow(dmg,0.66);
		this.fightBonus += dmg/1000;
		console.log(this.wielder + "after");
		      
    }
    */
}















