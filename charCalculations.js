//functions for actions that require more than one char, such as combat and range check
//check if tp is aware of op
function awareOfCheck(tP, oP){
	if(oP == tP)
		return false

	//check if tP has special aggro effects
	tP.apply_all_effects("awareCheck", {"opponent":oP});
	
	//check if oP forces tP to aggro
	oP.apply_all_effects("awareCheckOthers", {"opponent":tP});
	
	let tp_sight = tP.sightRange + tP.sightRangeB;
	let tp_fight = tP.fightRange + tP.fightRangeB;

	let dist = playerDist(oP, tP);
	
	let op_vis = Math.max(oP.visibility + oP.visibilityB, 0);

	if(dist <= tp_sight){
		//Units have a % of chance of being seen, increasing exponential up to their fight range
		if(Math.pow((Math.random()*(op_vis/100)),1/3) * (tp_sight - tp_fight) > dist - tp_fight)
			return true
	}
	return false
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
//decrepit 
function aggroCheck(tP, oP){
	if(tP==oP)
		return false
	if(!tP.awareOfPlayer(oP))
		return false
	
	if(!tP.inRangeOfPlayer(oP))
		return false
	
	let fightChance = 150;
	let peaceChance = 5;
	
	fightChance += tP.aggroB	
	peaceChance += tP.opinions[oP.id]
	peaceChance += tP.peaceB
	
	if(oP==tP.rival){
		fightChance += 200
	}
	
	if(tP.inAlliance(oP)){
		fightChance -= tP.alliance.unity
		peaceChance += 150
		if(tP.moral=='Chaotic')
			fightChance += 20
	}
	
	fightChance=Math.max(fightChance, 1)
	peaceChance=Math.max(peaceChance, 1)
	
	log_message(fightChance+', '+peaceChance)
	
	if(roll([['fight',fightChance],['peace',peaceChance]])=='fight')
		return true
	else
		return false
	
	/*
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
	*/
}

function get_follow_score(tP,oP, follow_type){
	if(tP==oP)
		return 0
	let score = 100
	if(follow_type=='aggro'){
		score = score - tP.opinions[oP.id]
		score = score - oP.intimidation
		//opposing personality
		if (tP.personality != 'Neutral' && oP.personality != 'Neutral')
			score += roll_range(-10, 60)
		if(oP == tP.rival)
			score += 60;
	}
	else if(follow_type=='def'){
		score = score + (tP.opinions[oP.id] * 2)
		score = score - (oP.intimidation * 5)
		//same personality
		if(tP.personality == oP.personality)
			score += roll_range(-10, 60)
		if(oP == tP.rival)
			score -= 30;
	}
	else{
		score = score + tP.opinions[oP.id]/2
		score = score - (oP.intimidation * 2)
		score += roll_range(-20, 20)
	}
	
	if(tP.prevTarget == oP)
		score += 100
	if(tP.inAlliance(oP))
		score += 100
			
	//check if tP has special follow effects
	score = tP.apply_all_calcs("followCalc", score, {"opponent":oP, "follow_type":follow_type});
	//check if oP forces tP to follow
	score = oP.apply_all_calcs("followCalcOthers", score, {"opponent":tP, "follow_type":follow_type});
	return score;
}

function get_fight_score(tP, oP){
	if(tP==oP)
		return 0
	if(!tP.awareOfPlayer(oP))
		return 0
	if(!tP.inRangeOfPlayer(oP))
		return 0
	
	let score = 100;
	score = score - (tP.opinions[oP.id]);
	score = score - (oP.intimidation * 3);
	score = score + tP.aggroB / 4;
	score = score - tP.peaceB / 5;
	
	if(tP.inAlliance(oP)){
		score -= (tP.alliance.unity-80)
		if(tP.moral=='Chaotic')
			score += 10
	}
	
	if(oP == tP.rival)
		score += 100;
	
	if(tP.opponents.indexOf(oP)>0)
		score += 80;
	
	if(oP == tP.last_opponent)
		score += 20;
	
	if(tP.personality == oP.personality){
		//same personality
		score += roll_range(-10, 50)
	} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
		//opposing personality
		score += roll_range(-50, 10)
	}
	else{
		score += roll_range(-20, 20)
	}
	
	if(tP.personality =='Evil'){
		score += (0.5-(oP.health/oP.maxHealth))*40
	}
	else if(tP.personality =='Good'){
		score += ((oP.health/oP.maxHealth)-0.5)*20
	}
	
	if(tP.lastAction instanceof FightAction){
		if(tP.lastAction.target == oP)
			score +=30
	}
	else if(tP.lastAction instanceof FollowAction){
		if(tP.lastAction.target == oP && tP.opinions[oP.id]<0)
			score +=30
	}
		
	// if(tP.prevTarget == oP)
		// score += 20
			
	//check if tP has special aggro effects
	score = tP.apply_all_calcs("aggroCalc", score, {"opponent":oP});
	//check if oP forces tP to aggro
	score = oP.apply_all_calcs("aggroCalcOthers", score, {"opponent":tP});
	return Math.round(score)
}

