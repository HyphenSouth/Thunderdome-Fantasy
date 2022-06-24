# Main
Thunderdome Fantasy is a Hunger Games style battle royale simulation that allows your favorite anime characters to fight to the death.

## Gameplay

### Preparation
Terrain can be generated before game starts.

### Turn
---
Thunderdome Fantasy takes place over a series of turns. Each turn represents one hour.

The player list is shuffled at the start of a turn. 
Player actions will be processed in order of the player list.

A turn consists of the following phases:

- Character Planning
- Character Action
- Doodad Update
- Terrain Update	
- Characters Limit Check
- Status Tables Updates


## Character


### Stats
---
	


### Actions
---
These are the default actions a character can perform. 
Items, status effects and attributes may come with their own actions.

Characters will choose an action to perform during the **Character Plan Action** phase.
Each action has a priority level. Higher priority actions will override lower priority actions.
All characters must wait until all characters have planned their actions before they can be performed.

Actions will be performed during the **Character Do Action** phase. 
Actions from other players (typically combat related) may prevent a player from performing their planned action.
Most actions end within the turn they are performed, though some may continue for several turns.

#### Move
Chooses a point on the map and moves towards it. Character will continue to move towards that point until:
- The target point is reached
- Run low on energy
- Interrupted by someone else
- Need to escape from a dangerous situation
- Small chance of stopping before target is reached 

#### Follow
Chooses a player in sight and moves towards them. Unlike move, only following only lasts for one turn. Following is more likely when there are less players.
 
#### Escape Characters/Terrain
Similar to move, but only activates when there is perceived danger. If out of bounds, character will always move towards teh center of the map.

#### Forage
Looks for food to regain health and energy. 
This actions takes 2 turns, and has a chance to fail. 
Foraging can only happen if the character is not aware of any nearby characters.
Items can be found after a successful forage.

#### Fight
See **Combat** 

#### Sleep
Sleeps for 5 to 8 hours and regain health and energy. Characters cannot fight back while asleep.

Sleeping can only start between hours of 22:00 and 4:00. Characters are more likely to sleep if they haven't slept in a long time.

#### Rest
Restores a significant amount of energy. 
Only happens when the character does not have sufficient energy to do anything else. 


## Combat
Combat takes place during the character action phase. 
When a character plans to fight, a target is chosen from their list of attackable players.

Before initiating combat, a check is done to make sure the target is still in range and alive. 
The attacker's turn is used up even if the target cannot be attacked.

The player that initiates the fight will strike first.

The target (also known as defender) can fight back if all the following conditions are met:
- The defender survived the initial attack
- The defender is aware of the attacker
- The defender is not incapacitated
- The attacker is in the defender's attack range
- The defender's fight limit has not been reached
- The attacker is still alive (attackers may be killed if the defender has a recoil effect)

If all those conditions are met, the defender will launch a counterattack.
If the defender has yet to perform their planned action, that action will be canceled (also known as interrupted), even if the defender cannot counterattack.

Certain effects will only activate when initiating an attack or fighting back.

Fight damage is calculated using this formula:
`Math.floor((Math.random() * tP.fightDmg / 2) + (Math.random() * tP.fightDmg / 2)) * tP.fightDmgB * oP.dmgReductionB`
Where `tP` is the player dealing the damage and `oP` is the player taking the damage. Damage dealt cannot exceed the opponent's current health.

The player dealing the damage will gain experience equal to the damage dealt. 
Experience will add to a player's `fightDmgB` using this formula: `Math.pow(1.1, exp/100)`

Killing an opponent will add to the player's kill count. Each kill also increases their `intimidation`.

Each player can fight a maximum of 3 times in a turn. Both attacking and defending will add to the count.
Once the limit is reached the player cannot fight back. However they can still initiate their planned attack if they haven't already.
This can be changed using the `turnFightLim` variable.


## Items
Items can be found after a successful forage. There are 2 categories of items: weapons and offhand items.
Items provide stat bonuses to the equipped player.

Items have limited durability (known internally as `uses`), which decreases when used. The item breaks once its durability reaches zero.
Weapon durability typically decreases when used during combat, while offhand items varies between items.

## Weapons

Weapons increases the damage dealt by modifying the player's damage bonus. 
As such weapons should have a fightDmgB stat that is greater than 1. Weapons that don't make up for it with other special effects.
A typical weapon should have multiplier between x1.1 and x1.3. 
Data for weapons are stored in `weapon_data`.

<details>
	<summary>**Weapon List**</summary>

