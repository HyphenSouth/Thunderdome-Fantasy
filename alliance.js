var alliances = []
var disbanded_alliances = []
var allianceStatic = []
var alliance_radius = 75;
var alliance_id = 0;
var base_unity = 200;
var max_alliance_size = 6;

var alliance_names = [
	["Goat",true],
	["Cow",true],
	["SeaSlug",true],
	["Deer",true],
	["Chicken",true],
	["Edward",true],
	["Rabbit",true],
	["Duck",true],
	["Monkey",true],
	["Cat",true],
]
var max_alliance_count = alliance_names.length;

function create_alliance(p1, p2){
	unity = base_unity;
	if(p1.personality == p2.personality)
		unity += 50
	else if(p1.personality != 'Neutral' && p2.personality != 'Neutral')
		unity -= 50
	
	if(p1.moral == 'Chaotic')
		unity -=20
	if(p2.moral == 'Chaotic')
		unity -=20
	if(p1.rival==p2 || p2.rival==p1)
		unity-=100
	unity += p1.opinions[p2.id]/5
	unity += p2.opinions[p1.id]/5
	unity = Math.round(unity)
	
	log_message(alliances.length)
	let name_id = roll_range(0, alliance_names.length-1)
	let cnt = 0
	while(alliance_names[name_id][1]==false && cnt<25){
		name_id = roll_range(0, alliance_names.length-1);
		cnt++;
	}
	
	temp_alliance = new Alliance(p1,p2,unity, name_id)
	p1.alliance = temp_alliance;
	p2.alliance = temp_alliance;
	p1.opinions[p2.id]+=150;
	p2.opinions[p1.id]+=150;
	alliances.push(temp_alliance);
	allianceStatic.push(temp_alliance);
	temp_alliance.draw()
}

class Alliance{
	// alliances need at least 2 players to start
	constructor(leader, p2, unity, name_id){
		this.id = alliance_id;
		alliance_id++;
		
		this.members = [leader, p2];
		this.leader = leader;
		this.unity = unity;	
		
		this.active = true;
		this.name_id = name_id
		this.name = "Team "+alliance_names[this.name_id][0]
		alliance_names[this.name_id][1] = false;
		
		this.attack_target = "";
	}
	
	//calculate opinion between members
	calc_opinions(tP, oP){
		if(!oP in this.members){
			return
		}
		tP.opinions[oP.id] += Math.min(this.unity/40,5)
		tP.opinions[oP.id] += tP.intimidation - oP.intimidation
	}
	
	add_member(member){
		this.members.push(member)
		member.alliance = this
		this.unity += roll_range(50,80)
	}
	
	leave_alliance(member){
		$('#char_' + member.id).removeClass('alliance')
		$('#tbl_' + member.id).removeClass('alliance')
		$("#alliance_"+this.id+"_char_" + member.id).remove()
		
		member.alliance = ""
		this.members = arrayRemove(this.members, member)
		if(this.members.length<=1){
			this.disband()
		}
		else{
			this.members.forEach(function(other_member){
				other_member.opinions[member.id] -= 80
			})			
		}
	}
	member_death(member){
		$('#char_' + member.id).removeClass('alliance')
		$('#tbl_' + member.id).removeClass('alliance')
		$("#alliance_"+this.id+"_char_" + member.id).remove()
		
		this.members = arrayRemove(this.members, member);
		this.unity -= 150;
		if(this.members.length<=1){
			this.disband()
		}
		if(member==this.leader){
			//assign new leader
			this.leader = this.members[0]
		}
	}	
	
	disband(){
		let tA = this
		// update opinions
		this.members.forEach(function(member){
			tA.members.forEach(function(other_member){
				if(member == other_member)
					return
				member.opinions[other_member.id] *=0.6
				member.opinions[other_member.id] -= 50
			})
		});
		// remove alliance
		this.active = false
		this.members.forEach(function(member){
			$("#alliance_"+tA.id+"_char_" + member.id).remove()
			$('#tbl_' + member.id).removeClass('alliance')
			member.alliance = ""
		});
		if(selected_alliance_id==this.id)
			selected_alliance_id = -1
		
	}
	
