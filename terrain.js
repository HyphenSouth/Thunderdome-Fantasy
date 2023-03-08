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

function printTerrain(){
	for(let x=0; x<terrain.length; x+=25){
		let t = ''
		for(let y=0; y<terrain.length; y+=25){
			if(terrain[y][x])
				t+=terrain[y][x].type[0];
			else
				t+='.';
		}
		console.log(t);
	}
}

function setTerrain(newTerrain, draw_none=true){
	// let roundX = Math.round(x/25)*25;
	// let roundY = Math.round(y/25)*25;	
	
	let roundX = Math.round(newTerrain.x/25)*25;
	let roundY = Math.round(newTerrain.y/25)*25;
	if(!terrain[roundX]){
		terrain[roundX]=[]
	}
	terrain[roundX][roundY]=newTerrain;
	if(draw_none || terrain.type!='none')
		terrain[roundX][roundY].draw();
	// log_message('set ' + newTerrain.type+' at ' + roundX + ','+roundY);
}

//get the terrain object at coords
function getTerrain(x,y){
	if(!generated){
		return genericTerrain;
	}
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	// let tempTerrain=genericTerrain;
	let tempTerrain = "";
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			tempTerrain= terrain[roundX][roundY];
		}
	}
	// if(tempTerrain=='')
		// return genericTerrain;
	return tempTerrain;
}

