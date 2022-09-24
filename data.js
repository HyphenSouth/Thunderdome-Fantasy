var attr_data = {
		"cunny": Cunny,
		"bong": Bong,
		"melee": Melee,
		"ranger": Ranger,
		"magic": Magic,
		"bigguy": BigGuy,
		"butai": Butai,
		"meido": Meido,
		"paper": PaperMaster,
		"ninja": Ninja,
		"gauron": Gauron,
		"toji": Toji,
		"aids": AidsAttr,
		"band": Band,
		"kurt": Kurt,
}

// attr
function create_attr(attr_name, player){
	switch(attr_name){
		case "nenene":
			let nenenames = ['Nenene']
			let temp_nenename = "Nenene"
			for(let i=0; i<8; i++){
				temp_nenename = temp_nenename+"ne"
				nenenames.push(temp_nenename)
			}
			return new NameSwap('nenene', player, nenenames, true);
			break;	
		case "joshiraku":
			let joshiraku_imgs = [
				'https://cdn.myanimelist.net/images/characters/7/173549.jpg',
				'https://cdn.myanimelist.net/images/characters/13/145959.jpg',
				'https://cdn.myanimelist.net/images/characters/13/149113.jpg',
				'https://cdn.myanimelist.net/images/characters/5/177655.jpg',
				'https://cdn.myanimelist.net/images/characters/6/177653.jpg'
			]
			return new ImgSwap('joshiraku', player, joshiraku_imgs, true);
			break;				
		case "fine":
			let fine_imgs = [
				'https://cdn.myanimelist.net/images/characters/7/153361.jpg',
				'https://cdn.discordapp.com/attachments/998843166138572821/998848743195541544/85247717b553c5cd3cb94be297def926.png'				
			]
			let fine_names = [
				'Ryouko','Fine'
			]
			return new ProfileSwap('fine', player, fine_imgs,fine_names, true, true, false);
			break;
		case "puchi":
			let puchi_imgs = [
				'https://cdn.myanimelist.net/images/characters/5/242497.jpg',
				'https://cdn.myanimelist.net/images/characters/16/249335.jpg',
				'https://cdn.myanimelist.net/images/characters/7/243273.jpg',
				'https://cdn.myanimelist.net/images/characters/9/243031.jpg',
				'https://cdn.discordapp.com/attachments/998843166138572821/1009613528585486397/1584302796574.png',
				'https://cdn.myanimelist.net/images/characters/3/244887.jpg',
				'https://cdn.myanimelist.net/images/characters/9/243271.jpg',
				'https://cdn.myanimelist.net/images/characters/11/245881.jpg',
				'https://cdn.myanimelist.net/images/characters/7/245885.jpg',
				'https://cdn.myanimelist.net/images/characters/5/242495.jpg',
				'https://cdn.myanimelist.net/images/characters/12/249377.jpg',
				'https://cdn.myanimelist.net/images/characters/6/243891.jpg',
				'https://cdn.myanimelist.net/images/characters/9/247897.jpg',
				'https://cdn.myanimelist.net/images/characters/5/245347.jpg'
			]
			let puchi_names = [
				'Harukasan',
				'Afu',
				'Yukipo',
				'Yayo',
				'Takanya',
				'Miurasan',
				'Makochi',
				'Smol Shart',
				'Smol Fart',
				'Io',
				'Chihya',				
				'Chicchan',				
				'Chibiki',				
				'PiyoPiyo'		
			]
			return new ProfileSwap('puchi', player, puchi_imgs,puchi_names, true, true, false);
			break;
		case "im@s":
			let idol_imgs = [
					'https://cdn.myanimelist.net/images/characters/13/425143.jpg',
					'https://cdn.myanimelist.net/images/characters/14/140081.jpg',
					'https://cdn.myanimelist.net/images/characters/11/134645.jpg',
					'https://cdn.myanimelist.net/images/characters/4/117962.jpg',
					'https://cdn.discordapp.com/attachments/998843166138572821/1009615366739197982/unknown.png',
					'https://cdn.discordapp.com/attachments/998843166138572821/1009615516287127552/d7059e448a885ff0b350edc420005eba.jpg',
					'https://cdn.myanimelist.net/images/characters/14/193795.jpg',
					'https://cdn.myanimelist.net/images/characters/16/134635.jpg',
					'https://cdn.myanimelist.net/images/characters/3/139929.jpg',
					'https://cdn.myanimelist.net/images/characters/13/126935.jpg',
					'https://cdn.myanimelist.net/images/characters/13/118310.jpg',
					'https://cdn.myanimelist.net/images/characters/6/118317.jpg',
					'https://cdn.myanimelist.net/images/characters/14/140079.jpg',
					'https://cdn.myanimelist.net/images/characters/5/298464.jpg',
			]
			let idol_names = [
				'Haruka',
				'Takane',
				'Yayoi',
				'Azusa',
				'Anal',
				'Chihaya',
				'Makoto',
				'Miki',
				'Yukiho',
				'Hibiki',
				'Fart',
				'Shart',
				'Ritsuko',
				'Kotori',
			]
			return new ProfileSwap('im@s', player, idol_imgs,idol_names, true, true, false);
			break;
		default:
			if(attr_name in attr_data){
				return new attr_data[attr_name]( player)
			}
			return new Attr(attr_name, player)
			break;
	}
}

