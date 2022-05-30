function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			return new Nenene(player);
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