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
	"harukasan": Harukasan,
	"chihya": Chihya,
	"io": Io,
	"yayo": Yayo,
	"koamimami": Koamimami,
	"makochi": Makochi,
	"yukipo": Yukipo,
	"chicchan": Chicchan,
	"miurasan": Miurasan,
	"afu": Afu,
	"takanya": Takanya,
	"chibiki": Chibiki,
	"piyo": Piyo,
	"wagon": FunnyWagon,
	"elfen": Elfen,
	"lucy": Lucy,
	"witch": Witch,
	"bocc": Bocc,
}

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
	"doll" : {
		"icon" : "./icons/doll.png",
		"icon_type" : "img",
		"uses" : 1,
		"class": Doll		
	},
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
	},
	"onigiri" : {
		"icon":"🍙",
		"uses": [3,7],
		"heal": 5		
	},
	"soup" : {
		"icon":"🥣",
		"uses": 1,
		"heal": 12,
		"energy_heal": 2		
	},
	"pizza" : {
		"icon":"🍕",
		"uses": 8,
		"heal": 3		
	}
}

