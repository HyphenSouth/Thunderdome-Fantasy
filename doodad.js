var doodad_data = {
                //icon, range, dmg, triggerRange, type
    "bomb" : ["💣",100,100,24, "explosive"],
    "trap" : ["🕳",24,[0,50],24, "none"]
}
//any item that appears on the map
class Doodad {
	constructor(name,x,y,owner){
		this.name = name;
		this.x = x;
		this.y = y;
		this.owner = owner;
		this.id = doodadsNum;
		doodadsNum++;
        
        this.range = 0;
		this.dmg = 0;
		this.triggerRange = 0;
        this.type=""

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
            this.type = data[4];
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
	trigger(){
		let tD = this;
		players.forEach(function(oP,index){
			let dist = hypD(oP.x - tD.x,oP.y - tD.y);
			if(dist <= tD.range){
				damage(tD,oP);
                log_message(oP.name + " is trapped");
				if(oP.health > 0 && tD.name == "trap"){
					oP.lastAction = "trapped";
					oP.currentAction.name = "trapped";
				}
			}
		});
		this.div.remove();
		doodads = arrayRemove(doodads,this);
	}
}