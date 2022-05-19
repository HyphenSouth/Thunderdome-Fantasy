//roll an int between min and max (inclusive)
function roll_range(min, max){
	return Math.floor(Math.random() * (max+1-min)) + min
}

function f1(options){
	let tempArr = [];
	// console.log(options);
	options.forEach(function(choice,index){
		for(let i =0;i<choice[1];i++){
			tempArr.push(choice[0]);
		}
	});
	//console.log(tempArr);
	tempArr.sort(() => Math.random() - 0.5);
	// log_message('returning ' + tempArr[0])
	return tempArr[0];
}

function f2(options){
	let tempArr = [];
	// console.log(options);
	options.forEach(function(choice,index){
		for(let i =0;i<choice[1];i++){
			tempArr.push(choice[0]);
		}
	});
	//console.log(tempArr);
	let rand_index = roll_range(0, tempArr.length-1)
	// log_message('returning ' + tempArr[0])
	return tempArr[rand_index];
}


// weighted roll
function f3(options){
	let total_weight=0;
	// console.log(options);
	options.forEach(function(choice,index){
		if(choice[1]>0){
			total_weight = total_weight + choice[1]
		}
	});
	let roll_choice = roll_range(1,total_weight)
	// log_message(roll_choice)
	for(let i=0; i<options.length; i++){
		let choice = options[i]
		if(choice[1]>=roll_choice){
			// log_message('returning ' + choice[0])
			return choice[0]
		}
		else{
			roll_choice = roll_choice - choice[1];
		}
	}
	log_message('returning nothing')
	return '';
}

// data1 = [['yes',50],['no',100]]
// data2 = [['no',100],['yes',50]]
// data3 = [['yes',20],['no',100]]
// data4 = [['no',100],['yes',20]]

// data1 = [['yes',50],['no',100],['maybe',20]]
// data2 = [['no',100],['maybe',20],['yes',50]]
// data3 = [['maybe',20],['yes',50],['no',100]]

data1 = [['yes',1],['no',9]]
data2 = [['no',9],['yes',1]]

function rollTest(func, cycles, data){
	y=0
	m=0
	n=0
	console.log(data)
	for(let i=0; i<cycles; i++){
		r = func(data)
		if(r=='yes'){
			y++
		}
		else if(r=='maybe'){
			m++
		}
		else{
			n++
		}
	}
	console.log([y,m,n])
}



