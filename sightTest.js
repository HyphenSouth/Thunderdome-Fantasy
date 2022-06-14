// (Math.pow((Math.random()*(op_vis/100)),1/3) * (tp_sight - tp_fight) > dist - tp_fight)


let distLst = []
for(let i=0; i<210; i+=10){
	distLst.push(i)
}
let sightRangeLst = []
for(let i=0; i<210; i+=10){
	sightRangeLst.push(i)
}

let fightRange = 24
let visB = 100
let dist = 200
let sightRange = 200

// function sightChance(sight, dist, fight = fightRange, vis = visB){
	// let r = 0;
	// if(dist>sight){
		// return r;
	// }
	// r = Math.pow(((dist-fight)/(sight-fight)),3)*(100/vis)
	// if(r>1)
		// r=1
	// if(r<0)
		// r=0	
	// if(sight-fight < 0)
		// return r*100;
	
	// return (1-r)*100;
// }

function sightChance(sight, dist, fight = fightRange, vis = visB){
	if(dist>sight){
		return 0;
	}
	let r = 0;
	for(let i=0; i<100; i++){
		// if(Math.pow(((i/100)*(vis/100)),1/3) * (sight - fight) > dist - fight){
		if(Math.pow(((i/100)*(vis/100)),1/3) * (sight + fight) > dist){
			r++;
		}
	}

	return (r);
}


function sightDataTable(){
	console.log('fight range '+fightRange)
	console.log('visibility '+visB)

	let str = '\t'
	distLst.forEach(function(d){
		str = str +	d + '\t'

	});
	console.log(str)
	sightRangeLst.forEach(function(s){
		str= s + '\t'
		distLst.forEach(function(d){
			str = str + Math.round(sightChance(s, d, fightRange, visB))+'\t'
		});
		
		console.log(str)
	});
}
sightDataTable();
