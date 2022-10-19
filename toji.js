class Toji extends Attr{
	constructor(player){
		super("toji", player);
		this.has_info = true;
		
		this.powered = false;
		this.max_power_duration = 50;
		this.power_duration = 0;
		this.max_power = 30;
		this.power = 0;
		
		this.on_cooldown = false;		
		this.max_cooldown = 12;
		this.cooldown_timer = 0;
		
		this.dashed = false;
		this.attack_dodged = false;
		
		// this.aggroBonus=2000		
	}
	
	power_up(){
		this.display_name = "Toji⚪"
		this.powered = true;
		this.power = this.max_power;
		this.power_duration = this.max_power_duration;
		
		this.sightBonus = 5;
		this.visibilityB = 30;		
		this.fightBonus = 1.1;
		this.dmgReductionB = 0.6;		
		this.intimidationBonus=10;
	}
	
	power_down(){
		this.display_name = "Toji⚫"
		this.powered = false;
		this.power = 0;
		this.on_cooldown = true;
		this.cooldown_timer = this.max_cooldown;
		
		this.sightBonus = 0;
		this.visibilityB = 0;		
		this.fightBonus = 0.9
		this.moveSpeedB = 0.9;
		this.dmgReductionB = 1.05;
		this.intimidationBonus=0;
	}
	
	effect(state, data={}){		
		switch(state){
			case "turnStart":
				if(this.on_cooldown){
					if(this.cooldown_timer<=0){
						this.display_name = "Toji"
						this.on_cooldown = false;
						this.fightBonus = 1;
						this.moveSpeedB = 1
						this.dmgReductionB = 1;
					}
					this.cooldown_timer--;
				}
				else if(this.powered){
					this.dashed = false;
					this.attack_dodged = false;
					if(this.power<=0||this.power_duration<=0)
						this.power_down();
					this.power_duration--;					
				}
				break;
			case "surroundingCheck":
				//increase attack range if able to dash atatck
				if(this.power<TOJI_DASH_ATTACK_COST)
					return
				if(!this.player.incapacitated)
					this.player.inRangeOf = this.player.nearbyPlayers(this.player.fightRange + this.player.fightRangeB + TOJI_DASH_DIST);
				if(this.player.awareOf.length>0)
					this.player.fight_target = this.player.choose_fight_target();	
				break;
			case "planAction":
				//power up
				if(!this.powered && !this.on_cooldown){
					if(this.player.danger_score >= roll_range(-50,250))
					// if(this.player.danger_score >= roll_range(-100,0))
						this.player.setPlannedAction("tojiPowerup", 6, TojiPowerupAction,{'attr':this})
					if(this.player.lastActionState=="attacked"||this.player.lastActionState=="fighting")
						this.player.setPlannedAction("tojiPowerup", 8, TojiPowerupAction,{'attr':this})
					break;
				}
				else if(this.powered){
					if(this.player.plannedAction=="fight" && this.power>=TOJI_DASH_ATTACK_COST){						
						//check if chosen opponent is out of regular fight range
						if(playerDist(this.player, this.player.plannedActionData.target)> this.player.fightRange + this.player.fightRangeB){
							this.player.plannedAction = "tojiDashAttack";
							this.player.plannedActionClass = TojiDashAttackAction;
							this.player.plannedActionData.attr = this;
						}
					}
					else if(this.power>=TOJI_SUPER_DASH_COST)
						this.player.setPlannedAction("tojiDash", 1, TojiDashAction,{'attr':this})				
				}					
				break;
			case "doActionAfter":
				console.log(this.dashed)
				if(!this.dashed)
					return
				switch(this.player.lastActionState){						
					case "moving":
						this.player.statusMessage = "dashes"
						break;						
					case "following":
						this.player.statusMessage = "dashes after " + data.action.target.name;
						break;
					case "terrain escape":
					case "player escape":
						this.player.statusMessage = "dashes to safety"
						break;
				}
				this.player.lastActionState = "toji dash"
				this.dashed = false;
				break;
			case "attack":
				if(this.power>=1)
					this.power-=1;
				break;
			case "defend":
				if(!this.powered)
					return
				log_message('toji defend')
				if(this.power<TOJI_DODGE_COST){
					this.power-=1;
					return
				}
				//dodge based on hp left
				let dodge_chance = 60;
				dodge_chance *= (1.5-(this.player.health/this.player.maxHealth))
				if(data.counter)
					dodge_chance+=25
				if(roll_range(1,100)<=dodge_chance){
					log_message('dodge')
					this.dodge(data.opponent, data.fightMsg)	
				}								
				break;
			case "fightEnd":
				if(this.attack_dodged)
					this.player.statusMessage = "dodges "+oP.name+" attack";
				this.attack_dodged = false;
				this.player.fight_back = true;
				break;
		}
		if(this.powered && this.power<=0)
			this.power_down()
	}
	
	effect_calc(state, x, data={}){
		switch(state){
			case "dmgCalcOut":
				log_message('toji dmg out')
				if(this.attack_dodged){
					x=0;
				}
				break;
			case "dmgCalcIn":
				log_message('toji dmg in')
				if(this.attack_dodged){
					x=0;
				}		
				break;
			case "newStatus":
				log_message('toji dodge status effect')
				if(this.attack_dodged)
					x=false;		
				break;
			case "moveDistCalc":
				if(!this.powered)
					return x
				if(this.power<TOJI_DASH_COST)
					return x;
				if(!(this.player.currentAction instanceof MoveAction))
					return x
				// if(this.player.currentAction instanceof TojiDashAction)
					// return x		
				if(this.player.currentAction instanceof TojiDashAction){
					return TOJI_SUPER_DASH_DIST
				}			
				if(0.6<Math.random()){
					this.dashed = true;
					x = TOJI_DASH_DIST
					this.power -= TOJI_DASH_COST
					if(this.power<=0)
						this.power_down();
				}
				break;
		}
		return x
	}
	
	dodge(oP, fightMsg){
		let target = getRandomCoords('terrain')
		this.player.moveToTarget(target[0] , target[1], TOJI_DASH_DIST);
		if(fightMsg.events)
			fightMsg.events.push(this.player.name + ' dashes away from '+oP.name + "'s attack")
		this.player.statusMessage = "dodges "+oP.name+" attack";
		this.player.fight_back = false;
		this.player.currentAction.turn_complete = true;
		this.attack_dodged = true;
		this.power -= TOJI_DODGE_COST
		if(this.power<=0)
			this.power_down();	
	}
	
	stat_html(){
		let html= super.stat_html()
		if(this.on_cooldown)
			html+="<span><b>Cooldown:</b>"+this.cooldown_timer+"</span><br>"
		else if(this.powered){
			html+=
			"<span><b>Powered Up</b></span><br>"+
			"<span><b>Power:</b>"+this.power+"</span><br>"+
			"<span><b>Duration:</b>"+this.power_duration+"</span><br>"	
		}
		else
			html+="<span><b>Toji power stand by</b></span>"
		return html;
	}
}

