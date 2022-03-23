class Char {
	constructor(name,img,x,y){
        //_______________general data_______________
		this.name = name;
		this.img = img;
		//player location
		this.x = x;
		this.y = y;
		//id used for display
        this.id = players.length;
        
        //_______________attributes_______________
        //types of the character
		this.attr=[];
        //Modifiers
		this.moral = roll([['Chaotic',1],['Neutral',2],['Lawful',1]]);
		this.personality = rollSpecialP(this.name);
		this.personality = roll([['Evil',1],['Neutral',2],['Good',1]]);
        //roll([['Evil',1],['Neutral',2],['Good',1]])
		moralNum[this.moral]++;
		personalityNum[this.personality]++;
        
        //_______________character condition_______________
        //health
		this.health = rollSpecialH(this.personality);
		//energy
		this.energy = 100;
		this.maxEnergy = 100;
		//stamina
		this.stamina = 100;	
        this.status_effects = []
        
        
        //_______________stats_______________
        //combat stats. B stands for bonus
		//how far they can see
		this.sightRange = 200;
		this.sightRangeB = 0;
		//how far they can attack
		this.fightRange = 24;
		this.fightRangeB = 0;
		//damage dealt
		this.fightDmg = 25;
		this.fightDmgB = 1.00;
        //peacefulness
        this.aggroB = 0;
        this.peaceB = 0;
		//how visible they are
		this.visibility = 100;
        this.moveSpeed = mapSize / 40;        

        
        //_______________kills_______________
        //number of kills
		this.kills = 0;
		//experience
		this.killExp = 1.1;
		this.exp = 0;
        
        
        //_______________actions_______________
		//the current actions
		this.currentAction = {};
        //the action performed in the previous turn
        //used to plan current action
        this.lastAction="";
        this.plannedAction="";

        //the priority of current action
        //0   : no action
        //1-3 : regular actions
        //4-6 : self serving actions
        //7-9 : mind controlling actions
        //10+ : physically disabling actions
        this.actionPriority = 0;
        
        
        //_______________text_______________
        //action message to be displayed
        this.statusMessage = "";
		//if their current action is complete
		this.finishedAction = true;

        
        //_______________surrounding players_______________
		//players they are aware of
		this.awareOf = [];
        this.inRangeOf = [];
        
        //_______________inventory_______________
		this.weapon = "";
		this.offhand = "";

        //unused
		this.alliance = {};
		this.opinions = [];
		this.recentlySeen = [];
        this.goal = "";

	}
	draw() {
		let charDiv = $('#char_' + this.id);
		if(!charDiv.length){
			$('#players').append("<div id='char_" + this.id + "' class='char'><div class='charName'>" + this.name + "<div class='charWeap'></div></div><div class='healthBar' style='margin-bottom:-10px'></div><div class='energyBar' style='margin-bottom:-10px'></div></div>");
			charDiv = $('#char_' + this.id);
			charDiv.css('background-image',"url(" + this.img + ")");
			$('#table').append("<div class='container alive' id='tbl_" + this.id + "'><img src='" + this.img + "'></img><div style='position:absolute;width:50px;height:50px;z-index:1;top:0;left:0'><div class='healthBar'></div><div class='energyBar'></div><div class='kills'></div></div><div class='info'><div>" + this.moral.substring(0,1) + this.personality.substring(0,1) + " <b>" + this.name + "</b><span class='weapon'></span></div><div class='status'></div></div></div>");
			this.div = charDiv;
		} 
		//charDiv.css('left',this.x / 1000 * .95 * $('#map').width() - iconSize/2);
		//charDiv.css('top',this.y / 1000 * .95 * $('#map').height() - iconSize/2);
		charDiv.css({transform:"translate(" + (this.x / mapSize * $('#map').width() - iconSize/2) + "px," + (this.y / mapSize *  $('#map').height() - iconSize/2) + "px)"},function(){
		});
	}
    //calculate bonuses for combat
	calc_bonuses(){
		this.sightRangeB = 0;
		this.fightRangeB = 0;
		this.fightDmgB = 1;
        this.aggroB=0
        this.peaceB=0
        //apply weapon bonuses
		if(this.weapon){
            this.weapon.calc_bonuses();
		}
        //apply experience bonuses
		this.fightDmgB *= Math.pow(this.killExp,this.exp/100);
        //apply terrain bonuses
		switch(terrainCheck(this.x,this.y)){
            //mountain increases sight
			case "m":
				this.sightRangeB += 100;
				break;
			case "t":
				this.sightRangeB -= 50;
				this.fightRangeB -= 4;
				this.visibility
				break;
			case "w":
				this.fightRangeB = 0;
				break;
			default:
				break;
		} 
	}
    //apply effects to self
    inv_effects(state, wep_data={}, offhand_data={}){
        if(this.weapon){
            this.weapon.self_effect(state, wep_data)
        }
        if(this.offhand){
            if(this.offhand_data){
                this.offhand.self_effect(state, offhand_data)
            }
            else{
                this.offhand.self_effect(state, wep_data)
            }
        }
    }
    //apply effects to others
    inv_effects_other(state, oP, wep_data={}, offhand_data={}){
        if(this.weapon){
            this.weapon.others_effect(state, oP, wep_data)
        }
        if(this.offhand){
            if(this.offhand_data){
                this.offhand.others_effect(state, oP,offhand_data)
            }
            else{
                this.offhand.others_effect(state, oP, wep_data)
            }
        }
    }
    //plan the next action
    /*
    calculate bonuses
    apply inventory effects
    choose an action
    */
    setPlannedAction(action, actionPriority){
        if(actionPriority>this.actionPriority){
            log_message(this.name +"'s "+ this.plannedAction +" replaced with " +action+ " " +actionPriority);
            this.actionPriority = actionPriority;
            this.plannedAction = action;
            this.currentAction = {};
            return true;
        }
        log_message(this.name +"'s "+ this.plannedAction +" cannot be replaced with " +action);
        return false;
    }
    resetPlannedAction(){
        this.actionPriority=0;
        this.plannedAction="";
        //clear current actions
		this.currentAction = {};
    }
	planAction(){
        //continue with current action if there is one
        if(this.currentAction.name){
            log_message(this.name + " continues with " + this.currentAction.name+" "+this.actionPriority);
			this.plannedAction = this.currentAction.name;
        }
        //calculate bonuses
		this.calc_bonuses();
     
        //awareness check      
        //if previously sleeping or trapped, clear aware and range list
		if(this.lastAction == 'sleeping' || this.lastAction == 'trapped'){
			this.awareOf = [];
			this.inRangeOf = [];
		} 
        //get opponents that are in sight and in range
        else {
			//Opponents in sight
			this.awareOf = awareOfCheck(this);
			//Opponents in range
			this.inRangeOf = inRangeOfCheck(this);
		}
        
        //weapon check
        this.inv_effects("planning")
        let temp_this=this;
        this.inRangeOf.forEach(function(oP,index){ 
            oP.inv_effects_other("in range", temp_this);
        });
        
        //plan next action
        /*
            low health/energy and alone: forage
            another action planned: continue action
            choose options:
                move, fight, sleep
        */        
		// if(!this.plannedAction){

        //forage if energy is low, health is low, and is not aware of others, and not in water
		if((this.energy < Math.random()*25 + 25 || (Math.pow(100 - this.health,2) > Math.random() * 2500+ 2500 && !this.awareOf.length)) && terrainCheck(this.x,this.y) != "w"){
            this.setPlannedAction("forage",2);
		} 
        // continue current action if there is one
        // else if(this.currentAction.name){
		// this.plannedAction = this.currentAction.name;
		// }

        let options = [];
        //move 
		options.push(["move",100]);
        //fight if players in range
		if(this.inRangeOf.length > 0)
			options.push(["fight",100 + (this.aggroB - this.peaceB)]);
        //follow
        // if(this.awareOf.length > 0)
			// options.push(["follow",100]);
        //if it is night add sleep as an option
		if((hour >= 22 || hour < 5) && this.lastAction != "awaken" && terrainCheck(this.x,this.y) != "w")
			options.push(["sleep",100]);
        
        //choose option
        let o = roll(options);
		if(o == "fight"){
            //set target to the first player in range
            if(this.setPlannedAction("fight",2)){
    			this.plannedTarget = this.inRangeOf[0];       
                log_message(this.name + " targets "+this.plannedTarget.name)
                if(this.plannedTarget.setPlannedAction("attacked", 2)){
                    log_message(this.plannedTarget.name + " action set to attacked");
                }                    
            }
		}
        else{
            this.setPlannedAction(o, 1)
        }
                
        if(this.plannedAction == "follow"){
            //set target to the first player in range
			this.plannedTarget = this.awareOf[0];
		}
        log_message(this.name+" plans to "+ this.plannedAction)
	}
    
    //perform action
    //called by action in main
	doAction(){
		//removing red fighting border
        this.div.removeClass("fighting");
        //perform planned action
		if(this.health > 0 && !this.finishedAction){
			//console.log(this.name + " " + this.plannedAction);
			switch(this.plannedAction){
				case "forage":
					this.forage();
					break;
				case "move":
					this.move();
					break;
				case "fight":
					this.fight();
					break;                    
				case "sleep":
					this.sleep();
					break;
				case "trapped":
					this.escapeTrap();
					break;
				default:
					//console.log(this.name + " has no planned action");
                    this.resetPlannedAction();
					break;
			}
		}
        //toggle class for the last action
		if(this.lastAction == 'sleeping'){
			this.div.find('.charName').addClass('sleep');
		} else {
			this.div.find('.charName').removeClass('sleep');
		}
		if(this.lastAction == 'try escape'){
			this.div.find('.charName').addClass('trapped');
		} else {
			this.div.find('.charName').removeClass('trapped');
		}
        
        //action completed
		this.finishedAction = true;
	}
    
    //action functions
    //attempt to escape trap
	escapeTrap(){
		if (Math.floor(Math.random() * 10) > 8){
            log_message(this.name + " escapes");
			this.statusMessage = "escaped a trap";
			this.lastAction = "escapeS";
			this.resetPlannedAction();
		} else {
			this.energy -= 10;
			this.health -= Math.floor(Math.random() * 5);
			this.lastAction = "escapeF";
			this.statusMessage = "tried escape a trap";
            log_message(this.name + " fails to escape");
			if(this.health <= 0) 
				this.death = "died escaping a trap";
		};
	}
    //fight
	fight(){
        log_message(this.name + " fights");
        //calculate bonuses
		this.calc_bonuses();
        //add red fighting border
		this.div.addClass("fighting");
        //fight planned target
		if(this.plannedTarget){
            if(this.plannedTarget.health>0){
                this.lastAction = "fighting";
                let oP = this.plannedTarget;
                oP.calc_bonuses();
                //calculate damage for both fighters
                fight_target(this,oP);
            }
            //if target is already dead
            else{
                this.statusMessage = "attacks the corpse of " + this.plannedTarget.name;
            }
		}
        else{
            this.lastAction = "fighting";
            this.statusMessage = this.name + " looks for a reason to fight";
        }
		this.energy -= 20;
		if(this.energy < 0){
			//this.death = "exhausted to death from fighting";
			//this.die();
		}
        //clear target and actions
		this.plannedTarget = "";
		this.resetPlannedAction();
	}

    //forage
	forage(){
        //if foraging just started, set current action to foraging and set turns
        
		if(this.currentAction.name != "forage"){
            log_message(this.name + " starts foraging");
			this.currentAction = {};
			this.currentAction.name = "forage";
			this.currentAction.turnsLeft = 2;
		}
        //lose energy and stamina
		this.currentAction.turnsLeft--;
		this.energy -= 5;
		this.stamina -= 2.5;
        
		this.lastAction = "foraging";
		this.statusMessage = "foraging";
        //once foraging is done
        //get loot
		if(this.currentAction.turnsLeft == 0){
			switch(roll([["success",900],["fail",100],["poisoned",1]])){
                //if foraging is successful
				case "success":
                    //restore health and energy
					this.energy += Math.floor(Math.random() * 30+30);
					this.health += Math.floor(Math.random() * 5);
					this.lastAction = "forageS";
					this.statusMessage = "forage success";
					//randomly find a weapon
					if(!this.weapon){
						let weaponOdds = [["knife",30],["gun",20],["lance",25],["bow",20],
                        // ["bomb",5],["trap",10],
                        ["Nothing",1]];//nothing was 500
                        // ["Nothing",500]];
						if(sexSword){
							// weaponOdds.push(["nanasatsu",10000]);
							weaponOdds.push(["nanasatsu",0]);
						}
						let w = roll(weaponOdds)
						log_message(this.name +" found "+ w);
                        let temp_wep = create_weapon(w,this); 
						//add weapon to equipped
						if(temp_wep){
                            this.statusMessage =  "found " + temp_wep.name;
							temp_wep.self_effect("equip");
						}
					}
					break;
				//failed forage
				case "fail":
					this.lastAction = "forageF";
					this.statusMessage = "forage fail";
					break;
				//rip
				case "poisoned":
					this.health = 0;
                    this.lastAction = "forageF";
					this.death = "death from poisoned berries";
					break;
			}
			//clear current action
			this.resetPlannedAction();
		}
	}
	//move
	move(){
		//if not current moving
		if(this.currentAction.name != "move"){
			//clear current actions
			this.resetPlannedAction();
			let newX = 0;
			let newY = 0;

			//follow first player they are aware of
			if(Math.random() > players.length/100 && this.awareOf.length){
				newX = this.awareOf[0].x;
				newY = this.awareOf[0].y;
				this.lastAction = "following";
				this.statusMessage = "following " + this.awareOf[0].name;
				this.currentAction.name = "";
			} else {
				//get new cords to move to
				let tries = 0;
				do {
					newX = Math.floor(Math.random()*mapSize);
					newY = Math.floor(Math.random()*mapSize);
					tries++;
				} while(!boundsCheck(newX,newY) && tries < 10);
                if(tries>=10){
                    log_message(this.name + " moving off screen?");
                }
				this.lastAction = "moving";
                this.statusMessage = "on the move";
				this.currentAction.name = "move";
			}
            //get a target location to move to
			this.currentAction.targetX = newX;
			this.currentAction.targetY = newY;
		}
        //check if nearby player has sex sword
        let temp_this=this;
		this.awareOf.forEach(function(oP,index){ 
            oP.inv_effects_other("aware", temp_this);
		});
        this.moveToTarget();
    }
        /*
        //using doodads
		if(this.weapon){
			//if((this.weapon.name == "bomb" || this.weapon.name == "trap") && roll([['use',20],['notuse',100]]) == 'use'){
			if(this.weapon.type == "doodad" && roll([['use',20],['notuse',100]]) == 'use'){
				let tempDoodad = new Doodad(this.weapon.name,this.x,this.y,this);
				tempDoodad.draw();
				doodads.push(tempDoodad);
				this.weapon = "";
                log_message(this.name + " sets a trap");
			}
		}
        */
    //move towards target through regular means
    moveToTarget(){
        //Calculating distance from target
		let distX = this.currentAction.targetX - this.x;
		let distY = this.currentAction.targetY - this.y;
		let dist = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
		let targetX = 0;
		let targetY = 0;
		
        //factor in terrain
		if(terrainCheck(this.x,this.y)=="w"){
			this.moveSpeedB = 0.5;
		} else {
			this.moveSpeedB = 1;
		}
        
        //move towards target
		if(dist <= this.moveSpeed * this.moveSpeedB){
			targetX = this.currentAction.targetX;
			targetY = this.currentAction.targetY;
		} else {
			let shiftX = distX / (dist/(this.moveSpeed * this.moveSpeedB));
			let shiftY = distY / (dist/(this.moveSpeed * this.moveSpeedB));
            //destination coords
			targetX = this.x + shiftX;
			targetY = this.y + shiftY;
			//console.log(terrainCheck(targetX,targetY));
            //swim check
			if(terrainCheck(targetX,targetY) == "w" && terrainCheck(this.x + shiftX * 2, this.y + shiftY * 2)  == "w" && this.lastAction != "swimming"){
                // carried away by water
				let swimChance = roll([["yes",1],["no",50]]);
				if(swimChance == "no"){
					var redirectTimes = 0;
					var redirectDir = roll([[-1,1],[1,1]]);
					var initialDir = Math.acos(shiftY/(this.moveSpeed*this.moveSpeedB));
					var tries = 314;
					do {					
						redirectTimes++;
						let newDir = initialDir + redirectDir * redirectTimes * 0.05;
						shiftX = (this.moveSpeed * this.moveSpeedB) * Math.sin(newDir);
						shiftY = (this.moveSpeed * this.moveSpeedB) * Math.cos(newDir);
						targetX = this.x + shiftX;
						targetY = this.y + shiftY;
						tries--;
					} while (terrainCheck(targetX,targetY) == "w" && tries > 0 && boundsCheck(targetX,targetY));
				}
			}
		}
        this.moveToCoords(targetX, targetY);
    }
    //move to given coords
    moveToCoords(targetX, targetY){
		this.x = targetX;
		this.y = targetY;
		targetX = targetX / mapSize * $('#map').width() - iconSize/2;
		targetY = targetY / mapSize * $('#map').height() - iconSize/2;
		
        //update icons on map
		let charDiv = $('#char_' + this.id);
		charDiv.css({transform:"translate(" + targetX + "px," + targetY + "px)"},function(){
		});
        
        //look for doodads
		doodadCheck(this);
        //if arrived on target location
		if(this.currentAction.targetX == this.x && this.currentAction.targetY == this.y)
			this.resetPlannedAction();
		this.energy -= Math.floor(Math.random()*5+2);
        
        //terrain action
		if(terrainCheck(this.x,this.y)=="w"){
			this.lastAction = "swimming";
			this.statusMessage = "swimming";
		} else if(terrainCheck(this.x,this.y)!="w" && this.lastAction == "swimming"){
			this.lastAction = "moving";
			this.statusMessage = "moving";
		}
        //terrain death
		if(roll([["die",1],["live",2000]]) == "die" && terrainDeath > 0 ){
			switch(terrainCheck(this.x,this.y)){
				case "️⛰️":
					this.health = 0;
					this.death = "Fell off a cliff";
					terrainDeath--;
					break;
				case "w":
					this.health = 0;
					this.death = "Drowned";
					terrainDeath--;
					break;
				default:
					break;
			}
		}
		//timerClick("move");
	}
    //sleep
	sleep(){
        //just started sleeping
		if(this.currentAction.name != "sleep"){
			this.currentAction.name = "sleep";
			this.currentAction.turnsLeft = roll_range(5,8);
            log_message(this.name + " sleeps for the next " + this.currentAction.turnsLeft + " turns");
		}
        //regain health and energy
		this.currentAction.turnsLeft--;
		this.health += Math.floor(Math.random() * 2);
		this.energy += Math.floor(Math.random() * 10);
        //wake up
		if(this.currentAction.turnsLeft > 0){
            log_message(this.name + " continues sleeping");
			this.lastAction = "sleeping";            
			this.statusMessage = "sleeping";            
		} else {
            log_message(this.name + " awakens");
			this.resetPlannedAction();
			this.lastAction = "awaken";
			this.statusMessage = "woke up";
		}
		
	}
    //check if player is supposed to die
	limitCheck(){
		if(this.energy <= 0){
			//if(!this.death) this.death = "death from exhaustion";
			//this.die();
			this.energy = 0;
		}
		if(this.energy > this.maxEnergy)
			this.energy = this.maxEnergy;
		if(this.health <= 0){
			this.health = 0;
			this.die();
		}
		if(this.health > 100){
			this.health = 100;
		}
		//if(this.energy < 25)
			//console.log(this.name + " low on energy");
	}
    //action on death
	die(){
        this.health=0;
		players = arrayRemove(players,this);
		dedPlayers.push(this);
		$("#tbl_" + this.id).addClass("dead");
		$("#tbl_" + this.id).removeClass("alive");
		$("#char_" + this.id).addClass("dead");
		$("#tbl_" + this.id + " .status").text(/*"D" + day + " H" + hour + " " + */this.death);
		$('#table .container.alive').last().after($("#tbl_" + this.id));
		moralNum[this.moral]--;
		personalityNum[this.personality]--;
		if(this.weapon){
            //drop bomb on death
			if(this.weapon.name == "bomb"){
				let tempBomb = new Doodad("bomb",this.x,this.y,this);
				tempBomb.draw();
				doodads.push(tempBomb);
				tempBomb.trigger();
				this.weapon = "";
			}
		}
	}
}