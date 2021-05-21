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
function inRangeOfCheck(tP){
	let tempArr = [];
	players.forEach(function(oP,index){
		if(oP.name != tP.name){
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			if(dist <= (tP.fightRange + tP.fightRangeB) && tP.awareOf.indexOf(oP)>=0){
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
				if(tP.moral == 'Chaotic')
					fightChance += 100;
				if(tP.weapon.name == "🗡"){
					peaceChance = 1;
					fightChance = 19;
				}
				//console.log("Fight check");
				//console.log(tP);
				//console.log(oP);
				let rollResult = roll([['fight',fightChance],['peace',peaceChance]]);
				//console.log(fightChance + " " + peaceChance + " " + rollResult);
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
function damage(tP,oP){
	let dmg = 0;
	switch(tP.constructor.name){
		case "Char":
		dmg = rollDmg(tP);
		if(dmg > oP.health)
			dmg = oP.health;
		oP.health -= dmg;
		tP.exp += dmg;
		if(tP.weapon.name == "🗡"){
			console.log(tP.health + "before");
			console.log(dmg);
			tP.health += Math.pow(dmg,0.66);
			tP.weapon.fightBonus += dmg/1000;
			console.log(tP.health + "after");
		}
		if(tP.weapon){
			tP.weapon.uses--;
			if(tP.weapon.uses == 0)
				tP.weapon = "";
		}
		oP.lastAttacker = tP;
		if(oP.health > 0){
			tP.lastAction = "fights " + oP.name;
			let dist = hypD(oP.x - tP.x,oP.y - tP.y);
			if(oP.awareOf.indexOf(tP)>=0){
				//messages.push([tP," hurts <img src='" + oP.img + "'></img> for " + Math.round(dmg) + " dmg",day,hour]);
				if(oP.fightRange + oP.fightRangeB >= dist){
					let dmg = rollDmg(oP);
					if(dmg > tP.health)
						dmg = tP.health;
					tP.health -= dmg;
					oP.exp += dmg;
					if(oP.weapon.name == "🗡"){
						console.log(oP.health + "before");
						console.log(dmg);
						oP.health += Math.pow(dmg,0.66);
						oP.weapon.fightBonus += dmg/1000;
						console.log(oP.health + "after");
					}
					if(oP.weapon){
						oP.weapon.uses--;
						if(oP.weapon.uses == 0)
							oP.weapon = "";
					}
					if(tP.health <= 0){
						oP.lastAction = "kills " + tP.name;
						oP.kills++;
						tP.death = "killed by " + oP.name;
						//messages.push([tP," kills <img src='" + oP.img + "'></img>",day,hour]);
						if(tP.weapon.name == "🗡" && Math.random() > 0.1){
							oP.weapon = tP.weapon;
							tP.weapon = "";
						}
					} else {
						oP.lastAction = "fights " + tP.name;
						if(oP.weapon)
							oP.lastAction = "attacks " + tP.name + " with a " + oP.weapon.name;
						//messages.push([oP," fights back against <img src='" + tP.img + "'></img> for " + Math.round(dmg) + " dmg",day,hour]);
					}
				} else {
					//messages.push([oP," is out of range and can't fight back",day,hour]);
					oP.lastAction = "is attacked out of range";
					//console.log(oP.fightRange + " " + oP.fightRangeB + " " + dist);
				}
			} else {
				if(oP.lastAction == "sleeping"){
					//messages.push([tP," attacks <img src='" + oP.img + "'></img> in their sleep for " + Math.round(dmg) + " dmg",day,hour]);
					oP.lastAction = "was attacked in their sleep";
				} else {
					//messages.push([tP," hurts <img src='" + oP.img + "'></img> for " + Math.round(dmg) + " dmg",day,hour]);
					oP.lastAction = "is caught offguard";
				}
			}
		} else {
			tP.kills++;
			if(oP.weapon.name == "🗡" && Math.random() > 0.1){
				tP.weapon = oP.weapon;
				oP.weapon = "";
			}
			if(tP.personality == oP.personality && tP.personality != 'Neutral'){
				tP.lastAction = "betrays " + oP.name;
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
		break;
	case "Doodad":
		dmg = Math.floor(Math.random() * tP.dmg);
		oP.health -= dmg;
		if(oP.health <= 0){
			tP.owner.kills++;
			switch(tP.name){
				case "💣":
					if(oP == tP.owner){
						oP.death = "blown up by their own bomb";
					} else {
						oP.death = "blown up by " + tP.owner.name;
					}
					break;
				case "🕳":
					if(oP == tP.owner){
						oP.death = "fell into their own trap";
					} else {
						oP.death = "fell into " + tP.owner.name + "'s trap";
					}
					break;
			}
		} else {
			switch(tP.name){
				case "🕳":
					if(oP == tP.owner){
						oP.lastAction = "fell into their own trap";
					} else {
						oP.lastAction = "fell into " + tP.owner.name + "'s trap";
					}
					break;
			}
		}
		break;
	default:
		break;
	}
}