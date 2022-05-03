//functions for actions that require more than one char, such as combat and range

function awareOfCheck(tP){
	let tempArr = [];
	let tp_sight = tP.sightRange + tP.sightRangeB;
	let tp_fight = tP.fightRange + tP.fightRangeB;
	
	players.forEach(function(oP,index){
		if(oP.name != tP.name){
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			//check if tP has special aggro effects
			tP.apply_all_effects("awareCheck", {"opponent":oP});
			//check if oP forces tP to aggro
			oP.apply_all_effects("awareCheckOthers", {"opponent":tP});
			let op_vis = oP.visibility + oP.visibilityB;
			if(op_vis<0){op_vis=0;}
			if(dist <= tp_sight){
				//Units have a % of chance of being seen, increasing exponential up to their fight range
				if(Math.pow((Math.random()*(op_vis/100)),1/3) * (tp_sight - tp_fight) > dist - tp_fight){
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
	//check if tP wants to fight oP
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
	// oP.apply_inv_effects_other("aggro check", tP);
	// oP.apply_status_effects_other("aggro check", tP);

	//check if tP has special aggro effects
	tP.apply_all_effects("aggroCheck", {"opponent":oP});
	//check if oP forces tP to aggro
	oP.apply_all_effects("aggroCheckOthers", {"opponent":tP});
	
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
//get opponents for that tP can fight
function inRangeOfCheck(tP){
	let tempArr = [];
	tP.calc_bonuses();
	players.forEach(function(oP,index){
		if(oP.name != tP.name){
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			if(dist <= (tP.fightRange + tP.fightRangeB) && tP.awareOf.indexOf(oP)>=0){
				log_message(oP.name + " distance " + dist + " fight range " + (tP.fightRange + tP.fightRangeB))
				let rollResult = aggroCheck(tP,oP);
				log_message(rollResult+" with " + oP.name)
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
			let triggerChance = 5 + tD.triggerChance;
			let triggerNoChance = 15;
			if(tD.owner == tP)
				triggerNoChance += 100;
			if(roll([["yes",triggerChance],["no",triggerNoChance]]) == 'yes')
				tD.trigger();
		}
	});
}
function rollDmg(tP){
	let dmg = Math.floor((Math.random() * tP.fightDmg / 2) + (Math.random() * tP.fightDmg / 2)) * tP.fightDmgB;
	return dmg;
}


function attack(attacker, defender, counter){
	let dmg = 0;
	let dmg_type="melee"
	
	if(attacker.weapon){
		dmg_type = attacker.weapon.dmg_type;
	}
	attacker.calc_bonuses();
	defender.calc_bonuses();
	
	//apply pre damage functions
	// attacker.apply_inv_effects_other("attack", {"damage":dmg, "counter":counter});
	// defender.apply_inv_effects_other("defend", {"damage":dmg, "counter":counter});	
	attacker.statusMessage = "fights " + defender.name;
	attacker.apply_all_effects("attack", {"opponent":defender, "counter":counter, "dmg_type":dmg_type});
	defender.apply_all_effects("defend", {"opponent":attacker, "counter":counter, "dmg_type":dmg_type});

	if(attacker.fightDmgB<0){
		attacker.fightDmgB=0;
	}
	if(defender.dmgReductionB<0){
		defender.dmgReductionB=0;
	}
	dmg = rollDmg(attacker);
	dmg = dmg * defender.dmgReductionB;
	if(dmg > defender.health)
		dmg = defender.health;
	
	attacker.apply_all_effects("dealDmg", {"opponent":defender, "damage":dmg, "dmg_type":dmg_type});
	// defender.apply_all_effects("takeDmg", {"source":attacker, "damage":dmg, "dmg_type":dmg_type});
	
	// defender.health -= dmg;
	defender.take_damage(dmg, attacker, dmg_type)
	attacker.exp += dmg;
	log_message(attacker.name + " deals " + dmg + " damage to "+ defender.name);

	//apply weapon effects after dealing damage
	// attacker.apply_inv_effects_other("deal dmg", defender, {"damage":dmg, "counter":counter});
	// defender.apply_inv_effects_other("take dmg", attacker, {"damage":dmg, "counter":counter});	

	

}

function fight_target(tP,oP){
	
	//tp has the initiative 
	tP.div.addClass("fighting");
	oP.div.addClass("fighting");
	
	//fight opponent
	attack(tP,oP, false);
	tP.finishedAction = true
	tP.current_turn_fights++;
	oP.lastAttacker = tP;
	tP.lastAction = "fighting"
	tP.resetPlannedAction();
	//opponent turn
	if(oP.health > 0){
		// tP.lastAction = "fights " + oP.name;
		/*
		tP.statusMessage = "fights " + oP.name;
		if(tP.weapon){
			// tP.lastAction = "attacks " + oP.name + " with a " + tP.weapon.icon;
			tP.statusMessage = "attacks " + oP.name + " with a " + tP.weapon.icon;
		}
		*/
		//awareness check
		if(!oP.incapacitated && oP.awareOf.indexOf(tP)>=0 && oP.current_turn_fights <turnFightLim){
			//check if in range
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			//opponent counter attack
			if(oP.fightRange + oP.fightRangeB >= dist){
				attack(oP,tP, true);
				oP.current_turn_fights++;
				oP.lastAction="fighting";
				//oP kills tP
				if(tP.health <= 0){
					log_message(oP.name + " kills " + tP.name +" (counterattack)");
					// oP.lastAction = "kills " + tP.name;
					oP.kills++;
					tP.statusMessage = "killed by " +oP.name;
					tP.death = "killed by " + oP.name + "'s counterattack";
					oP.apply_all_effects("win",{"opponent":tP});
					tP.apply_all_effects("lose",{"opponent":oP});
				} 
			} else {
				// oP.lastAction = "is attacked out of range";
				oP.statusMessage = "is attacked out of range";
				oP.lastAction = "attacked";
				oP.currentAction = {};
			}
		}
		//unaware
		else {
			if(oP.lastAction == "sleeping"){
				// oP.lastAction = "was attacked in their sleep";
				oP.statusMessage = "was attacked in their sleep";
			} 
			else if(oP.incapacitated){
				oP.statusMessage = "unable to fight back against " + tP.name;
			}
			else if(oP.current_turn_fights >= turnFightLim){
				pushMessage(oP, "too busy fighting to defend against " + tP.name);
			}
			else {
				// oP.lastAction = "is caught offguard";
				oP.statusMessage = "is caught offguard";
			}
			oP.lastAction = "attacked";
			oP.currentAction = {};
		}
		oP.finishedAction = true;
	}
	//tP kills oP
	else {
		log_message(tP.name + " kills " + oP.name);
		tP.kills++;
		// tP.apply_inv_effects_other("win",oP);
		// oP.apply_inv_effects_other("lose", tP);
		tP.apply_all_effects("win",{"opponent":oP});
		oP.apply_all_effects("lose", {"opponent":tP});
		oP.statusMessage = "killed by " +tP.name;
		if(tP.personality == oP.personality && tP.personality != 'Neutral'){
			// tP.lastAction = "betrays " + oP.name;
			tP.statusMessage = "betrays " + oP.name;
			oP.death = "betrayed by " + tP.name;
		} else {
			if(oP.lastAction == "sleeping"){
				oP.death = "killed in their sleep by " + tP.name;
			} else {
				oP.death = "killed by " + tP.name;
			}
		}
	}
	pushMessage(tP, tP.statusMessage);
	pushMessage(oP, oP.statusMessage);
	oP.resetPlannedAction();
}