	delete_alliance(){
		this.active = false
		alliances = arrayRemove(alliances, this)
		disbanded_alliances.push(this)
		log_message('alliance '+this.id+' deleted')
		
		alliance_names[this.name_id][1] = true;
		$("#alliance_" + this.id).addClass("disbanded");
		$("#alliance_" + this.id).removeClass("ally_active");
		// $('#alliances .container.ally_active').last().after($("#alliance_" + this.id));
		
		$('#active_alliances').remove(this.tblDiv)
		$('#disbanded_alliances').append(this.tblDiv)
	}
	
	update(){
		this.unity += roll_range(-50,10) * (this.members.length-1)
		let tA = this
		let attackers = []
		this.members.forEach(function(member){
			if(member.dead){
				tA.member_death(member)
				return
			}
			if(member.moral == 'Chaotic')
				tA.unity -= 5			
			
			//check others opinions
			let opinion_sum = 0;			
			tA.members.forEach(function(other_member){
				if(other_member == member)
					return
				let other_opinion = member.opinions[other_member.id]
				opinion_sum += other_opinion
				if(member.awareOfPlayer(other_member)){
					tA.unity += Math.max((other_opinion-100)/5, 20)
					if(other_member==tA.leader)
						tA.unity += 20
				}
				else{
					tA.unity += (other_opinion-100)/20
				}
			});
			if(tA.attack_target)
				member.opinions[tA.attack_target.id] -= 40
			
			//check attackers
			member.opponents.forEach(function(oP){
				if(oP.alliance == tA)
					tA.unity -= 150
				if(oP == tA.attack_target)
					tA.unity += 10
				if(!oP.dead){
					attackers.push(oP)
				}
			});
			
			if(opinion_sum < roll_range(0,50)*(tA.members.length-1) - tA.peaceB){
				log_message(member.name +' quits alliance')
				this.leave_alliance(member)
			}
			
		});
		
		this.unity = Math.min(Math.round(this.unity), 500)
		
		//attack target
		attackers.forEach(function(attacker){
			tA.members.forEach(function(member){
				member.opinions[attacker.id] -= 80
				if(attacker.alliance == tA)
					member.opinions[attacker.id] -= 100
			})
		})
		
		if(this.attack_target){
			if(this.attack_target.dead)
				this.attack_target=""
			else if(attackers.length>0)
				if(Math.random()<0.3)
					this.attack_target = attackers[roll_range(0,attackers.length-1)]
			else if(Math.random()<0.05)
				this.attack_target=""
		}
		else{
			this.attack_target = attackers[roll_range(0,attackers.length-1)]
		}
		
		//limit checks
		if (isNaN(this.unity))
			this.unity=0
		if(this.unity<=0)
			this.disband()		
		if(this.members.length<=1)
			this.disband()
		
		if(!this.active)
			this.delete_alliance();		
	}
	
	alliance_plan_action(tP){
		if(tP.awareOfPlayer(this.leader) && playerDist(tP,this.leader)>50){
			if(Math.random()<0.8)
				tP.setPlannedAction("follow", 3, {'class':FollowAction, 'target': this.leader})
		}
		if(this.attack_target && Math.random()<0.9){
			if(tP.inRangeOfPlayer(this.attack_target))
				tP.setPlannedAction("follow", 3, {'class':FightAction, 'target': this.attack_target})
			else if(tP.awareOfPlayer(this.attack_target)){
				tP.setPlannedAction("follow", 4, {'class':FollowAction, 'target': this.attack_target})
			}
		}
	}
		
	highlight_alliance_members(){
		this.members.forEach(function(member){		
			if(!$('#tbl_' + member.id).hasClass('selected')){
				$('#char_' + member.id).addClass('alliance')
				$('#tbl_' + member.id).addClass('alliance')
			}
		});
	}
	
	deselect_alliance_members(){
		this.members.forEach(function(member){		
			$('#char_' + member.id).removeClass('alliance')
			$('#tbl_' + member.id).removeClass('alliance')
		});
	}
	
