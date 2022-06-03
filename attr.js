function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			return new Nenene(player);
			break;	
		case "cunny":
			return new Cunny(player);
			break;		
		case "cunny":
			return new Joshiraku(player);
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

class Joshiraku extends Attr{
	constructor(player){
		super("joshiraku", player);
		this.display=false;
		this.imgs = [
			'https://cdn.myanimelist.net/images/characters/7/173549.jpg',
			'https://cdn.myanimelist.net/images/characters/13/145959.jpg',
			'https://cdn.myanimelist.net/images/characters/13/149113.jpg',
			'https://cdn.myanimelist.net/images/characters/5/177655.jpg',
			'https://cdn.myanimelist.net/images/characters/6/177653.jpg',
		]
	}
	
	effect(state, data={}){
		switch(state){
			case "turnStart":
				let img = this.imgs[roll_range(0,this.imgs.length)]
				this.player.img = img;
				this.player.div.find('.charText').text(name)
				this.player.tblDiv.find('.info div:first-child b').text(name)
				break;
		}
	}
}

class Cunny extends Attr{
	constructor(player){
		super("cunny", player);
	}
	calc_bonuses(){
		this.moveSpeedB*=1.2;
	}
	effect(state, data={}){
		switch(state){
			case "opAware":
				let oP=data['opponent'];
				if (Math.random() < 0.05){
					let temp_charm = new Charm(this.player);
					temp_charm.level=2;
					temp_charm.icon = "😭"
					if(Math.random()<0.1){
						temp_charm.aggro = true;
						temp_charm.level=1;
						temp_charm.icon = "💢"
						temp_charm.display_name = "Correction"
					}
					oP.inflict_status_effect(temp_charm);
				}
				break;
		}
	}
}









