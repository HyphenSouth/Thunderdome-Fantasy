let basePeace = 100
let baseAggro = 100

let testMoral = ['l','n','c']
let testPerson = ['g','n','e']

//peace/aggro
let same_per = [80, -40]
let oppo_per = [-40, 80]


let peace_b = {'l':150,'n':0,'c':0}
let aggro_b = {'l':0,'n':0,'c':200}

let intimid_b = {'g':0,'n':0,'e':0}
let intimid = 0;

function data_table(){
	let s = '\t'
	testMoral.forEach(function(m){
		testPerson.forEach(function(p){
			//op
			s = s +	m + p + '\t'
		});
	});
	console.log(s)

	testMoral.forEach(function(m){
		testPerson.forEach(function(p){
			//tp
			let s = m+p+'\t'
			
			testMoral.forEach(function(oPm){
				testPerson.forEach(function(oPP){
					//tp
					let peace = basePeace
					let aggro = baseAggro
					peace = peace + peace_b[m]
					aggro = aggro + aggro_b[m]
					if(p == oPP){
						peace = peace + same_per[0]
						aggro = aggro + same_per[1]
					}
					else if(oPP != 'n' && p !='n'){
						peace = peace + oppo_per[0]
						aggro = aggro + oppo_per[1]
					}
					let intm = intimid_b[oPP] + intimid
					/*
					//original intimid
					if(m == 'c'){
						peace += intm
					}
					if(m == 'l'){
						aggro += intm
					}
					
					if(m == 'n'){
						aggro += Math.round(intm/2)
						peace += Math.round(intm/2)
					}
					*/
					
					// peace += intm
					
					aggro += intm
					
					
					
					peace = Math.max(1, peace)
					aggro = Math.max(1, aggro)
					
					s = s+Math.round(aggro/(aggro+peace)*100) +'\t'
				});
			});
			console.log(s)
		});
	});
}

console.log('no intimidation')
data_table()

console.log('0 kills')
intimid_b = {'g':-40,'n':0,'e':50}
intimid = 0;
data_table()

console.log('1 kill')
intimid = 5;
data_table()

console.log('5 kills')
intimid = 25;
data_table()

console.log('10 kills')
intimid = 50;
data_table()