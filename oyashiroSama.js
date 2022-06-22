//hau au
function HAUAU(){
	players.forEach(function(tP){
		// let hinamizawa = new Lv1()
		let hinamizawa = new Hinamizawa(1)
		tP.inflict_status_effect(hinamizawa)
	});
}
var oyashiro_msg = [["runs away from Oyashiro-sama",25],["hears a distant HAU-AU",30],["trains herblore",5],["feels like they're being watched",5]]

var lvlup_data = [100,300,1000,1200,500]
class Hinamizawa extends StatusEffect{
	constructor(level){
		super("hinamizawa");
		this.icon = setEffIcon('./icons/lv1.png');
		this.duration=99999;
		this.level = level;
		this.rage = 0;		//points until the next level
		this.next_lv = lvlup_data[this.level-1] + Math.round(players.length/10)*20;	//points needed for next level
		this.display_name = "Hinamizawa Lv1"
		
		this.aggroBonus=0
		this.peaceBonus=0
		this.fightBonus=1
		this.dmgReductionB=1
		
		this.update_data();
	}

	stack_effect(eff){
		this.rage = this.rage + eff.level*this.next_lv*0.25
	}
	
	afflict(player){
		super.afflict(player)
		if(this.level>1){
			pushMessage(this.player,this.player.name +  " LEVEL "+this.level);
		}	}
	/*
	calc_bonuses(){
		switch(this.level){
			case 1:
				this.aggroB =20;
				break;
			case 2:
				this.aggroB =40;
				break;
			case 3:
				this.aggroB =50;
				this.peaceB =-10;
				this.fightBonus= 1.05;				
				break;
			case 4:
				this.aggroB = +100;
				this.peaceB = -40;
				this.fightBonus = 1.1;
				this.dmgReductionB = 1.1;				
				break;
			case 5:
				this.aggroB = 150;
				this.peaceB = -80;
				this.fightBonus = 1.2;
				this.dmgReductionB = 1.2;	
				break;
		}
		this.player.aggroB += this.aggroB
		this.player.peaceB += this.peaceB
		this.player.fightBonus *= this.fightBonus
		this.player.dmgReductionB *= this.dmgReductionB
	}*/
	
	update_data(){
		switch(this.level){
			case 1:
				this.aggroBonus =20;
				break;
			case 2:
				this.aggroBonus =40;
				break;
			case 3:
				this.aggroBonus =50;
				this.peaceBonus =-10;
				this.fightBonus= 1.05;				
				break;
			case 4:
				this.aggroBonus = +100;
				this.peaceBonus = -40;
				this.fightBonus = 1.1;
				this.dmgReductionB = 1.1;				
				break;
			case 5:
				this.aggroBonus = 150;
				this.peaceBonus = -80;
				this.fightBonus = 1.2;
				this.dmgReductionB = 1.2;	
				break;
		}		
	}
	
	itch(){
		this.player.health = this.player.health-(5+this.player.oobTurns);
		if(this.player.health<=0){
			this.player.death = "claws out their throat"		
		}
		else{
			this.player.statusMessage = "feels maggots under their skin"
		}
		this.player.resetPlannedAction();
		this.player.finishedAction;
	}
	
