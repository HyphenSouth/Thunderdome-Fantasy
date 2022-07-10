*Information in this readme may not be up to date.*

# Main
Thunderdome Fantasy is a Hunger Games style battle royale simulation that allows your favorite anime characters to fight to the death.

# Gameplay

## Preparation
Terrain can be generated before game starts.

## Turn
Thunderdome Fantasy takes place over a series of turns. Each turn represents one hour.

The player list is shuffled at the start of a turn. 
Player actions will be processed in order of the player list.

A turn consists of the following phases:

- Planning
- Action
- Doodad Update
- Terrain Update	
- Limit Check
- Status Tables Updates

### Planning Phase
During the planning phase all characters will do the following:
1. Activate all turn start effects
2. Check surroundings
	- Get players in sight (see [Checking Surroundings](#Checking-Surroundings))
	- Get players in attack range (see [Checking Surroundings](#Checking-Surroundings))
	- Get attackable players (see [Checking Surroundings](#Checking-Surroundings))
3. Plan next action (Planning Actions)

### Action Phase
During the action phase all characters will do the following:
1. Perform their planned actions
2. Activate all turn end effects

### Limit Check Phase
Ensure that character stats are within limits.

If health is below 0, the character dies.

Characters with `NaN` health, energy or coordinates are killed as a failsafe.

---

# Character
Characters interact with each other throughout the game. 
The last character alive is the winner.

Characters are generated from data when the game starts.
All characters are stored in the `playerStatic` list, which never changes. 
The `players` list contains all living characters.
The `players` list is shuffled at the start of each turn. 
Character actions are executed in order of the list.
When a character dies they are removed from the `players` list and placed in the `dedPlayers` list.

## Morality and Personality
Characters have a moral and personality. 
This can be preset during preparation, or randomly generated during creation.

### Morals 
- Lawful (L): +75 [Peace Bonus](#Bonus-Stats)
- Neutral (N): No effects
- Chaotic (C): +100 [Aggro Bonus](#Bonus-Stats)

### Personality 
- Good (G): -20 [Intimidation](#Bonus-Stats)
- Neutral (N): No effects
- Evil (E): +10 [Intimidation](#Bonus-Stats)

## Base Stats
Characters have a set of stats that affect their performance. 

Default character stats:

**Max Health**
Maximum health a character can have.
Default 100

**Max Energy**
Maximum energy a character can have.
Default 100

**Sight Range**:
Distance a character can see. See [Checking Surroundings](#Checking-Surroundings).
Default 200.

**Visibility**:
How likely it is for a player to be seen. See [Checking Surroundings](#Checking-Surroundings).
Default 100.

**Fight Range**:
Distance a character can attack. 
Default 24.

**Fight Damage**:
Max damage dealt when armed. See [Combat Damage](#Checking-Surroundings).
Default 25.

**Move Speed**:
Max distance a player can move in a single turn.
Default 25.


## Bonus Stats
In addition, there are several bonus stats that modify existing stats by adding or multiplying. 
Bonus stats come from Items, Status Effects, Attributes and Terrain.

Bonus stats are applied at the start of each round and during certain actions.

Bonus stats have a default of 0 for additive stats, and 1 for multiplicative stats.

**Sight Range Bonus**:
Adds onto sight range to modify vision range.

**Visibility Bonus**:
Adds onto visibility to modify chance of being seen.

**Fight Range Bonus**:
Adds onto fight range to modify fight distance.

**Fight Damage Bonus**:
Multiplies to the base damage rolled to modify damage. Weapons use this stat to deal damage.

**Damage Reduction Bonus**:
Multiplies onto incoming damage to modify damage taken. Certain damage sources such as AoE ignore this stat.

**Move Speed Bonus**:
Multiplies onto move speed to modify distance the player can move.

**Aggro Bonus**:
Adds to aggro chance when calculating aggro. See [Aggro](#Aggro).

**Peace Bonus**:
Adds to peace chance when calculating aggro. See [Aggro](#Aggro).

**Intimidation Bonus**:
Modifies likelihood of being attacked. See [Aggro](#Aggro).

## Checking Surroundings
Players check their surroundings for other characters at the start of a turn. This determines who they can follow and attack.

### Awareness Check
Characters have a maximum vision range determined by adding their Sight Range and Sight Range Bonus stats.
The player's fight range also increases this range slightly.

All players within that range have a chance to be seen, which increases exponentially as their distance the player decreases.
Higher visibility will also increase that chance and vice versa. 

Upon seeing a character they are added into the player's `awareOf` list. It also trigger the seen player's `opAware` flag.

Awareness check does not occur if the character is in an unaware state.

<details>
<summary>Awareness Formula</summary>

`Math.pow((Math.random()*(op_vis/100)),1/3) * (tp_sight - tp_fight) > dist - tp_fight`

Where `op_vis` is the seen character's visibility, 
`tp_sight` is the player's max vision range, 
`tp_fight` is the player's max fight range and
`dist` is the distance between the two characters.
</details>

### Range Check
All characters that are within fight range AND seen by the player will be considered in range. 
Therefore, only characters that have passed the character's Awareness Check will be considered for the Range Check.

Upon characters in range are added into the player's `inRangeOf` list. It also trigger the seen player's `opInRange` flag.

Range Check does not occur if the character is in an incapacitated state.

### Attackable Check
All characters in attack range have an aggro check performed on them. 
Those who pass the check are added into the player's `attackable` list.

As the Range Check is not performed when incapacitated, the Attackable Check will also not be performed.

See the Aggro section below for details on the aggro check.

## Aggro
An aggro check is done to see if a player wants to attack a character. 
Aggro checks are only done for characters in the player's attack range.

The check is done through a weighted roll using the following steps
1. Both fight and peace options start with a initial weight of 50
2. Player's aggro and peace bonus stats are added to their respective weights
3. Compare the player's personality with the opponent's
	- If they have the same personality, +40 peace weight and -20 fight weight
	- If they have the opposite personalties, -20 peace weight and +40 fight weight
4. Apply intimidation bonus somehow im still figuring this part out
5. Neither weights can be less than 1
6. Roll with the weights


## Planning Actions
Characters will choose an action to perform during the **Planning Phase**.
Each action has a priority level. Higher priority actions will override lower priority actions.
Characters must wait until all other characters have planned their actions before they can be performed.

Priority levels depend on the type of action:
- 0   : no action
- 1-5 : regular actions (movement, foraging, etc.)
- 6-10 : self serving actions (fight, escape, etc.)
- 11-19 : mind controlling actions (charm, etc.)
- 20+ : physically disabling actions (frozen, trapped, etc.)

### Planning Process:
Actions are planned based on the current state of the player.
Number in parenthesis is the priority of the action.

- Action already set from previous turn: Continue action. Action priority should carry over from previous turn.
- Less than 0 energy: Rest (20)
- Out of bounds: Move towards center of map (9)
- Low on energy and terrain is safe: Forage (2 to 17, based on energy left)
- Low on health and unaware of anyone and terrain is safe: Forage (2)
- Terrain is dangerous: Terrain escape(7)
- Too many dangerous players nearby: Player escape(6)
- No actions set: Choose one of:
	- Move (1)
	- If night time: Sleep (3 to 21, based on last slept)
	- If aware of others: Follow (1)
	- If has attackable characters: Fight (6)
Items and status effects on player can also set planned actions with varying priorities.

## Actions
Actions will be performed during the **Character Action** phase. 
Actions from other players (typically combat related) may prevent a player from performing their planned action.
Most actions end within the turn they are performed, though some may continue for several turns.

Below are the default actions a character can perform. 
Items, status effects and attributes may come with their own actions.

### Move
Chooses a point on the map and moves towards it. Character will continue to move towards that point until:
- The target point is reached
- Run low on energy
- Interrupted by someone else
- Need to escape from a dangerous situation
- Small chance of stopping before target is reached 

### Follow
Chooses a player in sight and moves towards them. Unlike move, only following only lasts for one turn. Following is more likely when there are less players.
 
### Escape Characters/Terrain
Similar to move, but only activates when there is perceived danger. If out of bounds, character will always move towards teh center of the map.

### Forage
Looks for food to regain health and energy. 
This actions takes 2 turns, and has a chance to fail. 
Foraging can only happen if the character is not aware of any nearby characters.
Items can be found after a successful forage.

### Fight
See [Combat](#Combat)

### Sleep
Sleeps for 5 to 8 hours and regain health and energy. Characters cannot fight back while asleep.

Sleeping can only start between hours of 22:00 and 4:00. Characters are more likely to sleep if they haven't slept in a long time.

### Rest
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

Killing an opponent will add to the player's kill count. Each kill also increases their `intimidation`.

Each player can fight a maximum of 3 times in a turn. Both attacking and defending will add to the count.
Once the limit is reached the player cannot fight back. However they can still initiate their planned attack if they haven't already.
This can be changed using the `turnFightLim` variable.

### Combat Damage
Fight damage is calculated using this formula:
`Math.floor((Math.random() * tP.fightDmg / 2) + (Math.random() * tP.fightDmg / 2)) * tP.fightDmgB * oP.dmgReductionB`
Where `tP` is the player dealing the damage and `oP` is the opponent taking the damage. 
Damage dealt cannot exceed the opponent's current health.

The player dealing the damage will gain experience equal to the damage dealt. 
Experience will add to a player's `fightDmgB` using this formula: `Math.pow(1.1, exp/100)`

Certain items have an AoE effect. 
The AoE attacks are typically done before the main attack. 
Most AoE attacks ignore damage reduction bonuses, do not give experience, and interrupt actions. 
Implementation of AoE attacks vary and may not follow all these rules.

---


# Items
Items can be found after a successful forage. There are 2 categories of items: weapons and offhand items.
Items provide stat bonuses to the equipped player.

Items have limited durability (known internally as `uses`), which decreases when used. The item breaks once its durability reaches zero.
Weapon durability typically decreases when used during combat, while offhand items varies between items.

## Weapons

Weapons increases the damage dealt by modifying the player's damage bonus. 
As such weapons should have a fightDmgB stat that is greater than 1. Weapons that don't make up for it with other special effects.
A standard weapon should have multiplier between x1.1 and x1.3. 
Data for weapons are stored in `weapon_data`.

<details>
<summary>Weapon List</summary>

### Generic weapons
Generic weapons are weapons without any special abilities outside of modifying the wielder's stats. 

### Lance 🔱
	Damage Bonus: x1.3
	Uses: 4 to 9
Similar to the generic weapons, but has a 1% chance of killing its user at the start of each turn.

### Rake
	Damage Bonus: x0.5
	Uses: 3
An extremely weak melee weapon, but does massive damage against leafs.

### Katana 🧹
	Damage Bonus: x1.2
	Uses: 4 to 9
Moderately strong melee weapon.

Has a 10% chance of landing a critical hit when attacking, which does x2 damage.
If the weapon has not landed a single crit, its final hit before breaking will be a super crit, which does x2.5 damage.

### Sniper Rifle
	Damage Bonus: x1.2
	Range Bonus: +40
	Sight Bonus: +20
	Uses: 3
Extremely long ranged weapon. Has a 10% chance of landing a headshot for x2.5 damage. 
Unlike the katana, it does not have a guaranteed crit mechanic.

### Shotgun
	Damage Bonus: x1.05 to x2.5 (depends on range)
	Range Bonus: +25 (max range)
	Uses: 3 to 6 (2 shells counts as 1 use)
Ranged weapon that does damage based on distance from the target. The closer the target are, the stronger the attack, scaling linearly.
Gets an additional damage boost if target is within 10% of max range.
If distance from target is further than 60% of max range, gains the ability to hit nearby players. 
Range for collateral damage increases as distance from main target increases.

Shotguns have 2 shells loaded at a time. Attacking uses up one shell. Once empty, the shotgun will need to be reloaded.
Reloading takes up one turn, and reloads 2 shells at once. Durability decreases only when reloading, not attacking.
Reloading can be done in the middle of combat, at the cost of doing no damage that turn. Combat effects from other sources may still activate.
Players may still attack and fight back with an empty shotgun, though it will have no stat bonuses and will act as an unarmed attack.


### Flamethrower
	Damage Bonus: x0.95
	Range Bonus: +20
	Uses: 8
Weak ranged weapon with a damage bonus of only x0.95, making it weaker than attacking unarmed.
Applies a burn effect to the target causing damage over time.
Nearby players also have a chance of being set on fire.
Has a chance of leaving a fire entity at the location of the main target, which may set other players and the terrain on fire.

### Ancient Staff
	Damage Bonus: Depends on spell
	Range Bonus: +24
	Uses: 60 runes
Unique magic weapon capable of casting four different Blitz spells. 
Spells have different damage bonuses and rune costs, and have different effects on hit.
Each spell type also has an stronger Barrage variant that hits up to 8 additional nearby players and deals increased damage at the cost of more runes.
Those caught in the AoE will be afflicted with weaker versions of spell effects.

Below are the four spell types. Damage and rune cost listed are for the Blitz variant. 
Barrage spells deal an additional x1.1 damage and have a x1.5 rune cost:

#### Smoke
	Damage Bonus: x1.2
	Rune Cost: 5
Inflicts a choke effect, which causes a damage over time and slightly reduces some stats.

#### Shadow
	Damage Bonus: x1.4
	Rune Cost: 8
Inflicts a blind effect, reducing visibility.

#### Blood
	Damage Bonus: x1.5
	Rune Cost: 12
Heals the caster for a percent of damage dealt. More likely to be chosen when low on health.

#### Ice
	Damage Bonus: x1.7
	Rune Cost: 15
Freezes the target in ice, immobilizing them and causing a slight damage over time.

Initiating an attack against another character will Skull the attacker. 
Defending against an attack does not cause a skull.

### The Clanger
	Damage Bonus: x1.35
	Range Bonus: +5
	Uses: 3 to 8
Strong melee weapon with a slight range bonus.
Applies a Berserk effect to the wielder upon equipping as well as at random times.
Damage increases based on wielder's aggro stat.

### Nanasatsu Tenryou
	Damage Bonus: x2
	Aggro Bonus: +500
	Peace Bonus: -500
	Uses: Unlimited
Extremely strong melee weapon. Causes wielder to become extremely aggressive.

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
	Damage Bonus: x1.75
	Uses: Unlimited
Extremely strong melee weapon. Has a chance of setting wielder on fire at the start of each turn.

Sets both its wielder and target on fire in combat. Target's burn is significantly stronger than the wielder's.

Wielder is immune to charm.

Does not lose durability and cannot be replaced.

</details>

---

## Offhand Items
<details>
<summary>Offhand Item List</summary>

### Bomb
### Trap
### Shield
### Ring of Recoil
### Vape
### Campfire
### Scrying Mirror
</details>

---

## Food 
A special category of offhand item. Can be consumed to restore health and energy.
Some food items have special effects of their own.
<details>
<summary>Food List</summary>

### Ebiroll
### Strength Potion
### Purple Sweets
</details>

---

# Status Effects

<details>
<summary>Status Effect List</summary>

### Charm
### Trapped
### Berserk
### Peace
### Comfy
### Decoy
### Frozen
### Skulled
When killed, the killer will receive all of the player's items and restore some health and energy. 
</details>

---
## DoT Effect
Damage over time effects damages the player, usually at the start of each turn.
<details>
<summary>DoT List</summary>

### Burn
### Smoke
### Bleed
</details>

---

# Attributes
<details>
<summary>Attribute List</summary>


</details>

---

# Doodads
Doodads (also known as entities) are non player objects that appear on the map. 
<details>
<summary>Doodad List</summary>


</details>

---

# Map
## Terrain
<details>
<summary>Terrain List</summary>

### Tree
### Mountain
### Water
### Fire
</details>

---

# Meta
Below are some general functions used in various places.

**`roll_range(min, max)`**
Chooses a random integer between `min` and `max` (inclusive)

**`roll(options)`**
A weighted roll 

**`log_message()`**

**`round_dec()`**

**`log_message()`**

**`hypD()`**

**`playerDist(tP, oP)`**
Gets the distance between 2 characters. 
Distances between all players are calculated at the start of the game and stored in a table.
When a player moves the game calculates distances from all other players again and updates the table.
When the `playerDist` function is called it retrieves the stored value from the table.
