//functions for actions that require more than one char, such as combat and range

function awareOfCheck(tP){
	let tempArr = [];
	players.forEach(function(oP,index){
		if(oP.name != tP.name){
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			if(dist <= tP.sightRange){
				//Units have a % of chance of being seen, increasing exponential up to their fight range
				if(Math.pow(Math.random(),1/3) * (tP.sightRange - tP.fightRange) > dist - tP.fightRange){
					let seen = false;
					tP.opinions.forEach(function(oP2,index){
						if(oP2[0] == oP)
							seen = true;
					});
					if(!seen)
						tP.opinions.push([oP,50]);
					tempArr.push(oP)
				}
			}
		}
	});
	return tempArr;
}

function aggroCheck(tP, oP){
	let fightChance = 50;
	let peaceChance = 50;
	if(tP.personality == oP.personality){
		peaceChance += 40;
		fightChance -= 20;
	} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
		fightChance += 40;
		peaceChance -= 20;
	}
	if(tP.moral == 'Lawful')
		peaceChance += 75;
	if(tP.moral == 'Chaotic'){
		fightChance += 100;
    }
    fightChance=fightChance+tP.aggroB;
    peaceChance=peaceChance+tP.peaceB;
    if(fightChance<1)
        fightChance=1;
    if(peaceChance<1)
        peaceChance=1;
    
	//console.log("Fight check");
	//console.log(tP);
	//console.log(oP);                
	let rollResult = roll([['fight',fightChance],['peace',peaceChance]]);
       return rollResult;  
}
//get opponents for the specific player
function inRangeOfCheck(tP){
	let tempArr = [];
    tP.calc_bonuses();
	players.forEach(function(oP,index){
		if(oP.name != tP.name){
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			if(dist <= (tP.fightRange + tP.fightRangeB) && tP.awareOf.indexOf(oP)>=0){
				let rollResult = aggroCheck(tP,oP);
                log_message(rollResult)
				if(rollResult == 'fight')
					tempArr.push(oP);
			}
		}
	});
	return tempArr;
}
function doodadCheck(tP){
	doodads.forEach(function(tD,index){
		let dist = hypD(tP.x - tD.x, tP.y - tD.y);
		if(dist <= tD.triggerRange){
			let triggerChance = 1;
			let triggerNoChance = 3;
			if(tD.owner == tP)
				triggerNoChance += 20;
			if(roll([["yes",triggerChance],["no",triggerNoChance]]) == 'yes')
				tD.trigger();
		}
	});
}
function rollDmg(tP){
	return Math.floor((Math.random() * tP.fightDmg / 2) + (Math.random() * tP.fightDmg / 2)) * tP.fightDmgB;
}


function attack(attacker, defender){
    let dmg = 0;
    dmg = rollDmg(attacker);
	if(dmg > defender.health)
		dmg = defender.health;
    //apply weapon effects
    attacker.inv_effects_other("attack", defender, {"damage":dmg})
    defender.inv_effects_other("defend", attacker, {"damage":dmg})
    
    defender.health -= dmg;
	attacker.exp += dmg;
    log_message(attacker.name + " deals " + dmg + " damage to "+ defender.name);
}

function fight_target(tP,oP){
	let dmg = 0;
    //if attacker is a player
	switch(tP.constructor.name){
        //tp has the initiative 
		case "Char":
        attack(tP,oP);
        tP.finishedAction = true
		oP.lastAttacker = tP;
        //opponent turn
		if(oP.health > 0){
            // tP.lastAction = "fights " + oP.name;
            tP.statusMessage = "fights " + oP.name;
            if(tP.weapon){
                // tP.lastAction = "attacks " + oP.name + " with a " + tP.weapon.icon;
                tP.statusMessage = "attacks " + oP.name + " with a " + tP.weapon.icon;
            }
            //awareness check
			if(oP.awareOf.indexOf(tP)>=0){
                //check if in range
                let dist = hypD(oP.x - tP.x,oP.y - tP.y);
                //opponent counter attack
				if(oP.fightRange + oP.fightRangeB >= dist){
                    attack(oP,tP);
                    oP.finishedAction = true;
                    //tP killed by oP 
					if(tP.health <= 0){
                        log_message(oP.name + " kills " + tP.name +" (counterattack)");
						// oP.lastAction = "kills " + tP.name;
						oP.statusMessage = "kills " + tP.name;
						oP.kills++;
						tP.death = "killed by " + oP.name + "'s counterattack";
                        oP.inv_effects_other("win",tP);
                        tP.inv_effects_other("lose",oP);
					} else {
						// oP.lastAction = "fights " + tP.name;
						oP.statusMessage = "fights " + tP.name;
						if(oP.weapon)
							// oP.lastAction = "attacks " + tP.name + " with a " + oP.weapon.icon;
							oP.statusMessage = "attacks " + tP.name + " with a " + oP.weapon.icon;
					}
				} else {
					// oP.lastAction = "is attacked out of range";
					oP.statusMessage = "is attacked out of range";
				}
			}
            //unaware
            else {
				if(oP.lastAction == "sleeping"){
					// oP.lastAction = "was attacked in their sleep";
                    oP.statusMessage = "was attacked in their sleep";
				} else {
					// oP.lastAction = "is caught offguard";
					oP.statusMessage = "is caught offguard";
				}
                oP.currentAction = {}
			}
		}
        // oP killed by tP        
        else {
            log_message(tP.name + " kills " + oP.name);
			tP.kills++;
            tP.inv_effects_other("win",oP);
            oP.inv_effects_other("lose", tP);

			if(tP.personality == oP.personality && tP.personality != 'Neutral'){
				// tP.lastAction = "betrays " + oP.name;
				tP.statusMessage = "betrays " + oP.name;
				oP.death = "betrayed by " + tP.name;
			} else {
				tP.lastAction = "kills " + oP.name;
				if(oP.lastAction == "sleeping"){
					oP.death = "killed in their sleep by " + tP.name;
				} else {
					oP.death = "killed by " + tP.name;
				}
			}
		}
        pushMessage(tP, tP.statusMessage);
        pushMessage(oP, oP.statusMessage);
		break;
	case "Doodad":
		dmg = Math.floor(Math.random() * tP.dmg);
		oP.health -= dmg;
		if(oP.health <= 0){
			tP.owner.kills++;
			switch(tP.name){
				case "bomb":
					if(oP == tP.owner){
						oP.death = "blown up by their own bomb";
					} else {
						oP.death = "blown up by " + tP.owner.name;
					}
					break;
				case "trap":
					if(oP == tP.owner){
						oP.death = "fell into their own trap";
					} else {
						oP.death = "fell into " + tP.owner.name + "'s trap";
					}
					break;
			}
		} else {
			switch(tP.name){
				case "trap":
					if(oP == tP.owner){
						oP.lastAction = "trapped";
						oP.statusMessage = "fell into their own trap";
					} else {
						oP.lastAction = "trapped";
						oP.statusMessage = "fell into " + tP.owner.name + "'s trap";
					}
					break;
			}
		}
		break;
	default:
		break;
	}
}