### Generic weapons
Generic weapons are weapons without any special abilities outside of modifying the wielder's stats. 

### Lance
Similar to the generic weapons, but has a 1% chance of killing its user at the start of each turn.

### Rake
An extremely weak melee weapon, but does massive damage against leafs.

### Katana
Moderately strong melee weapon.
Has a 10% chance of landing a critical hit when attacking, which does x2 damage instead of the usual x1.2.
If the weapon has not landed a single crit, its final hit before breaking will be a super crit, which does x2.5 damage.

### Sniper Rifle
Extremely long ranged weapon. Has a 10% chance of landing a headshot for x2.5 damage. 
Unlike the katana, it does not have a guarenteed crit mechanic.

### Shotgun
Ranged weapon that does damage based on distance from the target. The closer the target are, the stronger the attack, scaling linearly.
Gets an additional damage boost if target is within 10% of max range.
If distance from target is further than 60% of max range, gains the ability to hit nearby players. 
Range for collateral damage increases as distance from main target increases.

Shotguns have 2 shells loaded at a time. Attacking uses up one shell. Once empty, the shotgun will need to be reloaded.
Reloading takes up one turn, and reloads 2 shells at once. Durability decreases only when reloading, not attacking.
Reloading can be done in the middle of combat, at the cost of doing no damage that turn. Combat effects from other sources may still activate.
Players may still attack and fight back with an empty shotgun, though it will have no stat bonuses and will act as an unarmed attack.


### Flamethrower
Unusually weak ranged weapon with a damage bonus of only x0.95, making it weaker than attacking unarmed.
Applys a burn effect to the target causing damage over time.
Nearby players also have a chance of being set on fire.
Has a chance of leaving a fire entity at the location of the main target, which may set other players and the terrain on fire.

### Ancient Staff
Unique magic weaon capable of casting four different spells. Spells have different power levels and inflicts different effects. 
Each spell type also has an stronger AoE variant that hits up to 8 additional players, at x1.5 times the rune cost.
Those caught in the AoE will be afflicted with weaker versions of said effects.

The spell types are as follows:
- **Smoke**
Inflicts a choke effect, which causes a damage over time and slightly reduces some stats.

- **Shadow**
Inflicts a blind effect, reducing visibility.

- **Blood**
Heals the caster for a percent of damage dealt.

- **Ice**
Freezes the target in ice, immobilizing them and causing a slight damage over time.

Initiating an attack against another player will Skull the attacker. Defending against an attack wil not cause a skull.

### Berserker
Strong melee weapon with a slight range bonus.
Applies a Berserk effect to the wielder upon equipping as well as at random times.
Damage increases based on wielder's aggro stat.

### Natasatsu Tenryou
Extremely strong melee weapon. Causes wielder to become extremely aggresive.

Heals its wielder based on damage dealt.Power increases after dealing damage and killing. 
Damages the wielder at the start of each turn. Self damage increases as attack power increases.

Applies an extremely strong aggressive charm effect to all players that see it. 
Charmed players will be drawn towards the wielder and forced to fight them.

When its wielder is killed by someone under its charm, it has a high chance of being passed onto the killer.
All accumulated power is retained when passed on.

Does not lose durability and cannot be replaced.

<details>
	<summary>Dev notes</summary>
	One of the weapons ported from the original Thunderdome. Originally its functions were scattered in several files. 
	Much of the very first update focused on putting all of those features into a single location. 
	A lot of the current Thunderdome is still built around the framework created for this weapon.
	In a way this single weapon has shaped the current Thunderdome.
</details>

### ol'Spicy Shinkai Makai
Extremely strong melee weapon. Has a chance of setting wielder on fire at the start of each turn.

Sets both its wielder and target on fire in combat. Target's burn is significantly stronger than the wielder's.

Wielder is immune to charm.

Does not lose durability and cannot be replaced.

</details>

## Offhand Items
### Bomb
### Trap
### Shield
### Ring of Recoil
### Vape
### Campfire
### Scrying Mirror

## Food 
A special category of offhand item. Can be consumed to restore health and energy.
Some food items have special effects of their own.

### Ebiroll
### Strength Potion
### Purple Sweets

## Status Effects

### Charm
### Trapped
### Berserk
### Peace
### Comfy
### Decoy
### Frozen
### Skulled
When killed, the killer will recieve all of the player's items and restore some health and energy. 

### DoT Effect
Damage over time effects damages the player, usually at the start of each turn.

---
### Burn
### Smoke
### Bleed

## Attributes

## Terrain
### Tree
### Mountain
### Water
### Fire

