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
Modifies likelihood of being attacked. maybe. come back later im still figuring this part out. See [Aggro](#Aggro).

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

### Rake 🧹
	Damage Bonus: x0.5
	Uses: 3
An extremely weak melee weapon, but does massive damage against leafs.

### Katana 
	Damage Bonus: x1.2
	Uses: 4 to 9
Moderately strong melee weapon.

Has a 10% chance of landing a critical hit when attacking, which does x2 damage.
If the weapon has not landed a single crit, its final hit before breaking will be a super crit, which does x2.5 damage.

<details>
	<summary>Dev notes</summary>
	The first weapon I created for the new Thunderdome. 
	Pretty simple and straight forward effect.
</details>

### Sniper Rifle
	Damage Bonus: x1.2
	Range Bonus: +40
	Sight Bonus: +20
	Uses: 3
Extremely long ranged weapon. Has a 10% chance of landing a headshot for x2.5 damage. 
Unlike the katana, it does not have a guaranteed crit mechanic.

<details>
	<summary>Dev notes</summary>
	I originally wanted this to be a generic weapon with a long attack range and a sight bonus stat and no special effects.
	I then had the impulse to give it the katana's crit effect. 
	Because of its increased range, I decided to do away with the guaranteed crit.
	I feel there needs to be more generic weapons so I'm not too happy that I had to make this, but I think it is absolutely appropriate for this weapon to get this effect.
	I am also really unhappy with how the sprite turned out. I try to make my sprites 25x25, which makes long weapons like this really hard to draw.
</details>

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

<details>
	<summary>Dev notes</summary>
	The second weapon I made. Came from a suggestion in chat for a gun that needs to be reloaded.
	The range based damage scaling and AoE was done on a whim to test the limits of the engine.
	It was a lot of work but the lessons learned from it are still being put to use.
	
	I had an idea to occasionally let the shotgun shoot napalm rounds that light players and terrain on fire.
	This has taken a backseat but I may still implement it one day.
	
	abe...
</details>

### Flamethrower
	Damage Bonus: x0.95
	Range Bonus: +20
	Uses: 8
Weak ranged weapon with a damage bonus of only x0.95, making it weaker than attacking unarmed.
Applies a burn effect to the target causing damage over time.
Nearby players also have a chance of being set on fire.

<details>
	<summary>Dev notes</summary>
	I didn't want the burn effect locked behind a single rare weapon, so a flamethrower is a nobrainer to include.
	
	The weapon used to also leave a fire entity on the ground. This has since been moved to the Shinkai Makai.
	
	I went through about 5 different designs for the sprite. None of them ended up looking very good at a small scale. 
	The current sprite has a bright pistol design, which doesn't scream flamethrower but is far more readable.
	Still not very satisfied with it.
</details>

### Ancient Staff
	Damage Bonus: Depends on spell
	Range Bonus: +24
	Uses: 60 runes
Unique magic weapon capable of casting four different Ancient spells. 
Spells have different damage bonuses and rune costs, and have different effects on hit.
Each spell type also has an stronger Barrage variant that hits up to 8 additional nearby players and deals increased damage at the cost of more runes.
Those caught in the AoE will be afflicted with weaker versions of spell effects.

Below are the four spell types. Damage and rune cost listed are for the Blitz(single target) variant. 
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

<details>
	<summary>Dev notes</summary>
	The initial idea for this item came about when I wanted to have some sort of freezing attack.
	The first thing that came to mind is to implement it as part of the Ice Barrage spell from Runescape. 
	It didn't seem appropriate to have just Ice Barrage on its own, and with how easy it is to develop status effects, I decided to include the remaining ancient spells and their AoE variants.	
	Being a notorious PKing spell, I figured it would be funny to have the caster be skulled.
		
	With almost 200 lines of code, this may be the most complex item in the game as of right now.
	Despite this, development was surprisingly straight forward. I had the idea on the backburner for over a month before starting so I had plenty of time to think about it.
	Smoke and Shadow spells inflicted basic stat modifying status effects, while the freeze effect is a modified trap effect and the Blood spell's life drain is taken straight from the Nanasatsu code.	
	The AoE code is taken from the flamethrower.
	I also love how the sprite for the weapon turned out.
	
	The main difficulty came from balancing.
	With 8 different attacks, AoE abilities, a self inflicted status effect and a unique durability system, there are many variables that needs to be tuned.
	The blind effect was something I was especially concerned about in the design phase. 
	Due to the way vision works, blindness is either completely useless or absolutely broken.
	In fact after doing some calculations on vision I decided that whole mechanic needs to be overhauled, but that is a different discussion.
		
	The Skull was another difficult effect. I wanted it to be part of the weapon but didn't know what to do with it. 
	I ended up designing it to be a debuff to justify making the weapon stronger.
	Passing the wielder's inventory to their killer was a bit of a last minute idea, and there are some niche situations that have not been fully tested.
	
	Overall the ancient staff didn't turn out to be as impactful as I hoped.
	Status effects just aren't noticeable in a large crowd.
	Sometimes I feel like I am developing features for a different game and this weapon is a perfect example of it.
	If I ever make a single player Thunderdome, this may be one of the strongest weapons.
</details>

### The Clanger
	Damage Bonus: x1.35
	Range Bonus: +5
	Uses: 3 to 8
Strong melee weapon with a slight range bonus.
Applies a [Berserk effect](#Berserk-😡) to the wielder upon equipping as well as at random times.
Damage increases based on wielder's aggro stat.

<details>
	<summary>Dev notes</summary>
	A weapon that I created on a whim when I saw I had an image of Gut's sword saved. 
	I was just wrapping up the first iteration of Hinamizawa syndrome at the time so I decided to stick the berserk effect on it just for fun.
	Turned out to be an extremely entertaining and destructive weapon with the speed burst and absurd damage.
</details>

### Nanasatsu Tenryou
	Damage Bonus: x2
	Aggro Bonus: +500
	Peace Bonus: -500
	Uses: Unlimited
Extremely strong melee weapon. Causes wielder to become extremely aggressive.

Heals its wielder based on damage dealt. Power increases after dealing damage and killing. 
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
	It is also the first item to incorporate a lot of newer features such as using an image for a sprite and inflicting status effects.
	In a way this single weapon has shaped the current Thunderdome.
	
	Pulling the weapon is a death sentence for its wielder and turns them into a blender.
	As the weapon is transfered on death, it will continue its slaughter until its self damage is too much for its wielder.
	
	I am very torn on this weapon. While it is a fun weapon, it is extremely chaotic and often results in at least a dozen casualties.
	The weapon lasts around 10 turns during which a lot of characters will focus on it.
	This is fine for larger games with over 80 characters but is disruptive for smaller games.
	It also causes characters to clump up, which I am trying to avoid.
</details>

### ol'Spicy Shinkai Makai
	Damage Bonus: x1.75
	Uses: Unlimited
Extremely strong melee weapon. Has a chance of setting wielder on fire at the start of each turn.

Sets both its wielder and target on fire in combat. Target's burn is significantly stronger than the wielder's.

Wielder is immune to charm.

Does not lose durability and cannot be replaced.

<details>
	<summary>Dev notes</summary>
	
	This was one of the original weapons I wanted to implement when first taking over the project.
	I had to first create the status effect framework before I can start development. 
	Once that is done, implementation was surprisingly simple.
	Balancing was a bit more tricky, as the burn effect was more powerful than expected.
	
	Unlike the Nanasatsu Tenryou, this weapon turned out to be very subtle. 
	While extremely strong, perhaps more so than its demonic counterpart, it does not have nearly the same impact on the game.
	I am considering moving some of the flamethrower's abilities onto this weapon instead.
	
	I originally planned to light the ground on fire when its wielder is killed, but that required updating the terrain system, which I didn't want to do at the time.
	By the time that update was completed I have dropped this idea.
	
	The sprite doesn't resemble its appearance in the show very much, but it shows off its fiery power much better. 
	I used some neat layer blending techniques to create the color gradient.
</details>

</details>

---

## Offhand Items
Offhand items provide support to their wielder.
They do this by boosting their stats, creating objects on the map, healing them and other effects.
Data for offhand items are stored in `offhand_data`.


<details>
<summary>Offhand Item List</summary>

### Generic offhand
Generic offhand items are items without any special abilities outside of modifying the wielder's stats.
The turn they use their durability is also specified.
Due to offhand items possessing more unique abilities, they are not as common.

### Bomb 💣
	Uses: 1
Wielder has a chance to plant a bomb at the end of their turn. 
When attacked, it has a chance of being knocked out of the wielder's hands and exploding immediately.
When killed the bomb is dropped, whereby it also explodes.

See [Bomb Entity](#bomb-entity) for more information.

### Trap 🕳
	Uses: 1
Wielder has a chance to plant a trap at the end of their turn. See [Trap Entity](#trap-entity) for more information.

### Ring of Recoil
	Damage Taken: x0.75,
	Uses: 10hp
When taking damage from another character, absorbs 25% of incoming damage and reflects it back.
Damage reduction applies even when damage is not reflected, without reducing durability.

### Vape
	Peace Bonus: +40,
	Visibility Bonus:-20,
	Uses: 1
	Vape radius: 24
Passively applies a [Peace](#peace) to everyone in vape range. When in danger from other characters, it creates a [Decoy](#decoy-entity), upon which the item breaks.
When the decoy is destroyed, it inflicts a choke effect on all nearby characters.

### Campfire
	Uses: 1
Wielder has a chance to set up a campfire at the end of their turn. Can only be used between the hours of 20 and 5. See [Campfire Entity](#campfire-entity) for more information.

### Scrying Mirror
	Uses: 1
Teleports the wielder when activated.
Characters will teleport when:
- in dangerous terrain terrain (defensive)
- too many hostile characters around (defensive)
- low on health after a fight (defensive)
- aggressive and haven't fought in a while (aggressive)
- randomly chosen (neutral)

The destination is usually randomly chosen and can be anywhere on the map. 
The mirror will try to put the wielder in bounds, but is not guaranteed.
If the destination is out of map bounds, the character is considered to have teleported into space and dies instantly.

Certain characters can choose their destination. 
These are characters with certain attributes, such as magic or demon, or characters wielding the Nanasatsu Tenryou.
There are 3 types of teleport types depending on what caused them to want to teleport: aggressive, defensive and neutral.
The chosen teleport type will align with the player's goals.
Nanasatsu Tenryou will teleport aggressively unless the player also has a valid attribute.

<details>
	<summary>See below for details on how the destination is selected</summary>
	
	### Random Teleport
	Teleport to a random location. Used by characters that cannot choose their destination.
	
	Select a random set of coordinates.
	If the coordinates is out of the safe bounds, a new set of coordinates is generated.
	Up to 5 coordinates are generated, after which the player is teleported regardless of where it leads.
	
	### Aggressive Teleport
	Teleports to a character. 
	
	Select a random living character. 
	If the coordinates is out of the safe bounds, a new character is selected.
	Cannot select oneself, unless they are the last character alive.
	Up to 10 characters are selected, after which the player is teleported regardless of where it leads.
	
	### Defensive Teleport
	Teleports to a safe area without nearby characters. 
	
	Select a random set of coordinates.
	If the terrain at the destination is safe, and amount of characters in a 25 unit radius is less than an alloted amount, the destination is considered safe.
	If the destination is not safe, a new set of coordinates is generated.
	Up to 15 coordinates are generated. The alloted amount of characters increases with more tries.
	If a safe destination is not found after 15 tries, the player is teleported to the center of the map.
	
	### Neutral Teleport
	Teleports to a safe area. 
	
	Select a random set of coordinates. 
	If the coordinates is out of the safe bounds or has unsafe terrain, a new set of coordinates is generated.
	Up to 10 coordinates are generated, after which the player is teleported regardless of where it leads.
	
</details>

There is a chance for the mirror to break when attacked, which drops [half the mirror](#mirror-entity) on the ground. 
The remaining half in the character's hand works the exact same. Mirrors cannot be broken more than once.
</details>

---

## Food 
A special category of offhand item. Can be consumed to restore health and energy.
Only one food can be consumed per turn.
Some food items have special effects of their own.
Data for food are stored in `food_data`.
<details>
<summary>Food List</summary>

### Generic food
Generic food items simply restore the player's health and energy by a specified amount.
They do not have any other effects.

### Ebiroll
	Heal: 30hp
Has a 50% chance to deal 1 to 10 damage instead of healing. 

### Strength Potion
Does not heal anything, but rather inflicts a strength status effect, increasing character's damage dealt.

### Purple Sweets
	Uses: 5 to 10
	Heal: 1hp
	Energy Restored: 5ep
Heals very little, but can be eaten upon taking damage. Due to the way deaths are handled, it allows the player to survive attacks that will otherwise kill them.
Cannot save the player from overkill damage.

</details>

---

# Status Effects
Status effects are temporary effects on a character. 
These effects include stat changes, damage over time, immobilization and behavior modification.

Status effects have a level that is used to determine the potency of the effect as well as how it stacks. 
The level is of the effect is based on its source.

Most status effects wear off after a set duration, though some wear off based on other variables.

### Stacking
If a character is inflicted with a status effect they already have, it attempts to stack.
Stacking behaves differently based on effect. Generally there are 2 methods of stacking: 
	- Increase the power and/or duration of the effect based on the power of the new effect
	- Override the current effect if it has a higher level, otherwise do nothing. This is the default stacking behavior.
Some status effects cannot be stacked at all.

<details>
<summary>Status Effect List</summary>
Stat Bonuses below assumes effect level will be between 1 and 10.

### Generic Status Effect
Generic status effects simply provide state changes. 
The higher the level the greater the stat changes. 
They stack by increasing the level of the effect, which in turn increases their power.

### Charm 💗
	Damage Taken: x1.1
Forces the player to follow the targeted character as long as they are insight. Chance to follow increases with level.
There is a second variant that also forces the player to attack the target.
Stacks by overriding lower level charm. The greater the difference in level the higher the chance of it being replaced.

### Trapped 🕳
While trapped, player takes constant damage and cannot move. 
The only action they can perform is attempt to escape.
Each escape attempt uses up energy. 
If the player has no energy left, they take extra damage.
This effect will only wear off when the player escapes and cannot be stacked.

### Berserk 😡
	Aggro Bonus: 20 to 200
	Damage Bonus: x1.01 to x1.2 (see below)
	Damage Taken: x1.01 to x1.2
	Speed Bonus: x1.5
Damage dealt is further increased based on % of health left.
Gains a further x1.05 damage bonus when fighting their chosen target for the turn.

Will always choose to fight if there are characters in range.
If no one is in attack range, will follow a character in sight.

### Peace ☮
	Peace Bonus: 20 to 200
	Damage Taken: x0.99 to x0.8 (see below)
Damage taken is further reduced based on the amount of turns since the last fight. This caps at a further x0.2 reduction at 10 turns.
	
### Comfy
	Peace Bonus: 20 to 200
	Damage Taken: x0.99 to x0.8 (see below)
Applied by a [campfire](#campfire-entity). Has all of Peace's effects. In addition, player gets passive healing as long as they are not fighting. 
Healing is increased while resting and greatly increased while sleeping.

### Decoy
Can only be applied from a [decoy entity](#decoy-entity). Forces the player to see the decoy instead of the real target. 
Cannot be stacked. A single player can have multiple decoy effects for different players.

going to be reworked

### Frozen 🧊
	Damage Taken: x0.5
	Damage per Turn: 0 to `2 * level`
Freezes the player in place and cause them to take damage.
Stacks by increasing the level and duration based on the new freeze.

Attempting to apply burn while frozen will instead decrease the duration of the freeze based on the level of the burn.


### Skulled
	Visibility: +50
	Aggro Bonus: +30
	Intimidation Bonus: +50
	Damage Taken:: x1.1
When killed, the killer will receive all of the player's items and restore some health and energy. Stacking increases the duration with the one from the new effect.

</details>

---
## DoT Effect
Damage over time effects damages the player, usually at the start of each turn.
Damage is dealt within a given range often based on the effect's level.
Characters killed by a DoT counts as a kill for the player that inflicted it, if there is one.

<details>
<summary>DoT List</summary>

### Burn 🔥
	Damage per Turn: 1 to `1 * level`
	Visibility: +10
Extinguished upon entering water terrain. If a higher level burn is applied, it overrides the current burn, including the owner. 
Burns with a lower level will increase the current burn's level and duration.

Attempting to apply freeze while burning will instead decrease the duration of the burn based on the level of the freeze.

### Smoke 🚬
	Sight Bonus: -10 to - 210
	Damage Bonus: x0.95 to x0.5  
	Speed Bonus: x0.95 to x0.5 
	Damage per Turn: 2 to `2 + level/2`
A damage over time effect that also provides a few stat debuffs.
	
### Bleed 🩸
	Damage per Turn: 1 to 5 (see below)
A DoT effect that starts weak but becomes increasingly dangerous over time and especially when stacked.
The max damage increases by x1.2 at the start of each turn.  
This effect has no set duration. 
Instead there is a chance for it to wear off at the start of each turn.
The chance to wear off depends on the level, starting at 30% at level 1 and decreasing by 1.5% per level.

Stacking bleed increases its damage and makes it harder to wear off.
The both max damage and level increases by the level of the new bleed.
<details>
	<summary>Dev notes</summary>
	Originally designed for the PaperMaster's unique paper items. It's supposed to represent paper cuts from their paper attacks. 
	I based this off the Bleed effect from the Shadow Hydra boss in Adventure Quest. 
	It was notorious for stacking bleeds that grows exponentially in power which shredded everyone's low Endurance builds back in the day.
</details>


</details>

---
## Hinamizawa Syndrome 
A special status effect meant to encourage aggression as the game continues. 
Can only be manually applied by using the `HAUAU()` function. 
Once inflicted it cannot be removed.

Hinamizawa Syndrome consists of 5 levels, each providing more effects.
It has a Rage counter which increases from various situations the player finds themselves in.
When the counter reaches 100%, the status upgrades to the next stage and the counter resets back to 0.
At Level 5, the player is inflicted with a [Berserk effect](#berserk) instead of leveling up.

Stacking Hinamizawa Syndrome increases the counter by 25% for each level of the new effect.
The `HAUAU()` function can be used to accelerate the effect on all characters.

<details>
	<summary>Level effects</summary>
	### Universal Effects
	### Level 1
	### Level 2
	### Level 3
	### Level 4
	### Level 5

</details>

---

# Attributes
<details>
<summary>Attribute List</summary>


</details>

---

# Doodads
Doodads (also known as entities) are non player objects that appear on the map.
They have effects that can be triggered by characters within their activation range.
Each doodad has its own activation range and trigger probability. A doodad's owner may have a different chance to trigger.
Some doodads can be triggered by multiple characters per turn.

Doodads updates take place after all players performed their actions, and before terrain updates

Some doodads can move about the map.
These doodads will move around randomly, or towards a planned target, and can interact with terrain.

<details>
<summary>Doodad List</summary>
### Bomb
### Trap
### Fire
### Campfire
### Decoy
this thing is probably getting taken out so im not writing anything for it

### Duck

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
Below are some general utility functions used in various places.

**`roll_range(min, max)`**
Chooses a random integer between `min` and `max` (inclusive)

**`roll(options)`**
A weighted roll 

**`round_dec()`**

**`log_message(msg, msg_level=0)`**
Displays msg in the console. You can stop them from displaying by toggling the show_msg variable, or filter them by show_level. not that i ever use these features

**`hypD()`**

**`playerDist(tP, oP)`**
Gets the distance between 2 characters. 
Distances between all players are calculated at the start of the game and stored in a table.
When a player moves the game calculates distances from all other players again and updates the table.
When the `playerDist` function is called it retrieves the stored value from the table.