//items

//weapon
var weapon_data = {
	"lance" : {
		"icon":"🔱",
		"dmg_type":"melee",
		"fightBonus":1.3,
		"uses":[4,9],
		"class": Lance
	},
	"gun" : {
		"icon":"🔫", 
		"dmg_type" : "ranged",
		"rangeBonus" : 20,
		"fightBonus" : 1.3,
		"uses" : 4		
	},	
	"bow" : {
		"icon":"🏹", 
		"dmg_type" : "ranged",
		"rangeBonus" : 30,
		"fightBonus" : 1.1,
		"uses" : 10		
	},
	"knife" : {
		"icon":"🔪", 
		"dmg_type" : "melee",
		"fightBonus" : 1.1,
		"uses" : [5,10]	
	},		
	"guitar" : {
		"icon":"🎸", 
		"dmg_type" : "melee",
		"fightBonus" : 1.5,
		"uses" : 1
	},		
	"wand" : {
		"icon" : "./icons/wand.png",
		"icon_type" : "img",
		"dmg_type" : "magic",
		"fightBonus" : 1.1,
		"rangeBonus" : 24,
		"uses" : [3,6]	
	}	,
	"nanasatsu" : {
		"icon" : "./icons/nanasatsu.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 2,
		"peaceBonus" : -500,
		"aggroBonus" : 500,
		// "dmgReductionB" : 1.05,
		"uses" : 99999,
		"class": Nanasatsu
	},
    "katana" : {
		"icon" : "./icons/katana.png",
		"icon_type" : "img",
		"dmg_type":"melee",
		"uses":[4,9],
		"class": Katana
	},
    "shotgun" : {
		"icon" : "./icons/shotgun.png",
		"icon_type" : "img",
		"rangeBonus" : 25,
		"dmg_type":"ranged",
		"uses":[3,6],
		"class": Shotgun
	},
	"spicy" : {
		"icon" : "./icons/spicy.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 1.75,
		"uses" : 99999,
		"class": Spicy
	},
	"clang" : {
		"icon" : "./icons/clang.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"rangeBonus" : 5,
		"fightBonus" : 1.35,
		"intimidationBonus" : 20,
		"uses" : [3,8],
		"class": Clang	
	},
	"flamethrower" : {
		"icon" : "./icons/flamethrower.png",
		// "icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "ranged",
		"rangeBonus" : 10,
		"fightBonus" : 0.95,
		"uses" : 8,
		"class": Flamethrower	
	},
	"sniper" : {
		"icon" : "./icons/sniper.png",
		"icon_type" : "img", 
		"dmg_type" : "ranged",
		"rangeBonus" : 40,
		"sightBonus" : 20,
		"uses" : 3,
		"class": Sniper		
	},
	"ancient" : {
		"icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "magic",
		"rangeBonus" : 24,
		"uses" : 60,
		"class": Ancient	
	},
	"rake" : {
		"icon" : "🧹",
		"dmg_type" : "melee",
		"uses" : 3,
		"class": Rake
	},
	"cross" : {
		"icon" : "✝️",
		"dmg_type" : "magic",
		"uses" : 4,
		"class": Cross
	}
}

