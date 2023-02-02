var attr_data = {
	"cunny": Cunny,
	"brat": Brat,
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
	"retard": Retard,
	"bocc": Bocc,
}

//weapon
var weapon_data = {
	"lance" : {
		"icon":"🔱",
		"dmg_type":"melee",
		"fightBonus":1.3,
		"uses":[4,9],
		"class": Lance,
		"value": 28
	},
	"gun" : {
		"icon":"🔫", 
		"dmg_type" : "ranged",
		"rangeBonus" : 20,
		"fightBonus" : 1.3,
		"uses" : 4,
		"value": 35	
	},	
	"bow" : {
		"icon":"🏹", 
		"dmg_type" : "ranged",
		"rangeBonus" : 30,
		"fightBonus" : 1.1,
		"uses" : 8	,
		"value": 15	
	},
	"knife" : {
		"icon":"🔪", 
		"dmg_type" : "melee",
		"fightBonus" : 1.1,
		"uses" : [5,10]	,
		"value": 10
	},		
	"guitar" : {
		"icon":"🎸", 
		"dmg_type" : "melee",
		"fightBonus" : 1.5,
		"uses" : 1,
		"value": 35
	},		
	"wand" : {
		"icon" : "./icons/wand.png",
		"icon_type" : "img",
		"dmg_type" : "magic",
		"fightBonus" : 1.1,
		"rangeBonus" : 24,
		"uses" : [3,6],
		"value": 20
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
		"class": Nanasatsu,
		"value": 100
	},
    "katana" : {
		"icon" : "./icons/katana.png",
		"icon_type" : "img",
		"dmg_type":"melee",
		"uses":[4,9],
		"class": Katana,
		"value": 25
	},
    "shotgun" : {
		"icon" : "./icons/shotgun.png",
		"icon_type" : "img",
		"rangeBonus" : 25,
		"dmg_type":"ranged",
		"uses":[3,6],
		"class": Shotgun,
		"value": 30
	},
	"spicy" : {
		"icon" : "./icons/spicy.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"fightBonus" : 1.75,
		"uses" : 99999,
		"class": Spicy,
		"value": 100
	},
	"clang" : {
		"icon" : "./icons/clang.png",
		"icon_type" : "img",
		"dmg_type" : "melee",
		"rangeBonus" : 5,
		"fightBonus" : 1.35,
		"intimidationBonus" : 20,
		"uses" : [3,8],
		"class": Clang,
		"value": 50
	},
	"flamethrower" : {
		"icon" : "./icons/flamethrower.png",
		// "icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "ranged",
		"rangeBonus" : 10,
		"fightBonus" : 0.95,
		"uses" : 8,
		"class": Flamethrower,
		"value": 25
	},
	"sniper" : {
		"icon" : "./icons/sniper.png",
		"icon_type" : "img", 
		"dmg_type" : "ranged",
		"rangeBonus" : 40,
		"sightBonus" : 20,
		"uses" : 3,
		"class": Sniper,
		"value": 25
	},
	"ancient" : {
		"icon" : "./icons/ancient_staff.png",
		"icon_type" : "img",
		"dmg_type" : "magic",
		"rangeBonus" : 24,
		"uses" : 60,
		"class": Ancient,
		"value": 1
	},
	"rake" : {
		"icon" : "🧹",
		"dmg_type" : "melee",
		"uses" : 3,
		"class": Rake,
		"value": 9
	},
	"cross" : {
		"icon" : "✝️",
		"dmg_type" : "magic",
		"uses" : 4,
		"class": Cross,
		"value": 11
	}
}

//offhand
var offhand_data = {
	"bomb" : {
		"icon":"💣",
		"uses": 1,
		"class": Bomb,
		"value": 30
	},
	"trap" : {
		"icon":"🕳", 
		"uses" : 1,
		"class": Trap,
		"value": 25
	},
	"shield" : {
		// "icon":"🛡️",
		"icon" : "./icons/shield.png",
		"icon_type" : "img",
		"uses": [1,3],
		"dmgReductionB":0.5,
		"useStates":["defend"],
		"value": 15
	},
	"recoil" : {
		"icon" : "./icons/recoil.png",
		"icon_type" : "img",
		"dmgReductionB":0.75,
		"uses": 10,
		"class": Recoil,
		"value": 5
	},
	"vape" : {
		"icon" : "./icons/vape.png",
		"icon_type" : "img",
		"peaceBonus":40,
		"visibilityB":-20,
		"uses": 1,
		"class": Vape,
		"value": 0
	},
	"campfire" : {
		"icon" : "./icons/campfire.png",
		"icon_type" : "img", 
		"uses" : 1,
		"class": Campfire,
		"value": 25
	},	
	"mirror" : {
		"icon" : "./icons/mirror.png",
		"icon_type" : "img",
		"uses" : 1,
		"class": Mirror,
		"value": 40	
	},
	"doll" : {
		"icon" : "./icons/doll.png",
		"icon_type" : "img",
		"uses" : 1,
		"class": Doll,
		"value": 100		
	},
}

//food
var food_data = {
	"apple" : {
		"icon":"🍎",
		"uses": [1,5],
		"heal": 8,
		"value": 8
	},
	"pie" : {
		"icon":"🥧", 
		"uses": 1,
		"heal": 20,
		"value": 20
	},
	"banana" : {
		"icon":"🍌", 
		"uses": [2,4],
		"heal": 8,
		"energy_heal": 10,
		"value": 10
	},
	"health_potion" : {
		"icon":"?", 
		"uses": [2,4],
		"heal": 8,
		"value": 8
	},
	"str_potion" : {
		"icon" : "./icons/str_pot.png",
		"icon_type" : "img",
		"uses": 1,
		"class": StrPotion,
		"value": 20		
	},
	"ebiroll" : {
		"icon":"🦐", 
		"uses": 1,
		"heal": 30,
		"class": Ebiroll,
		"value": 29	
	},
	"purple" : {
		"icon":"./icons/purpleSweet.png", 
		"icon_type" : "img",
		"uses": [5,10],
		"heal": 1,
		"energy_heal": 5,
		"class": PurpleSweet,
		"value": 4			
	},
	"onigiri" : {
		"icon":"🍙",
		"uses": [3,7],
		"heal": 5,
		"value": 5
	},
	"soup" : {
		"icon":"🥣",
		"uses": 1,
		"heal": 12,
		"energy_heal": 2,
		"value": 14		
	},
	"pizza" : {
		"icon":"🍕",
		"uses": 8,
		"heal": 5,
		"value": 5		
	},
	"orange" : {
		"icon":"🍊",
		"uses": [3,10],
		"heal": 3,
		"value": 3		
	}
}

