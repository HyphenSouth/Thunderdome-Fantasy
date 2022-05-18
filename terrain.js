var terrain_icons = {
	// "water":"🟦",
	"water":"🔵",
	// "water":"💧",
	"tree":"🌳",
	"mtn":"⛰️",
	"fire":"🔥",
	"d":"🟩",	//danger, unused
	"none":""
}

function setTerrain(newTerrain){
	// let roundX = Math.round(x/25)*25;
	// let roundY = Math.round(y/25)*25;	
	
	let roundX = Math.round(newTerrain.x/25)*25;
	let roundY = Math.round(newTerrain.y/25)*25;
	if(!terrain[roundX]){
		terrain[roundX]=[]
	}
	terrain[roundX][roundY]=newTerrain;
	terrain[roundX][roundY].draw();
}

//get the terrain object at coords
function getTerrain(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	let tempTerrain=""
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			tempTerrain= terrain[roundX][roundY];
		}
	}
	return tempTerrain;
}

//get the type of terrain at coords
function terrainCheck(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			return terrain[roundX][roundY].type;
		} else {
			return "";
		}
	}
}

function create_terrain(type, x, y){
	let newTerrain = ""
	switch(type){
		case "tree":
			newTerrain = new TreeTerrain(x, y)
			break;
		case "water":
			newTerrain = new WaterTerrain(x, y,true)
			break;	
		case "mtn":
			newTerrain = new MtnTerrain(x, y)
			break;
		case "none":
			newTerrain = new Terrain('none', x, y)
			break;
		case "rand":
			//generate random terrain type
			// let rand_type = roll([["tree",100],["mtn",5],["none",250],["water",5]]);
			let rand_type = roll([["tree",50],["mtn",5],["none",300],["water",5]]);
			newTerrain = create_terrain(rand_type, x, y)
			break;
	}
	return newTerrain;
}

class Terrain {
	constructor(type,x,y){
		this.x = x;
		this.y = y;
		this.type=type;
		this.danger = false;
		
		this.icon = "❓";
		if(this.type in terrain_icons){
			this.icon = terrain_icons[this.type];
		}
		this.new_spawn=true;
		
		// this.spreadOnce = false;
		// this.riverSpawn = false;
		// if(this.type == "water" && roll([["yes",1],["no",5]]) == "yes"){
			// this.riverSpawn = true;
			// riverSpawns.push(this);
		// }
	}
	
	draw(){
		let terrainDiv = $('#terrain_' + this.x + "_" + this.y);
		if(!terrainDiv.length){
			$('#terrain').append(
				"<div id='terrain_" + this.x + "_" + this.y + "' "+
				"class='terrain' "+
				"style='transform:translate(" + (this.x / mapSize * $('#map').width() - 12.5) + "px," + (this.y / mapSize *  $('#map').height() - 12.5) + "px)'>" + 
					this.icon + 
				"</div>"
			);
			terrainDiv = $('#terrain_' + this.x + "_" + this.y);
			// this.div = terrainDiv;
		}
		this.div = terrainDiv;
		terrainDiv.text(this.icon);
	}

	destroy(){
		// log_message("removed "+ this.x +" "+this.y)
		this.div.remove();
		terrain[this.x] = arrayRemove(terrain[this.x],this);
	}
	
	//get terrain in the adjacent squares
	get_adjacent(){
		let terrains = [];
		for(var i = this.x - 25;i <= this.x+25;i+=25){
			for(var j = this.y -25;j <= this.y+25;j+=25){
				let tempTerrain = getTerrain(i,j)
				if(tempTerrain){
					terrains.push(tempTerrain);
				}
			}
		}
		return terrains;
	}
	
	update(){}
	
	generationSpread(){}
}

var max_fire_spread = 100
class FireTerrain extends Terrain{
	constructor(x,y, duration=1){
		super("fire",x,y)
		this.danger = true;
		//duration of the fire
		this.duration = duration;
		//if the fire can spread
		this.spread = true;
		//amount of times the fire has spread
		this.spread_count = 0;
		// if(this.duration>1){
			// this.spread=true
		// }
		this.spread_chance = 30
		
	}

	update(){	
		if(this.duration<=0){
			let newTerrain = new Terrain('none', this.x, this.y)
			setTerrain(newTerrain)
			return;
		}
		//do not update upon spawning
		if(this.new_spawn){
			this.new_spawn=false
			return
		}
		if(this.spread){
			//spread to trees
			let adj = this.get_adjacent()
			for(let i=0; i<adj.length; i++){
				let tempTerrain = adj[i]
				if(tempTerrain.type=="tree" && Math.random()<(this.spread_chance/100)){
					let fire_duration = this.duration+(roll_range(-2,2));
					if(fire_duration<1){
						fire_duration=1
					}
					let newTerrain = new FireTerrain(tempTerrain.x, tempTerrain.y, fire_duration);
					newTerrain.spread_chance = Math.round(newTerrain.spread_chance*0.9)
					newTerrain.spread_count = this.spread_count + 1;
					if(newTerrain.spread_count > max_fire_spread){
						newTerrain.spread = false;
					}
					setTerrain(newTerrain);
				}
			}
		}
		this.duration = this.duration-1
	}
}