//get the type of terrain at coords
function getTerrainType(x,y){
	let roundX = Math.round(x/25)*25;
	let roundY = Math.round(y/25)*25;
	if(terrain[roundX]){
		if(terrain[roundX][roundY]){
			return terrain[roundX][roundY].type;
		} else {
			return "none";
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
			//generate volcano
			if(volcano_count<max_volcanos && Math.abs(x - mapSize/2)<250 && Math.abs(y - mapSize/2)<250 && Math.random()<0.4){
				newTerrain = new Volcano(x, y)
				volcano_count++;
			}
			else{
				newTerrain = new MtnTerrain(x, y)
			}			
			break;
		case "none":
			newTerrain = new Terrain('none', x, y);
			break;
		case "rand":
			//generate random terrain type
			// let rand_type = roll([["tree",100],["mtn",5],["none",250],["water",5]]);
			let rand_type = roll([["tree",120],["mtn",8],["none",250],["water",5]]);
			newTerrain = create_terrain(rand_type, x, y)
			break;
		default:
			newTerrain = new Terrain('none', x, y);
			break;
	}
	return newTerrain;
}

class CustomMap{
	constructor(name){
		this.name = name;
	}
	end_update(){
		terrainUpdate();
	}	
	start_update(){}
	game_start(){}
	forageOdds(player, item_type, odds){
		return odds;
	}
	
}

class Terrain {
	constructor(type,x,y){
		this.x = Math.round(x/25)*25;
		this.y = Math.round(y/25)*25;
		this.type=type;
		//0: no danger
		//1: will not move to terrain
		//2: move away from terrain
		this.danger = 0;
		
		this.icon = "❓";
		if(this.type in terrain_icons){
			this.icon = terrain_icons[this.type];
		}
		this.new_spawn=true;
		
		this.spreadOnce = false;
		//types of terrain that can be spread to
		this.spreadTypes = []
		//base spread chance and decrease with spreadtimes
		this.spreadProb = [1,0]

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

	calc_bonuses(player){}
	turn_end_effects(player){}
	forageOdds(player, item_type, odds){
		if(customMap)
			return customMap.forageOdds(player, item_type, odds);
		return odds;
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
	
	//terrain created when spreading
	create_spread_terrain(x,y){
		let newTerrain = new Terrain(this.type, x,y);
		newTerrain.spreadOnce = false;
		return newTerrain;
	}
	
	generationSpread(){
		if(!this.spreadOnce){
			let adj = this.get_adjacent()
			let spreadTimes = 0;
			for(let i=0; i<adj.length; i++){
				let tempTerrain = adj[i]
				if(this.spreadTypes.includes(tempTerrain.type)){
					// if(roll([["no",this.spreadProb[0]+spreadTimes*this.spreadProb[1]],["yes",1]])=="yes"){
					if(roll([["yes",1],["no",this.spreadProb[0]+spreadTimes*this.spreadProb[1]]])=="yes"){
						spreadTimes++;
						//change terrain
						setTerrain(this.create_spread_terrain(tempTerrain.x, tempTerrain.y));
					}
				}
			}
			this.spreadOnce = true;
		}
	}
	
	update(){}
}
//generic placeholder terrain when no terrains are generated
var genericTerrain = new Terrain("none",-1,-1)

class TreeTerrain extends Terrain{
	constructor(x,y){
		super("tree",x,y)
		//types of terrain that can be spread to
		this.spreadTypes = ["none"]
		//base spread chance and decrease with spreadtimes
		this.spreadProb = [10,40]
		// this.spreadProb = [0,0]
	}
	
	calc_bonuses(player){
		player.sightRangeB -= 50;
		player.fightRangeB -= 4;
		player.visibilityB -= 10;
	}
	
	create_spread_terrain(x,y){
		let newTerrain = new TreeTerrain(x,y);
		// newTerrain.icon = "T";
		newTerrain.spreadOnce = false;
		return newTerrain;
	}
}

class MtnTerrain extends Terrain{
	constructor(x,y){
		super("mtn",x,y)
		//types of terrain that can be spread to
		this.spreadTypes = ["none", "tree","water"]
		//base spread chance and decrease with spreadtimes
		this.spreadProb = [3,15]
	}
	
	calc_bonuses(player){
		player.sightRangeB += 100;
	}
	
	turn_end_effects(player){
		if(roll([["die",1],["live",2000]]) == "die" && terrainDeath > 0 ){
		// if(roll([["die",1],["live",0]]) == "die" && terrainDeath > 0 ){
			player.health = 0;
			player.death = "Fell off a cliff";
			terrainDeath--;
		}
	}	
	create_spread_terrain(x,y){
		let newTerrain = new MtnTerrain(x,y);
		// newTerrain.icon = "T";
		newTerrain.spreadOnce = false;
		return newTerrain;
	}	
}

var volcano_count = 0;
var max_volcanos = 1;
class Volcano extends MtnTerrain{
	constructor(x,y){
		super(x,y)
		this.icon = "🗻"
		this.danger = 1;
		this.eruption = roll_range(100,300)
		this.erupted = false;
	}
	
	erupt(){
		this.erupted=true
		
	}
	
	update(){	
		//extinguish
		if(this.eruption<=0 && !this.erupted){
			this.erupt();
			return;
		}
		this.eruption = this.eruption-1
	}		
}

var max_rivers = 5;
class WaterTerrain extends Terrain{
	constructor(x,y, create_river=true){
		super("water",x,y)
		this.danger = 1;
		//types of terrain that can be spread to
		this.spreadTypes = ["none", "tree"]
		//base spread chance and decrease with spreadtimes
		this.spreadProb = [4,1]
		
		this.riverSpawn = false;
		this.river = false;
		//if river will be generated from this
		if(create_river && roll([["yes",1],["no",4]]) == "yes"){
			this.riverSpawn = true;
			this.river = true
			riverSpawns.push(this);
		}		
	}
	
	calc_bonuses(player){
		player.fightRangeB = 0;
		player.moveSpeedB *= 0.5;
	}
	
	turn_end_effects(player){
		if(player.lastAction=="moving"){
			player.lastAction = "swimming";
			player.statusMessage = "swimming";
		}

	}
	
	create_spread_terrain(x,y){
		let newTerrain = new WaterTerrain(x, y, false);
		// newTerrain.icon = "W";
		newTerrain.spreadOnce = false;
		return newTerrain;
	}	
}

var max_fire_spread = 20
class FireTerrain extends Terrain{
	constructor(x,y, duration=1){
		super("fire",x,y)
		this.danger = 2;
		//duration of the fire
		this.duration = duration;
		//if the fire can spread
		this.spread = true;
		//amount of times the fire has spread
		this.spread_count = 0;
		// if(this.duration>1){
			// this.spread=true
		// }
		this.spread_chance = 50
		
	}
	
	turn_end_effects(player){
		player.inflict_status_effect(new Burn(2, roll_range(2,4),""));
	}
	
	update(){	
		//extinguish
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
					newTerrain.spread_chance = Math.round(this.spread_chance*0.9)
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


