function get_ally_score(tP, oP){
	if(oP==tP)
		return 0
	//unaware
	if(!tP.awareOfPlayer(oP))
		return 0
	// out of range
	if(playerDist(tP, oP) > alliance_radius)
		return 0
	//in same alliance
	if(tP.inAlliance(oP))
		return 0
	//both in alliance
	if(tP.alliance && oP.alliance)
		return 0
	else if(tP.alliance){
		//alliance full
		if(tP.alliance.members.length>=max_alliance_size)
			return 0
	}
	else if(oP.alliance){
		if(oP.alliance.members.length>=max_alliance_size)
			return 0
	}
	else{
		//max alliances reached
		if(alliances.length>=max_alliance_count)
			return 0
	}
	
	let score = 50;		
	score = score + tP.opinions[oP.id]
	score = score - (oP.intimidation * 3)
	
	if(oP == tP.rival)
		score -= 200;	
	if(oP == tP.last_opponent)
		score -= 20;
	if(tP.opponents.indexOf(oP)>0)
		score -= 50;
	
	if(tP.personality == oP.personality){
		//same personality
		score += 20
	} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
		//opposing personality
		score -=20
	}
	
	if(tP.moral=='Chaotic')
		score-=40;
	else if(tP.mora=='Lawful')
		score+=20
	
	if(tP.alliance){
		let opinion_sum=0
		tP.alliance.members.forEach(function(member){
			if(member==tP)
				return
			opinion_sum+=member.opinions[oP.id]
			if(member.opinions[oP.id]<20){
				score -= 50
			}
		})
		if(opinion_sum/(tP.alliance.members.length-1)<expected_alliance_opinion-50)
			score-=50
		else if(opinion_sum/(tP.alliance.members.length-1)>expected_alliance_opinion+50)
			score+=30
	}	
	
	//check if tP has special aggro effects
	score = tP.apply_all_calcs("allyCalc", score, {"opponent":oP});
	//check if oP forces tP to aggro
	score = oP.apply_all_calcs("allyCalcOthers", score, {"opponent":tP});
	
	return score
}