class TreeTerrain extends Terrain{
	constructor(x,y, create_river=true){
		super("tree",x,y)
		this.spreadOnce = false;
	}
	
	generationSpread(){
		if(!this.spreadOnce){
			let adj = this.get_adjacent()
			let spreadTimes = 0;
			for(let i=0; i<adj.length; i++){
				let tempTerrain = adj[i]
				if(tempTerrain.type != "tree"){
					if(roll([["yes",1],["no",10+spreadTimes*80]])=="yes"){
						spreadTimes++;
						//change terrain
						let newTerrain = new TreeTerrain(tempTerrain.x, tempTerrain.y);
						// newTerrain.icon = "T";
						newTerrain.spreadOnce = false;
						setTerrain(newTerrain);
					}
				}
			}
			this.spreadOnce = true;
		}
	}
}

class MtnTerrain extends Terrain{
	constructor(x,y, create_river=true){
		super("mtn",x,y)
		this.spreadOnce = false;
	}
	generationSpread(){
		if(!this.spreadOnce){
			let adj = this.get_adjacent()
			let spreadTimes = 0;
			for(let i=0; i<adj.length; i++){
				let tempTerrain = adj[i];
				if(tempTerrain.type != "mtn"){
					if(roll([["yes",1],["no",20+spreadTimes*10]])=="yes"){
						spreadTimes++;
						//change terrain
						let newTerrain = new MtnTerrain(tempTerrain.x, tempTerrain.y);
						// newTerrain.icon = "M";
						newTerrain.spreadOnce = false;
						setTerrain(newTerrain);
						// terrain[i][j].type = "mtn";
						// terrain[i][j].icon = "M"
						// terrain[i][j].spreadOnce = false;
						// terrain[i][j].draw();
					}
				}
			}
			this.spreadOnce = true;
			/*
			for(var i = this.x - 25;i <= this.x+25;i+=25){
				for(var j = this.y -25;j <= this.y+25;j+=25){
					
					if(terrain[i]){
						if(terrain[i][j]){
							if(terrain[i][j].type != "mtn" && terrain[i][j] != this){
								let spreadTimes = 0;
								if(roll([["yes",1],["no",20+spreadTimes*10]])=="yes"){
									spreadTimes++;
									//change terrain
									let newTerrain = new MtnTerrain(i, j);
									// newTerrain.icon = "M";
									newTerrain.spreadOnce = false;
									setTerrain(newTerrain);
									// terrain[i][j].type = "mtn";
									// terrain[i][j].icon = "M"
									// terrain[i][j].spreadOnce = false;
									// terrain[i][j].draw();
								}
								
							}
							this.spreadOnce = true;
						}
					}
					
				}
			}
			*/
		}
	}			
}

class WaterTerrain extends Terrain{
	constructor(x,y, create_river=true){
		super("water",x,y)
		this.danger = true;
		this.spreadOnce = false;
		this.riverSpawn = false;
		this.river = false;
		//if river will be generated from this
		if(create_river && roll([["yes",1],["no",5]]) == "yes"){
			this.riverSpawn = true;
			this.river = true
			riverSpawns.push(this);
		}		
	}
	
	generationSpread(){
		//spread water
		if(!this.spreadOnce){
			let adj = this.get_adjacent()
			let spreadTimes = 0;
			for(let i=0; i<adj.length; i++){
				let tempTerrain = adj[i]
				if(tempTerrain.type != "water"){
					if(roll([["yes",1],["no",8+spreadTimes]])=="yes"){
						spreadTimes++;
						//change terrain
						let newTerrain = new WaterTerrain(tempTerrain.x, tempTerrain.y, false);
						// newTerrain.icon = "W";
						newTerrain.spreadOnce = false;
						setTerrain(newTerrain);
						// terrain[i][j].type = "water";
						// terrain[i][j].icon = "💧"
						// terrain[i][j].spreadOnce = false;
						// terrain[i][j].draw();
					}
				}
			}
			this.spreadOnce = true;
			/*
			//look at the adjacent squares
			for(var i = this.x - 25;i <= this.x+25;i+=25){
				for(var j = this.y -25;j <= this.y+25;j+=25){
					
					if(terrain[i]){
						if(terrain[i][j]){
							//if the terrain is not a water type or itself
							if(terrain[i][j].type != "water" && terrain[i][j] != this){
								let spreadTimes = 0;
								//roll a chance to spread. chance to spread decreases the more its spread
								if(roll([["yes",1],["no",8+spreadTimes]])=="yes"){
									spreadTimes++;
									//change terrain
									let newTerrain = new WaterTerrain(i, j, false);
									// newTerrain.icon = "W";
									newTerrain.spreadOnce = false;
									setTerrain(newTerrain);
									// terrain[i][j].type = "water";
									// terrain[i][j].icon = "💧"
									// terrain[i][j].spreadOnce = false;
									// terrain[i][j].draw();
								}
							}
							this.spreadOnce = true;
						}
					}
					
				}
			}
			*/
		}
	}

}




