	show_info(){
		let alliance_info = 
		"<div class='info' style='font-size:12px; width:200px;'>"+
			"<b style='font-size:18px'>"+this.name+"</b><br>"+
			"<span style='font-size:10px;'>ID: "+this.id+"</span><br>"+
			"<span><b>Unity: </b>"+this.unity+"</span><br>"
			
		if(this.attack_target)
			alliance_info += "<span><b>Target: </b>"+this.attack_target.name+"</span><br>"
		else
			alliance_info += "<span><b>Target: </b>"+"None"+"</span><br>"
		
		alliance_info += 
			"<div>"+
				"<table style='font-size:12px; color:white;border-spacing: 5px 2px;'>"		
		
		let tA = this;
		this.members.forEach(function(member){	
			alliance_info += "<tr>"+			
			"<td style='width:20px;'>"+member.moral[0] + member.personality[0]+"</td>" + 
			"<td style='/*max-width:100px;*/ /* min-width:85px;*/ width:100px; word-wrap:break-word;'>" + member.name + "</td>"+
			"<td style='width:50px; color:red;'>"+ Math.round(member.health) +'/'+ Math.round(member.maxHealth) + "</td>"//+
			alliance_info += "</tr>"	
			
		});	
		this.highlight_alliance_members();
		if(!this.active){
			alliance_info+="<span>inactive</span>"
		}
			
		alliance_info+="</div></table></div>"
		
		$('#extra_info_container').html(alliance_info);
	}
	
	draw(){
		let html = 
		"<div style='margin-bottom:10px' class='container ally_active' id='alliance_" + this.id + "' onclick='toggle_selected_alliance("+this.id+")'>"+
			"<div>"+
				"<b style='font-size:24px'>" + this.name +"</b><br>"+
				// "<span style='font-size:10px;'>ID: "+this.id+"</span><br>"+
				"<b>Unity: </b><span class='unity'>"+this.unity+"</span><br>"+
				"<b>Target: </b><span class='alliance_target'>"+this.attack_target+"</span><br>"+
			"</div>"+
			"<span><b>Members</b></span><br>"+
			"<div class='alliance_members'>"+
			"</div>"+
		"</div>"
		
		$('#active_alliances tbody').append(html)
		let tblDiv = $('#alliance_' + this.id);
		this.tblDiv = tblDiv;
		
		//members
		let tA = this;
		this.members.forEach(function(member){
			let mem_html = tA.create_member_div(member)
			// html+=mem_html
			$("#alliance_" + tA.id+' .alliance_members').append(mem_html)
		});
	}
	
	create_member_div(member){
		let mem_html = "<div class='alliance_member' id='alliance_"+this.id+"_char_"+member.id+"' onclick='alliance_div_click("+this.id+","+member.id+")'>"
		// +member.name
		// mem_html+="</div>"
		
		mem_html+=
			"<div style='position:relative; width:55px; height:70px; z-index:2; top:0; left:0; pointer-events:none;'>"+ 
				"<img class='img' src='" + member.img + "'>"+ //img 
				"<div class='healthBar'></div>"+
				"<div class='energyBar'></div>"+ //hp+ep bar
				"<div class='kills'></div>"+		//kill counter
			"</div>"+
		
			//info section
			"<div class='info'>"+
				"<div class='name' style='font-size:14px'><b>" + 
					member.moral.substring(0,1) + member.personality.substring(0,1) + " " + member.name + //name
				"</b></div>"
				//status message
				mem_html+="<div class='status'>"+member.statusMessage+"</div>"		
				
				//inventory
				let inv_text=""
				if(member.weapon){
					inv_text+=member.weapon.icon;
				}
				if(member.offhand){
					inv_text+=member.offhand.icon;
				}
				mem_html+="<div class='inv' style='height:12px; font-size:10px'>"+inv_text+"</div>";
				
				//status effects
				let status_eff_text = ""
				member.status_effects.forEach(function(eff){
					status_eff_text+=eff.icon;
				});
				mem_html+="<div class='effects' style='height:12px; font-size:10px'>"+status_eff_text+"</div>"
			"</div>"
			// "<div style='position:absolute; width:185px; height:100%; top:0; left:0; margin-left:50px;' onclick='toggle_show_info("+this.id+")'></div>"+	//clickable div
			
		mem_html+="</div>"
		return mem_html;
	}
}