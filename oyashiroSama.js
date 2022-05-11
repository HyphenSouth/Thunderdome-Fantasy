class Hinamizawa extends StatusEffect{
	constructor(level){
		super("hinamizawa"+level);
		this.icon="💊";
		this.duration=99999;
		this.level = level;
		this.rage = 0;
		this.next_lv = 0;
	}

	stack_effect(eff){
		this.rage = this.rage + eff.level*10
	}
	
	level_up(){}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "turnStart":
				this.rage = this.rage +1;
				break;
			case "turnEnd":
				//level up
				if(this.rage>=this.next_lv){
					level_up()
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	effect_html(){
		let html = "<span><b>Next level:</b>"+roundDec(this.rage)+"/"+(this.next_lv)+"</span><br>"
		
		return html;
	}	
}

class Lv1 extends Hinamizawa{
	constructor(){
		super(1);
		this.next_lv = 200;
	}

	stack_effect(eff){
		this.rage = this.rage + eff.level*10
	}
	
	level_up(){
		/*
		let temp_status = new Lv2()
		this.player.inflict_status_effect(temp_status)
		this.wear_off()
		*/
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "turnStart":
				super.effect("turnStart")
				
				break;
			case "turnEnd":
				super.effect("turnEnd")

				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	effect_html(){
		let html = "<span><b>Next level:</b>"+roundDec(this.rage)+"/"+(this.next_lv)+"</span><br>"
		
		return html;
	}	
}
class Lv2 extends Hinamizawa{}
class Lv3 extends Hinamizawa{}
class Lv4 extends Hinamizawa{}
class Lv5 extends Hinamizawa{}