function create_weapon(weapon_name){
	if(weapon_name in weapon_data){
		if('class' in weapon_data[weapon_name]){
			return new weapon_data[weapon_name]['class']()			
		}
		else{
			return new Weapon(weapon_name);
		}
	}
	return '';
	// switch(weapon_name){
		// case "Nothing":
			// return "";
			// break;
		// case "nanasatsu":
			// return new Nanasatsu();
			// break;		
		// case "lance":
			// return new Lance();
			// break;
		// case "katana":
			// return new Katana();
			// break;		
		// case "sniper":
			// return new Sniper();
			// break;
		// case "shotgun":
			// return new Shotgun();
			// break;
		// case "spicy":
			// return new Spicy();
			// break;		
		// case "clang":
			// return new Clang();
			// break;		
		// case "flamethrower":
			// return new Flamethrower();
			// break;	
		// case "ancient":
			// return new Ancient();
			// break;
		// case "rake":
			// return new Rake();
			// break;		
		// case "cross":
			// return new Cross();
			// break;
		// default:
			// if(weapon_name in weapon_data){
				// return new Weapon(weapon_name);
			// }
			// else{
				// return "";
			// }
			// break;		
	// }
}

//offhand
var offhand_data = {
	"bomb" : {
		"icon":"💣",
		"uses": 1,
		"class": Bomb
	},
	"trap" : {
		"icon":"🕳", 
		"uses" : 1,
		"class": Trap	
	},
	"shield" : {
		// "icon":"🛡️",
		"icon" : "./icons/shield.png",
		"icon_type" : "img",
		"uses": [1,3],
		"dmgReductionB":0.5,
		"useStates":["defend"]
	},
	"recoil" : {
		"icon" : "./icons/recoil.png",
		"icon_type" : "img",
		"dmgReductionB":0.75,
		"uses": 10,
		"class": Recoil
	},
	"vape" : {
		"icon" : "./icons/vape.png",
		"icon_type" : "img",
		"peaceBonus":40,
		"visibilityB":-20,
		"uses": 1,
		"class": Vape
	},
	"campfire" : {
		"icon" : "./icons/campfire.png",
		"icon_type" : "img", 
		"uses" : 1,
		"class": Campfire	
	},	
	"mirror" : {
		"icon" : "./icons/mirror.png",
		"icon_type" : "img",
		"uses" : 1,
		"class": Mirror		
	},
}
function create_offhand(offhand_name){
	if(offhand_name in offhand_data){
		if('class' in offhand_data[offhand_name]){
			return new offhand_data[offhand_name]['class']()			
		}
		else{
			return new Offhand(offhand_name);
		}
	}
	if(offhand_name=='food'){
		let foodOdds = defaultFoodOdds.slice();
		let food_name = roll(foodOdds)
		return create_food(food_name);
	}
	return '';
	// switch(offhand_name){
		// case "Nothing":
			// return "";
			// break;
		// case "trap":
			// return new Trap();
			// break;		
		// case "bomb":
			// return new Bomb();
			// break;
		// case "recoil":
			// return new Recoil();	
			// break;			
		// case "vape":
			// return new Vape();		
			// break;
		// case "campfire":
			// return new Campfire();
			// break;
		// case "mirror":
			// return new Mirror();
			// break;
		// case "food":
			// let foodOdds = defaultFoodOdds.slice();
			// let food_name = roll(foodOdds)
			// return create_food(food_name);
		// default:
			// if(offhand_name in offhand_data){
				// return new Offhand(offhand_name);
			// }
			// else{
				// return "";
			// }
			// break;		
	// }
}

//food
var food_data = {
	"apple" : {
		"icon":"🍎",
		"uses": [1,5],
		"heal": 8
	},
	"pie" : {
		"icon":"🥧", 
		"uses": 1,
		"heal": 20	
	},
	"banana" : {
		"icon":"🍌", 
		"uses": [2,4],
		"heal": 8,
		"energy_heal": 10
	},
	"health_potion" : {
		"icon":"?", 
		"uses": [2,4],
		"heal": 8
	},
	"str_potion" : {
		"icon" : "./icons/str_pot.png",
		"icon_type" : "img",
		"uses": 1,
		"class": StrPotion			
	},
	"ebiroll" : {
		"icon":"🦐", 
		"uses": 1,
		"heal": 30,
		"class": Ebiroll	
	},
	"purple" : {
		"icon":"./icons/purpleSweet.png", 
		"icon_type" : "img",
		"uses": [5,10],
		"heal": 1,
		"energy_heal": 5,
		"class": PurpleSweet			
	}
}

function create_food(food_name){
	if(food_name in food_data){
		if('class' in food_data[food_name]){
			return new food_data[food_name]['class']()			
		}
		else{
			return new Food(food_name);
		}
	}
	/*
	switch(food_name){
		case "ebiroll":
			return new Ebiroll();
			break;
		case "str_potion":
			return new StrPotion();
			break;
		case "purple":
			return new PurpleSweet();
			break;
		default:
			if(food_name in food_data){
				return new Food(food_name);
			}
			else{
				return "";
			}
			break;		
	}*/
	return "";
}