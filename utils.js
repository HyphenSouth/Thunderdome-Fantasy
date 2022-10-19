//utility functions used all over the place
//remove value from an array
function arrayRemove(arr, value) { 
	return arr.filter(function(ele){ return ele != value; });
}

//calculate the angle between e1 and e2
//e1 and e2 need to have an x and y variable
function entityDist(e1,e2){
	return hypD(e1.x - e2.x, e1.y - e2.y)
}

//a^2+b^2=c^2
var hyp_count = 0
function hypD(x,y,hyp=true){
	hyp_count++;
	if (hyp){
		return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
	} else {
		return Math.sqrt(Math.pow(x,2)-Math.pow(y,2));
	}
}

//convert degrees to radians
function degToRad(angle){
	return angle * (Math.PI/180)
}
//convert radians to degrees
function radToDeg(angle){
	return angle * (180/Math.PI)
}
//calculate the angle between e1 and e2
//e1 and e2 need to have an x and y variable
function entityAngle(e1,e2, radians=false){
	return calcAngle(e1.x, e1.y, e2.x, e2.y, radians)
}

//calculates the angle of point1 to point2
function calcAngle(x1,y1,x2,y2, radians=false){
	let angle = Math.atan((y2-y1)/(x2-x1))
	if(x1>x2)
		angle+=Math.PI
	if(!radians)
		return angle * (180/Math.PI)
	else
		return angle
}

//rounds a number to a given amount of decimal places
function roundDec(x, places=2){
	let mul = Math.pow(10, places)
	return Math.round(x*mul)/mul
}

//roll an int between min and max (inclusive)
function roll_range(min, max){
	return Math.floor(Math.random() * (max+1-min)) + min
}

// weighted roll
function roll(options){
	let total_weight=0;
	// log_message(options);
	options.forEach(function(choice,index){
		if(choice[1]>0){
			total_weight = total_weight + Math.round(choice[1])
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
	// log_message('returning nothing')
	return '';
}

//get the probabilities for a weighted roll
function roll_probs(options){
	let total_weight=0;
	options.forEach(function(choice,index){
		if(choice[1]>0){
			total_weight = total_weight + Math.round(choice[1])
		}
	});
	let probs = []
	// log_message(roll_choice)
	options.forEach(function(choice,index){
		let prob = 0
		if(choice[1]>0){
			prob = (Math.round(choice[1])/total_weight)*100
		}
		probs.push([choice[0], roundDec(prob)])
	});
	
	// log_message('returning nothing')
	return probs;
}

//calculates some stats for a list of numbers
function list_stats(lst){
	let sum = 0
	let avg = 0
	let sd = 0
	//sum 
	lst.forEach(function(item){
		sum += item;
	})
	avg = sum/lst.length
	//sd 
	let var_sum = 0
	lst.forEach(function(item){
		let variance = Math.pow(item - avg, 2)
		var_sum+=variance
	})
	sd = Math.sqrt(var_sum/lst.length)
	console.log('sum: '+sum)
	console.log('avg: '+avg)
	console.log('sd: '+sd)
}

function timerClick(val){
	var d = new Date();
	if(timerClicks[val]) {
		console.log(val + " - " + (d.getTime() - timerClicks[val]));
		timerClicks[val] = "";
	} else {
		timerClicks[val] = d.getTime();
		console.log(val + " started");
	}
}

//check if num is between n1 and n2
function betweenNums(num, n1,n2){
	if(num<Math.min(n1,n2))
		return false
	if(num>Math.max(n1,n2))
		return false
	return true
}

var show_msg=true
var show_level=0;
function log_message(msg, msg_level=0){
	if(show_msg==true && msg_level>=show_level){
		console.log(msg);
	}	
}

class Line{
	constructor(args){
		if(args.m && args.b){
			this.m = args.m;
			this.b = args.b;
		}
		else if(args.p1 && args.p2){
			this.m = (args.p1[1]-args.p2[1])/(args.p1[0]-args.p2[0])
			this.b = args.p1[1] - this.m * args.p1[0]
		}
		else if(args.p1 && args.m){
			this.m = args.m			
			this.b = args.p1[1] - this.m * args.p1[0]
		}
		else if(args.p1 && args.angle){
			let p2 = [Math.cos(degToRad(args.angle))*10 + args.p1[0], Math.sin(degToRad(args.angle))*10 + args.p1[1]]
			this.m = (args.p1[1]- p2[1])/(args.p1[0]- p2[0])
			this.b = args.p1[1] - this.m * args.p1[0]
			this.angle = args.angle;
		}
	}
	
	getY(x){
		return this.m * x + this.b
	}
	
	//check if a point is on the line
	pointOnLine(point, tolerance=0){
		let x = point[0]
		let y = point[1]

		let resultY = this.getY(x)

		return Math.abs(resultY - y) <= tolerance;
	}
	
	//get the intersection point with another line
	lineIntersection(line){
		//parallel
		if(line.m==this.m){
			if(line.b==this.b)
				//intersect at all points
				return Infinity
			else
				//no intersection
				return NaN
		}
		let x = (this.b-line.b)/(line.m-this.m)
		let y = this.getY(x)
		return [x,y]
	}
	
	//get distance of a point from the line
	pointDist(point){
		let perp_m = -1/this.m
		// let perp_b =  point[1] - perp_m * point[0]
		let temp_line = new Line({'m':perp_m,'p1':point})
		//find intersection
		let intersect = this.lineIntersection(temp_line)
		// let int_x = (this.b-perp_b)/(perp_m-this.m)
		// let int_y = this.getY(int_x)
		console.log(temp_line)
		return hypD(intersect[0]-point[0], intersect[1]-point[1])
	}
}

class LineSeg extends Line{
	constructor(p1,p2){
		super({'p1':p1, 'p2':p2})
		this.p1 = p1;
		this.p2 = p2;
	}
	//check if a point is on the line
	pointOnLine(point, tolerance=0){
		let x = point[0]
		let y = point[1]
		if(!betweenNums(x, this.p1[0],this.p2[0]))
			return false
		if(!betweenNums(y, this.p1[1],this.p2[1]))
			return false
		let resultY = this.getY(x)

		return Math.abs(resultY - y) <= tolerance;
	}
	
	pointDist(point){
		let perp_m = -1/this.m
		let temp_line = new Line({'m':perp_m,'p1':point})
		console.log(temp_line)
		//find intersection
		let intersect = this.lineIntersection(temp_line)
		if(!betweenNums(intersect[0] , this.p1[0],this.p2[0]))
			return NaN
		if(!betweenNums(intersect[1] , this.p1[1],this.p2[1]))
			return NaN		
		return hypD(intersect[0]-point[0], intersect[1]-point[1])
	}
}