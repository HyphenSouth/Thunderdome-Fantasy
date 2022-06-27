//functions for actions that require more than one char, such as combat and range

function awareOfCheck(tP){
	let tempArr = [];
	let tp_sight = tP.sightRange + tP.sightRangeB;
	let tp_fight = tP.fightRange + tP.fightRangeB;
	
	players.forEach(function(oP,index){
		if(oP != tP){
			let dist = playerDist(oP, tP);
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

//get opponents for that tP can fight
function inRangeOfCheck(tP){
	let tempArr = [];
	tP.calc_bonuses();
	tP.awareOf.forEach(function(oP,index){
		if(oP != tP){
			let dist = playerDist(oP, tP);
			if(dist <= (tP.fightRange + tP.fightRangeB) && tP.awareOf.indexOf(oP)>=0){
				// log_message(oP.name + " distance " + dist + " fight range " + (tP.fightRange + tP.fightRangeB))
				tempArr.push(oP);
			}
		}
	});
	return tempArr;
}
var baseFightChance = 50;
var basePeaceChance = 50;
function aggroCheck(tP, oP){
	//check if tP wants to fight oP
	let fightChance = baseFightChance;
	let peaceChance = basePeaceChance;
	
	if(tP.personality == oP.personality){
		//same personality
		peaceChance += 40;
		fightChance -= 20;
	} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
		//opposing personality
		fightChance += 40;
		peaceChance -= 20;
	}
	if(tP.moral == 'Chaotic'){
		peaceChance += oP.intimidation
	}
	if(tP.moral == 'Lawful'){
		fightChance += oP.intimidation
	}
	if(tP.moral == 'Neutral'){
		fightChance += Math.round(oP.intimidation/2)
		peaceChance += Math.round(oP.intimidation/2)
	}
	
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
	let rollResult = roll([['fight',fightChance],['peace',peaceChance]]);
	return rollResult;  
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
//calculate damage
function rollDmg(tP, oP){
	if(tP.fightDmgB<0){
		tP.fightDmgB=0;
	}
	if(oP.dmgReductionB<0){
		oP.dmgReductionB=0;
	}
	let dmg = Math.floor((Math.random() * tP.fightDmg / 2) + (Math.random() * tP.fightDmg / 2)) ;
	dmg = dmg * tP.fightDmgB;
	dmg = dmg * oP.dmgReductionB;
	if(dmg > oP.health)
		dmg = oP.health;
	if(dmg<0)
		dmg=0;
	return dmg;
}

function attack(attacker, defender, counter, fightMsg){
	let dmg = 0;
	let dmg_type="melee"	
	
	// if(!counter)
		// fightMsg.events.push(attacker.name + " attacks " + defender.name);
	// else
		// fightMsg.events.push(attacker.name + " fights back against " + defender.name);
	
	if(attacker.weapon){
		dmg_type = attacker.weapon.dmg_type;
	}
	attacker.calc_bonuses();
	defender.calc_bonuses();
	
	//apply pre damage functions
	// attacker.apply_inv_effects_other("attack", {"damage":dmg, "counter":counter});
	// defender.apply_inv_effects_other("defend", {"damage":dmg, "counter":counter});	
	attacker.statusMessage = "fights " + defender.name;
	attacker.apply_all_effects("attack", {"opponent":defender, "counter":counter, "dmg_type":dmg_type, "fightMsg":fightMsg});
	defender.apply_all_effects("defend", {"opponent":attacker, "counter":counter, "dmg_type":dmg_type, "fightMsg":fightMsg});

	dmg = rollDmg(attacker, defender);
	
	fightMsg.events.push(attacker.name + " deals "+ roundDec(dmg)+ " damage to " + defender.name);
	attacker.apply_all_effects("dealDmg", {"opponent":defender, "damage":dmg, "dmg_type":dmg_type, "fightMsg":fightMsg });
	// defender.health -= dmg;
	defender.take_damage(dmg, attacker, dmg_type, fightMsg)
	
	attacker.exp += dmg;
	log_message(attacker.name + " deals " + dmg + " damage to "+ defender.name);
}

function fight_target(tP,oP){
	//tp has the initiative 
	tP.div.addClass("fighting");
	tP.tblDiv.addClass("fighting");
	oP.div.addClass("fighting");
	oP.tblDiv.addClass("fighting");
	
	let fightMsg = {'fight':true, 'attacker': tP, 'defender': oP, 'events':[]}
	events.push(fightMsg);	
	
	//fight opponent
	attack(tP,oP, false, fightMsg);
	tP.finishedAction = true
	tP.current_turn_fights++;
	oP.lastAttacker = tP;
	tP.lastAction = "fighting"
	tP.resetPlannedAction();
	//tP kills oP
	if(oP.health <= 0){
		log_message(tP.name + " kills " + oP.name);
		tP.kills++;
		if(tP.personality == oP.personality && tP.personality != 'Neutral'){
			tP.statusMessage = "betrays " + oP.name;
			oP.statusMessage = "killed in their sleep by " + tP.name;
			// pushMessage(tP, tP.name + " betrays " + oP.name);
			fightMsg.events.push(tP.name + " betrays " + oP.name);
			oP.death = "betrayed by " + tP.name;
		} 
		else if(oP.lastAction == "sleeping"){
			tP.statusMessage = "kills " + oP.name + " in their sleep";
			oP.statusMessage = "killed in their sleep by " + tP.name;
			// pushMessage(tP, tP.name + " kills " + oP.name + " in their sleep");
			fightMsg.events.push(tP.name + " kills " + oP.name + " in their sleep");
			oP.death = "killed in their sleep by " + tP.name;
		} 
		else{
			tP.statusMessage = "kills " + oP.name;
			oP.statusMessage = "killed by " +tP.name;
			// pushMessage(tP, tP.name + " kills " + oP.name);
			fightMsg.events.push(tP.name + " kills " + oP.name);
			oP.death = "killed by " + tP.name;
		}
		tP.apply_all_effects("win",{"opponent":oP});
		oP.apply_all_effects("lose", {"opponent":tP});
	}
	//opponent turn
	else{
		//push event message
		// pushMessage(tP, tP.name + " " + tP.statusMessage);
		
		//incapacitated
		if(oP.incapacitated){
			if(oP.lastAction == "sleeping"){
				oP.statusMessage = "attacked in their sleep by "+ tP.name;
				// pushMessage(oP, "was attacked in their sleep by " + tP.name);
				fightMsg.events.push(oP.name + " was attacked in their sleep by " + tP.name);
			}
			else{
				oP.statusMessage = "unable to fight back against " + tP.name;
				// pushMessage(oP, " is unable to fight back against " + tP.name);
				fightMsg.events.push(oP.name + " is unable to fight back against " + tP.name);
			}
		}
		//unaware
		else if(!(oP.awareOf.indexOf(tP)>=0)){
			oP.statusMessage = "caught offguard";
			// pushMessage(oP, oP.name + " is caught offguard by " + tP.name);
			fightMsg.events.push( P.name + " is caught offguard by " + tP.name);
		}
		//out of range
		else if(oP.fightRange + oP.fightRangeB<hypD(oP.x - tP.x,oP.y - tP.y)){
			oP.statusMessage = "attacked out of range";
			// pushMessage(oP, oP.name + " is attacked out of range by " + tP.name);
			fightMsg.events.push(oP.name + " is attacked out of range by " + tP.name);
		}
		//too busy to fight back
		else if(oP.current_turn_fights >= turnFightLim){
			// pushMessage(oP, "is too busy to fight back against " + tP.name);
			fightMsg.events.push(oP.name + "is too busy to fight back against " + tP.name);
		}
		//tP is somehow dead
		else if(tP.health <=0){
			// pushMessage(oP, oP.name + " tries to fight back against " + tP.name + "'s corpse");
			fightMsg.events.push(oP.name + " tries to fight back against " + tP.name + "'s corpse");
			if(oP.statusMessage=="")
				oP.statusMessage= "tries to fight back against " + tP.name + "'s corpse"
		}
		else{
			//opponent counter attack
			attack(oP,tP, true, fightMsg);
			oP.current_turn_fights++;
			oP.lastAction="fighting";
			//oP kills tP
			if(tP.health <= 0){
				log_message(oP.name + " kills " + tP.name +" (counterattack)");
				oP.kills++;
				oP.statusMessage = "kills " + tP.name;
				tP.statusMessage = "killed by " +oP.name + "'s counterattack";
				// pushMessage(oP, oP.name + " fights back and kills " + tP.name);
				fightMsg.events.push(oP.name + " kills " + tP.name);
				tP.death = "killed by " + oP.name + "'s counterattack";	
				
				oP.apply_all_effects("win",{"opponent":tP});
				tP.apply_all_effects("lose",{"opponent":oP});
			}
			//tP survives
			else{	
				//push event message
				// pushMessage(oP, oP.name + " " + oP.statusMessage);
			}
		}
	}
	oP.lastAction = "attacked";
	oP.currentAction = {};
	if(oP.finishedAction == false){
		oP.finishedAction = true;
		oP.interrupted = true;
		//interrupt planned actions
	}
	oP.resetPlannedAction();
	// if(tP.health<=0){
		// tP.die()
	// }	
	// if(oP.health<=0){
		// oP.die()
	// }
}