var max_opinion = 300;
var min_opinion = -max_opinion;
//update tP's opinion of oP
function opinion_calc(tP, oP){
	if(oP==tP){
		tP.opinions[tP.id] = 0;
		return
	}
	if(tP.awareOfPlayer(oP) || roll_range(0,100) < 25){
		if(tP.personality == oP.personality){
			//same personality
			tP.opinions[oP.id] += roll_range(-5, 15)
		} else if (tP.personality != 'Neutral' && oP.personality != 'Neutral'){
			//opposing personality
			tP.opinions[oP.id] += roll_range(-15, 5)
		}
		else{
			tP.opinions[oP.id] += roll_range(-10, 10)
		}
		
		//concentrate opinions around 40 to 80
		if(tP.moral=='Chaotic'){
			if(Math.abs(tP.opinions[oP.id])<40){
				tP.opinions[oP.id] *= roll_range(90,120)/100	
			}
			else if(Math.abs(tP.opinions[oP.id])>80){
				tP.opinions[oP.id] *= roll_range(60,105)/100	
			}
		}
		//increase opinions over 100
		else if(tP.moral=='Lawful'){
			if(Math.abs(tP.opinions[oP.id])>100 && Math.abs(tP.opinions[oP.id])<200){
				tP.opinions[oP.id] *= roll_range(98,105)/100	
			}
		}
		if(tP.rival){
			if(tP.rival.inAlliance(oP)){
				tP.opinions[oP.id] -= 20;		
			}					
		}
		/*
		if(oP==tP.last_opponent){
			tP.opinions[oP.id] -= 20;
		}
		*/
	}
	if(tP.inAlliance(oP)){
		tP.alliance.calc_opinions(tP, oP)
	}

	//decrease opinions over time
	if(tP.lastFight > 30){
		tP.opinions[oP.id] -= Math.max(tP.opinions[oP.id] * Math.min(roll_range(30,tP.lastFight)/600,0.25), 50)
		// tP.opinions[oP.id] -= Math.round(roll_range(0, tP.lastFight)/20)
	}
		
	tP.opinions[oP.id] = tP.apply_all_calcs("opinionCalc",tP.opinions[oP.id], {"opponent":oP});
	tP.opinions[oP.id] = oP.apply_all_calcs("opinionCalcOthers",tP.opinions[oP.id], {"opponent":tP});
	tP.opinions[oP.id] = Math.round(tP.opinions[oP.id])
	if(tP.opinions[oP.id]>max_opinion)
		tP.opinions[oP.id] = max_opinion
	else if(tP.opinions[oP.id]<min_opinion)
		tP.opinions[oP.id] = min_opinion
}

function get_player_danger_score(tP, oP){
	if(tP==oP)
		return 0
	if(!tP.inAlliance(oP)){	
		player_danger_score = 5	
		player_danger_score += oP.intimidation - tP.intimidation/2
				
		if(oP.weapon)
			player_danger_score += 20
		if(oP.offhand)
			player_danger_score += 10
		
		if(tP.opinions[oP.id]>250)
			player_danger_score-=30
		else if(tP.opinions[oP.id]<-250)
			player_danger_score+=10
		
		if(player_danger_score > 0){
			player_danger_score *= (1 + (oP.health/oP.maxHealth))
			player_danger_score *= (2 - (tP.health/tP.maxHealth))
		}				
		else{
			player_danger_score *= (2 - oP.health/oP.maxHealth)	
			player_danger_score *= (1 + (tP.health/tP.maxHealth))
		}
		
		player_danger_score *= Math.max(1-(tP.opinions[oP.id]/100), 0.01)		
	}
	else{
		//alliance members
		player_danger_score = -20		
		player_danger_score -= oP.intimidation/5
		player_danger_score -= tP.opinions[oP.id]/10
		player_danger_score -= tP.alliance.unity/10
		
		if(oP.weapon)
			player_danger_score -= 10
		if(oP.offhand)
			player_danger_score -= 5
		
		if(player_danger_score > 0)
			player_danger_score *= (2 - oP.health/oP.maxHealth)
		else
			player_danger_score *= (1 + (oP.health/oP.maxHealth))				
	}
	if(oP==tP.last_opponent)
		player_danger_score += 50;
	player_danger_score = tP.apply_all_calcs('playerDangerCalc', player_danger_score, {'opponent':oP})
	player_danger_score = oP.apply_all_calcs('playerDangerCalcOther', player_danger_score, {'opponent':tP})
				
	return player_danger_score
	// console.log(oP.name + ' ' +player_danger_score)
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