	level_up(){
		this.rage = 0
		if(this.level<5){
			this.level = this.level+1
			this.icon = setEffIcon('./icons/lv'+this.level+'.png');
			this.next_lv = lvlup_data[this.level-1] + Math.round(players.length/10)*10;
			this.display_name = "Hinamizawa Lv" + this.level
			this.update_data();
		}
		else{
			//apply berserk status
			let never = new Berserk(5,15);
			this.player.inflict_status_effect(never);			
		}
	}
	effect(state, data={}){
		let oP="";
		switch(state){
			case "turnStart":
				//passive increase
				this.rage = this.rage + 2 +this.level;
				break;
			/*
			case "surroundingCheck":
				if(this.level >=2){
					//randomly follow others
					if(this.player.awareOf.length >0 && Math.random()>0.95){
						let temp_charm = new Charm(this.player.awareOf[0], 1);
						temp_charm.duration = 3;
						if(this.level>=3){
							temp_charm.aggro=true;
						}
						temp_charm.follow_message = "stalks " + this.player.awareOf[0].name
						this.player.inflict_status_effect(temp_charm);
					}		
				}
				break;
			*/
			case "planAction":
				if(this.level>=4){
					//self damage
					//only activates with more than 5 players or out of bounds
					if(this.player.oobTurns>3 || players.length>5){
						if(5+3*this.player.oobTurns>roll_range(0,100)){
							this.player.setPlannedAction("itch", 15)
						}
					}
					//attack follower
					if(this.player.followers.length>0){
						let tP = this.player
						tP.followers.forEach(function(oP){
							if(tP.inRangeOfPlayer(oP)){
								if(tP.setPlannedAction("fight", 8)){
									log_message(tP.name +" attacks follower " + oP.name)
									tP.plannedTarget = oP
								}
							}
						});				
					}
				}
				break;
			case "takeDmg":
				//increase from taking damage
				this.rage = this.rage + data["damage"]*0.25
				break;	
			case "attack":
				//increase from being attacked
				if(data["counter"]){
					this.rage = this.rage + 10
				}
				else if(this.level >=3){			
					this.rage = this.rage + 20
				}
				break;	
			case "dealDmg":
				if(this.level >=3 )
					this.rage = this.rage + data["damage"]*0.6
				break;
			case "win":
				//increase from killing
				this.rage = this.rage + 15 + this.level*5
				break;	
			case "forage":
				//increase from forage fail
				if(this.player.lastAction == "forage fail")
					this.rage = this.rage + 10
				if(this.level>=2 && this.level<=4){
					//increase forage yields
					if(this.player.lastAction == "forage success"){
						this.player.energy += roll_range(5,10)
						this.player.health += roll_range(2,8);
						this.player.statusMessage = "obsessively forages for more food";
					}
				}
				break;
			case "itch":
				this.itch()
				break;
			case "turnEnd":
				//increase from out of bounds
				if(this.player.oobTurns>0){
					this.rage = this.rage + Math.pow(1.5, this.player.oobTurns)*2
				}	
				//increase from action interrupted
				if(this.player.interrupted){
					this.rage = this.rage + 5
				}
				//increase from not sleeping
				this.rage = this.rage + Math.round(this.player.lastSlept/(24-(this.level*3)))

				if(this.level >=2){
					//increase from being alone
					if(this.player.awareOf.length == 0){
						this.rage = this.rage + 10
					}
					//increase from being followed
					if(this.player.followers.length>0){
						this.rage = this.rage + 5
					}
				}		
				//hear the voice of oyashiro sama
				if(this.level>=4){
					if(this.player.lastAction == "moving" && Math.random()>0.9){
						this.rage = this.rage + 20;
						this.player.statusMessage = roll(oyashiro_msg);
						log_message('oyashiro')
					}
				}
				if(this.level<=2){
					//peace reduction
					if(this.player.peaceBonus>50)
						this.rage = this.rage - Math.round((this.player.peaceBonus-50)/20)
					//reduce from not fighting
					if(this.player.lastFight>5)
						this.rage = this.rage - 0.5
				}
				//level up
				if(this.rage>=this.next_lv){
					this.level_up()
				}
				if(this.rage<=0){
					this.rage = 0
				}
				break;
			default:
				super.effect(state, data);
				break;
		}
	}
	
	show_info(){
		let status_info=
		"<div class='info'>"+
			"<b style='font-size:18px'>"+this.icon+" "+this.display_name+"</b><br>"+
			"<span style='font-size:12px'>"+this.player.name+"</span><br>"+
			"<span><b>Level:</b>"+this.level+"</span><br>"+
			"<span><b>Next level:</b>"+roundDec((this.rage/this.next_lv)*100)+"%</span><br>"
		
		/*
		if(this.aggroBonus!=0){
			status_info = status_info + "<span><b>Aggro Bonus:</b>"+this.aggroBonus+"</span><br>"
		}
		if(this.peaceBonus!=0){
			status_info = status_info + "<span><b>Peace Bonus:</b>"+this.peaceBonus+"</span><br>"
		}
		if(this.fightBonus!=1){
			status_info = status_info + "<span><b>Damage Bonus:x</b>"+this.fightBonus+"</span><br>"
		}
		if(this.dmgReductionB!=1){
			status_info = status_info + "<span><b>Damage Taken:x</b>"+this.dmgReductionB+"</span><br>"
		}
		*/
		status_info = status_info + this.stat_html()+"</div>"
		
		$('#extra_info_container').html(status_info);
	}	
	/*
	all levels:
	build rage from killing and being out of bounds
	gain a small amount every day
	aggression increases with every level

	lv 1: annoyance
	build rage from taking damage, being attacked, not sleeping and inconvenienced 
	rage reduced by peace levels and not fighting

	lv 2: paranoia
	build rage from being followed and being alone
	all previous effects apply
	increased forage yields
	randomly follow players

	lv 3: anger
	build rage from attacking and dealing dmg
	deal more damage
	randomly stalk and attack players
	rage cannot be reduced
	all previous effects apply

	lv 4: violence
	attack follower
	occasionally hear oyashiro sama
	occasional self damage
	greatly increased aggression
	all previous effects apply

	lv 5: insanity
	increase aggro and dmg based on rage
	get berserker status when rage maxes out
	no longer get extra forage yields
	*/	
	stat_html(){
		// let html = "<span><b>Next level:</b>"+roundDec(this.rage)+"/"+(this.next_lv)+"</span><br>"
		let html = super.stat_html()+
			"<span class='desc'>"
		switch(this.level){
			case 1:
				html = html+
				"<span><b>Irritable</b></span></br>"
				break;
			case 2:
				html = html+
				"<span><b>Paranoid</b></span></br>"
				break;
			case 3:
				html = html+
				"<span><b>Anger</b></span></br>"
				break;
			case 4:
				html = html+
				"<span><b>Violent</b></span></br>"
				break;
			case 5:
				html = html+
				"<span><b>LEVEL 5</b></span></br>"+
				"<span>Occasionally goes berserk</span></br>"
				break;

		}
		html = html + "</span>"
		return html;
	}	
}





