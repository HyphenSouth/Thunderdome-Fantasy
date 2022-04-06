var terrain_icons = {
	"w":"🔵",
	//"w":"💧",
	"t":"🌳",
	"m":"⛰️",
	"f":"🔥",
	"d":"🟩"
}

function getTerrain(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			return terrain;
		} else {
			return "";
		}
	}
}

function setTerrain(x,y, newTerrain){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(!terrain[roundX]){
		terrain[roundX]=[]
	}
	terrain[roundX][roundY]=newTerrain;
	terrain[roundX][roundY].draw();
}

//get the type of terrain at coords
function terrainCheck(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			return terrain[roundX][roundY].type;
		} else {
			return "Index error";
		}
	}
}

class Terrain {
	constructor(type,x,y){
		this.x = x;
		this.y = y;
		this.type=type;
		this.spreadOnce = false;
		this.riverSpawn = false;
		//generate random terrain type
		if(type == "rand"){
			this.type = roll([["t",100],["m",5],["",250],["w",5]]);
		}
		
		if(this.type == "w" && roll([["yes",1],["no",5]]) == "yes"){
			this.riverSpawn = true;
			riverSpawns.push(this);
		}

	}
	draw(){
		let terrainDiv = $('#terrain_' + this.x + "_" + this.y);
		let icon = "";
		if(this.type in terrain_icons){
			icon = terrain_icons[this.type];
		}

		if(!terrainDiv.length){
			$('#terrain').append("<div id='terrain_" + this.x + "_" + this.y + "' class='terrain' style='transform:translate(" + (this.x / mapSize * $('#map').width() - 12.5) + "px," + (this.y / mapSize *  $('#map').height() - 12.5) + "px)'>" + icon + "</div>");
			terrainDiv = $('#terrain_' + this.x + "_" + this.y);
			// this.div = terrainDiv;
		}
		this.div = terrainDiv;
		terrainDiv.text(icon);
	}
	destroy(){
		// log_message("removed "+ this.x +" "+this.y)
		this.div.remove();
		terrain[this.x] = arrayRemove(terrain[this.x],this);
	}
	generationSpread(){
		//spread water
		if(this.type=="w" && !this.spreadOnce){
			//look at the adjacent squares
			for(var i = this.x - 25;i <= this.x+25;i+=25){
				for(var j = this.y -25;j <= this.y+25;j+=25){
					let spreadTimes = 0;
					if(terrain[i]){
						if(terrain[i][j]){
							//if the terrain is not a water type or itself
							if(terrain[i][j].type != "w" && terrain[i][j] != this){
								//roll a chance to spread. chance to spread decreases the more its spread
								if(roll([["yes",1],["no",8+spreadTimes]])=="yes"){
									spreadTimes++;
									terrain[i][j].type = "w";
									//terrain[i][j].icon = water_icon2
									terrain[i][j].spreadOnce = false;
									terrain[i][j].draw();
								}
							}
						}
					}
					this.spreadOnce = true;
					
				}
			}
		}
		//spread mountains
		else if(this.type=="m" && !this.spreadOnce){
			for(var i = this.x - 25;i <= this.x+25;i+=25){
				for(var j = this.y -25;j <= this.y+25;j+=25){
					let spreadTimes = 0;
					if(terrain[i]){
						if(terrain[i][j]){
							if(terrain[i][j].type != "m" && terrain[i][j] != this){
								if(roll([["yes",1],["no",20+spreadTimes*10]])=="yes"){
									spreadTimes++;
									terrain[i][j].type = "m";
									//terrain[i][j].icon = mtn_icon
									terrain[i][j].spreadOnce = false;
									terrain[i][j].draw();
								}
							}
						}
					}
					this.spreadOnce = true;
				}
			}
		}
	}
}