var item_data = {
                //icon, sightBonus, rangeBonus, fightBonus, uses, type
    "lance" : ["🔱",0, 0,1.3,[4,9],"melee"],
    "gun" : ["🔫",0, 20,1.3,4,"ranged"],
    "bow": ["🏹",0, 30,1.1,10,"ranged"], 
    "knife": ["🔪",0, 0,0,[4,9],"melee"],
    "bomb" : ["💣",0, 0,0,0,"doodad"],
    "trap" : ["🕳",0, 0,0,0,"doodad"],
    "nanasatsu" : ["🗡",0, 0,2,99999,"melee"]
}

//class to hold data for items
class Item {
	constructor(name, wielder){
		this.name = name;
        this.icon = "";
		this.sightBonus = 0;
		this.rangeBonus = 0;
		this.fightBonus = 0;
		this.uses  = 0;
        this.type="";
        this.wielder = wielder;
        
        if(name in item_data){
            let data = item_data[name];
            for(var i = 1;i<=4;i++){
                if(typeof data[i] =="object"){
                    data[i] = roll_range(data[i][0], data[i][1]);
                }
            }
            this.icon = data[0];
            this.sightBonus = data[1];
            this.rangeBonus = data[2];
            this.fightBonus = data[3];
            this.uses = data[4];
            this.type = data[5];
        }        
        
        /*
		switch(this.name){
			case "🔱":
				this.fightBonus = 1.3;
				this.uses = Math.floor(Math.random() * 4) + 5;
				break;
			case "🔫":
				this.rangeBonus = 20;
				this.fightBonus = 1.3;
				this.uses = 4;
				break;
			case "🏹":
				this.rangeBonus = 30;
				this.fightBonus = 1.1;
				this.uses = 10;
				break;
			case "🔪":
				this.fightBonus = 1.2;
				this.uses = Math.floor(Math.random() * 4) + 5;
				break;
			case "💣":
				break;
			case "🕳":
				break;
			case "🗡":
				this.fightBonus = 2;
				this.uses = 99999;
				console.log("Sword");
				break;
		}*/
	}
}