class TojiPowerupAction extends Action{
	constructor(player, data){
		super("toji powerup", player)
		this.attr = data.attr;
	}	
	// attacked(oP, fightMsg){		
		// if(this.turn_complete){
			// this.player.fight_back = true;
			// return
		// }
		// super.attacked(oP, fightMsg)
	// }
	perform(){
		// this.attr.powerup()
		this.attr.powered = true;
		this.player.statusMessage = "Powers up"
		this.player.lastActionState = "toji power up"
		this.attr.power_up()
	}
}

var TOJI_DASH_DIST = 100;
var TOJI_SUPER_DASH_DIST = 200;
var TOJI_DASH_COST = 2;
var TOJI_SUPER_DASH_COST = TOJI_DASH_COST+1;
var TOJI_DASH_ATTACK_COST = 3;
var TOJI_DODGE_COST = TOJI_DASH_COST*2

class TojiDashAction extends MoveAction{
	constructor(player, data){
		super(player,data);
		this.name = "toji super dash"
		this.attr = data.attr		
	}	

	perform(){
		if(this.attr.power>=TOJI_SUPER_DASH_COST){
			super.perform()
			this.player.statusMessage = "on the dash"
			this.player.lastActionState = "toji dash"
			this.attr.power -= TOJI_SUPER_DASH_COST
			if(this.attr.power<=0)
				this.attr.power_down();
		}
		else{
			this.player.statusMessage = "does not have enough power to dash"
			this.player.lastActionState = "toji dash fail"	
		}
	}
	turn_end(){
		let distX = this.targetX - this.player.x;
		let distY = this.targetY - this.player.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		if(this.attr.power<TOJI_SUPER_DASH_COST)
			this.complete = true;
		if(dist<TOJI_SUPER_DASH_DIST/2)
			this.complete = true;
		super.turn_end()
	}
	
}

class TojiDashAttackAction extends FightAction{
	constructor(player, data){		
		super(player,data);
		this.name = "toji dash attack"
		this.attr = data.attr
	}
	perform(){
		//dash to target if out of range
		let dist = playerDist(this.player, this.target);
		if(dist>this.player.fightRange + this.player.fightRangeB){
			if(this.attr.power>=TOJI_DASH_ATTACK_COST){
				this.player.moveToTarget(this.target.x,this.target.y, TOJI_DASH_DIST)
				this.attr.power-=TOJI_DASH_ATTACK_COST
				if(this.attr.power<=0)
					this.attr.power_down()
			}
			else{
				this.player.statusMessage = "does not have enough power to dash to "+ this.target.name
				this.player.lastActionState = "fighting range fail";
				return;
			}				
		}				
		super.perform();
		if(this.attr.power<=0)
			this.attr.power_down()
	}
}





