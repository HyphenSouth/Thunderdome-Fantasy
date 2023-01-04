

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
	let dmg_type="unarmed"	
	
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
	dmg = attacker.apply_all_calcs("dmgCalcOut", dmg, {"opponent":defender, "counter":counter, "dmg_type":dmg_type, "fightMsg":fightMsg});
	dmg = defender.apply_all_calcs("dmgCalcIn", dmg, {"opponent":attacker, "counter":counter, "dmg_type":dmg_type, "fightMsg":fightMsg});
	
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
	
	tP.apply_all_effects("fightStart",{"opponent":oP, "attacker":true, 'fightMsg':fightMsg});
	oP.apply_all_effects("fightStart",{"opponent":tP, "attacker":false, 'fightMsg':fightMsg});
	
	//fight opponent
	attack(tP,oP, false, fightMsg);
	// tP.finishedAction = true
	tP.current_turn_fights++;
	
	tP.last_opponent = oP;
	tP.opponents.push(oP);
	
	oP.last_opponent = tP;
	oP.opponents.push(tP);	
	
	tP.lastActionState = "fighting"	
	if(oP.currentAction)
		oP.currentAction.attacked(tP,fightMsg);
	oP.lastActionState = "attacked";	
	// tP.resetPlannedAction();
	//tP kills oP
	if(oP.health <= 0){	
			log_message(tP.name + " kills " + oP.name);
		tP.kills++;
		// if(tP.personality == oP.personality && tP.personality != 'Neutral'){
		if(tP.inAlliance(oP)){
			tP.statusMessage = "betrays " + oP.name;
			oP.statusMessage = "betrayed by " + tP.name;
			// pushMessage(tP, tP.name + " betrays " + oP.name);
			fightMsg.events.push(tP.name + " betrays " + oP.name);
			oP.death = "betrayed by " + tP.name;
			tP.alliance.unity -= 200;
		} 
		else if(oP.lastActionState == "sleeping"){
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
		
		if(tP.alliance)
			if(tP.alliance.attack_target==oP)
				tP.alliance.unity+=50
		tP.apply_all_effects("win",{"opponent":oP});
		oP.apply_all_effects("lose", {"opponent":tP});
	}
	//opponent turn
	else{
		//push event message
		// pushMessage(tP, tP.name + " " + tP.statusMessage);
		//incapacitated
		if(oP.incapacitated){
			if(oP.currentAction instanceof SleepAction){
				oP.statusMessage = "attacked in their sleep by "+ tP.name;
				// pushMessage(oP, "was attacked in their sleep by " + tP.name);
				fightMsg.events.push(oP.name + " was attacked in their sleep by " + tP.name);
				oP.opinions[tP.id] -= 10;
			}
			else{
				oP.statusMessage = "unable to fight back against " + tP.name;
				// pushMessage(oP, " is unable to fight back against " + tP.name);
				fightMsg.events.push(oP.name + " is unable to fight back against " + tP.name);
				oP.opinions[tP.id] -= 5;
			}
		}
		//cannot fight back due to action
		else if(!oP.fight_back){
			oP.statusMessage = "does not fight back against " + tP.name;
			// pushMessage(oP, " is unable to fight back against " + tP.name);
			fightMsg.events.push(oP.name + " does not fight back against " + tP.name);
			oP.opinions[tP.id] -= 10;
		}
		//unaware
		else if(!(oP.awareOf.indexOf(tP)>=0)){
			oP.statusMessage = "caught offguard";
			// pushMessage(oP, oP.name + " is caught offguard by " + tP.name);
			fightMsg.events.push( tP.name + " is caught offguard by " + oP.name);
			oP.opinions[tP.id] -= 10;
		}
		//out of range
		else if(oP.fightRange + oP.fightRangeB<hypD(oP.x - tP.x,oP.y - tP.y)){
			oP.statusMessage = "attacked out of range";
			// pushMessage(oP, oP.name + " is attacked out of range by " + tP.name);
			fightMsg.events.push(oP.name + " is attacked out of range by " + tP.name);
			oP.opinions[tP.id] -= 10;
		}
		//too busy to fight back
		else if(oP.current_turn_fights >= turnFightLim){
			// pushMessage(oP, "is too busy to fight back against " + tP.name);
			fightMsg.events.push(oP.name + "is too busy to fight back against " + tP.name);
			oP.opinions[tP.id] -= 5;
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
			// oP.lastActionState="fighting";
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
				
				if(oP.alliance)
					if(oP.alliance.attack_target==tP)
						oP.alliance.unity+=50
			}
			//tP survives
			else{	
				//push event message
				// pushMessage(oP, oP.name + " " + oP.statusMessage);
			}
		}
	}
	//update opinions
	tP.opinions[oP.id] -= 20;
	if(oP.moral == 'Chaotic'){
		oP.opinions[tP.id] -= 30;
	}
	else if(tP.moral == 'Lawful'){
		// oP.opinions[tP.id] *= 0.5;
		// oP.opinions[tP.id] -= 100;
		oP.opinions[tP.id] -= Math.max(Math.round(oP.opinions[tP.id]*0.25), 60)
	}
	else{
		oP.opinions[tP.id] -= 60;
	}
	tP.apply_all_effects("fightEnd",{"opponent":oP, "attacker":true, 'fightMsg':fightMsg});
	oP.apply_all_effects("fightEnd",{"opponent":tP, "attacker":false, 'fightMsg':fightMsg});
	log_message(tP.name +' vs '+oP.name)
	// log_message(tP.opponents)
	// log_message(oP.opponents)
}

class CombatAction{}