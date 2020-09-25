var flightPlanner = new Object;
var wind = 0;


flightPlanner.distbtwnangle = function(angle1,angle2){
	var angledist = Math.min((angle1-angle2+360)%360,(angle2-angle1+360)%360);
	return angledist;
};
flightPlanner.degtorad = function(deg){
	var rad = deg /180 * Math.PI;
	return rad;
};

flightPlanner.radtodeg = function(rad){
	var deg = rad * 180 / Math.PI;
	return deg;
};

flightPlanner.newx = function(x,deg,dist){
	var newxx;
	newxx = x + Math.sin(flightPlanner.degtorad(deg)) * dist;
	return newxx;
};

flightPlanner.newy = function(y,deg,dist){
	var newyy;
	newyy = y + Math.cos(flightPlanner.degtorad(deg)) * dist;
	return newyy;
};

flightPlanner.addtoangle = function(origang,add){
	var newangle = (origang + add + 360) % 360;
	return newangle;
};

flightPlanner.distbtwnpt = function(x1,y1,x2,y2){
	var distancebtwn = Math.pow((Math.pow(x1-x2,2) + Math.pow(y1-y2,2)),.5);
	return distancebtwn;
};

//takes kts,degrees and return nm radius
flightPlanner.getTurnRadius = function(speed,aob){
	var radiusInFeet = speed*speed / 11.26 / Math.tan(flightPlanner.degtorad(aob));
	return radiusInFeet * 0.00016458;//returns radius in nautical miles
}

flightPlanner.generatecircles = function(initxv,inityv,finxv,finyv,initheadv,finheadv,turnradv){
	var circlesv = new Object();
	circlesv.initright = new Object();
	circlesv.initleft = new Object();
	circlesv.finright = new Object();
	circlesv.finleft = new Object();
	circlesv.initright.x = flightPlanner.newx(initxv,flightPlanner.addtoangle(initheadv,90),turnradv);
	circlesv.initright.y = flightPlanner.newy(inityv,flightPlanner.addtoangle(initheadv,90),turnradv);
	circlesv.initleft.x = flightPlanner.newx(initxv,flightPlanner.addtoangle(initheadv,-90),turnradv);
	circlesv.initleft.y = flightPlanner.newy(inityv,flightPlanner.addtoangle(initheadv,-90),turnradv);
	circlesv.finright.x = flightPlanner.newx(finxv,flightPlanner.addtoangle(finheadv,90),turnradv);
	circlesv.finright.y = flightPlanner.newy(finyv,flightPlanner.addtoangle(finheadv,90),turnradv);
	circlesv.finleft.x = flightPlanner.newx(finxv,flightPlanner.addtoangle(finheadv,-90),turnradv);
	circlesv.finleft.y = flightPlanner.newy(finyv,flightPlanner.addtoangle(finheadv,-90),turnradv);
	return circlesv;
};

flightPlanner.determineoutsidetangent = function(firstturn,lastturn,direction,turnrad){
	var angle = Math.atan2(lastturn.x-firstturn.x,lastturn.y-firstturn.y);
	angle = (flightPlanner.radtodeg(angle) + 360) % 360;
	var resultstore = {
		firstx:flightPlanner.newx(firstturn.x,flightPlanner.addtoangle(angle,-1*direction),turnrad),
		firsty:flightPlanner.newy(firstturn.y,flightPlanner.addtoangle(angle,-1*direction),turnrad),
		lastx:flightPlanner.newx(lastturn.x,flightPlanner.addtoangle(angle,-1*direction),turnrad),
		lasty:flightPlanner.newy(lastturn.y,flightPlanner.addtoangle(angle,-1*direction),turnrad)
	};
	return resultstore;
};

flightPlanner.determineinsidetangent = function(firstturn,lastturn,direction1,direction2,turnrad){
	var result = new Object();
	if(flightPlanner.distbtwnpt(firstturn.x,firstturn.y,lastturn.x,lastturn.y) > 2 * turnrad-1 && flightPlanner.distbtwnpt(firstturn.x,firstturn.y,lastturn.x,lastturn.y) < 2 * turnrad+1 ){
		var angle = (360+flightPlanner.radtodeg(Math.atan2(lastturn.x-firstturn.x,lastturn.y-firstturn.y)))%360;
		result.firstx = flightPlanner.newx(firstturn.x,angle,turnrad);
		result.lastx = result.firstx;
		result.firsty = flightPlanner.newy(firstturn.y,angle,turnrad);
		result.lasty = result.firsty;
	}
	else if(flightPlanner.distbtwnpt(firstturn.x,firstturn.y,lastturn.x,lastturn.y) > 2 * turnrad){
		var xp = (lastturn.x * turnrad + firstturn.x * turnrad) / (2 * turnrad);
		var yp = (lastturn.y * turnrad + firstturn.y * turnrad) / (2 * turnrad);
		var insideinit = {
			x1:(Math.pow(turnrad,2)*(xp-firstturn.x)+turnrad*(yp-firstturn.y)*Math.pow(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2))+firstturn.x,
			y1:(Math.pow(turnrad,2)*(yp-firstturn.y)+turnrad*(xp-firstturn.x)*Math.pow(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2))+firstturn.y,
			x2:(Math.pow(turnrad,2)*(xp-firstturn.x)-turnrad*(yp-firstturn.y)*Math.pow(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2))+firstturn.x,
			y2:(Math.pow(turnrad,2)*(yp-firstturn.y)-turnrad*(xp-firstturn.x)*Math.pow(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-firstturn.x,2)+Math.pow(yp-firstturn.y,2))+firstturn.y
		};

		var initx1y = firstturn.y - Math.sqrt(-1*Math.pow(firstturn.x,2) + 2 * firstturn.x * insideinit.x1 + Math.pow(turnrad,2) - Math.pow(insideinit.x1,2));
		if(Math.round(initx1y) == Math.round(insideinit.y1)){
			insideinit.pt1x = insideinit.x1;
			insideinit.pt1y = insideinit.y1;
			insideinit.pt2x = insideinit.x2;
			insideinit.pt2y = insideinit.y2;
			insideinit.pt1angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insideinit.x1-firstturn.x,insideinit.y1-firstturn.y)),direction1);
			insideinit.pt2angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insideinit.x2-firstturn.x,insideinit.y2-firstturn.y)),direction1);
		}
		else{
			insideinit.pt1x = insideinit.x1;
			insideinit.pt1y = insideinit.y2;
			insideinit.pt2x = insideinit.x2;
			insideinit.pt2y = insideinit.y1;
			insideinit.pt1angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insideinit.x1-firstturn.x,insideinit.y2-firstturn.y)),direction1);
			insideinit.pt2angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insideinit.x2-firstturn.x,insideinit.y1-firstturn.y)),direction1);
		}
		var insidefin = {
			x1:(Math.pow(turnrad,2)*(xp-lastturn.x)+turnrad*(yp-lastturn.y)*Math.pow(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2))+lastturn.x,
			y1:(Math.pow(turnrad,2)*(yp-lastturn.y)+turnrad*(xp-lastturn.x)*Math.pow(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2))+lastturn.y,
			x2:(Math.pow(turnrad,2)*(xp-lastturn.x)-turnrad*(yp-lastturn.y)*Math.pow(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2))+lastturn.x,
			y2:(Math.pow(turnrad,2)*(yp-lastturn.y)-turnrad*(xp-lastturn.x)*Math.pow(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2)-Math.pow(turnrad,2),.5))/(Math.pow(xp-lastturn.x,2)+Math.pow(yp-lastturn.y,2))+lastturn.y
		};
		insidefin.angle1 = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x1-lastturn.x,insidefin.y1-lastturn.y)),direction2);
		insidefin.angle2 = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x2-lastturn.x,insidefin.y2-lastturn.y)),direction2);
		insidefin.angle3 = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x1-lastturn.x,insidefin.y2-lastturn.y)),direction2);
		insidefin.angle4 = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x2-lastturn.x,insidefin.y1-lastturn.y)),direction2);

		var finx1y = firstturn.y - Math.sqrt(-1*Math.pow(firstturn.x,2) + 2 * firstturn.x * insidefin.x1 + Math.pow(turnrad,2) - Math.pow(insidefin.x1,2));
		if(Math.round(finx1y) == Math.round(insidefin.y1)){
			insidefin.pt1x = insidefin.x1;
			insidefin.pt1y = insidefin.y1;
			insidefin.pt2x = insidefin.x2;
			insidefin.pt2y = insidefin.y2;
			insidefin.pt1angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x1-firstturn.x,insidefin.y1-firstturn.y)),direction1);
			insidefin.pt2angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x2-firstturn.x,insidefin.y2-firstturn.y)),direction1);
		}
		else{
			insidefin.pt1x = insidefin.x1;
			insidefin.pt1y = insidefin.y2;
			insidefin.pt2x = insidefin.x2;
			insidefin.pt2y = insidefin.y1;
			insidefin.pt1angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x1-firstturn.x,insidefin.y2-firstturn.y)),direction1);
			insidefin.pt2angle = flightPlanner.addtoangle(flightPlanner.radtodeg(Math.atan2(insidefin.x2-firstturn.x,insidefin.y1-firstturn.y)),direction1);
		}

		if(Math.round((360+flightPlanner.radtodeg(Math.atan2(insidefin.pt1x-insideinit.pt1x,insidefin.pt1y-insideinit.pt1y)))%360) == Math.round(insideinit.pt1angle)){
			result.firstx = insideinit.pt1x;
			result.firsty = insideinit.pt1y;
			result.lastx = insidefin.pt1x;
			result.lasty = insidefin.pt1y;
		}

		if(Math.round((360+flightPlanner.radtodeg(Math.atan2(insidefin.pt2x-insideinit.pt1x,insidefin.pt2y-insideinit.pt1y)))%360) == Math.round(insideinit.pt1angle)){
				result.firstx = insideinit.pt1x;
				result.firsty = insideinit.pt1y;
				result.lastx = insidefin.pt2x;
				result.lasty = insidefin.pt2y;
		}

		if(Math.round((360+flightPlanner.radtodeg(Math.atan2(insidefin.pt2x-insideinit.pt2x,insidefin.pt2y-insideinit.pt2y)))%360) == Math.round(insideinit.pt2angle)){
				result.firstx = insideinit.pt2x;
				result.firsty = insideinit.pt2y;
				result.lastx = insidefin.pt2x;
				result.lasty = insidefin.pt2y;
		}

		if(Math.round((360+flightPlanner.radtodeg(Math.atan2(insidefin.pt1x-insideinit.pt2x,insidefin.pt1y-insideinit.pt2y)))%360) == Math.round(insideinit.pt2angle)){
				result.firstx = insideinit.pt2x;
				result.firsty = insideinit.pt2y;
				result.lastx = insidefin.pt1x;
				result.lasty = insidefin.pt1y;
		};
	}

		return result;
};

flightPlanner.pathdistance = function(startx,starty,departx,departy,arrivex,arrivey,endx,endy,circle1x,circle1y,circle2x,circle2y,direction1,direction2,turnradv){
	if(departx == arrivex || departy == arrivey)
		return
	var angle1 = flightPlanner.radtodeg(Math.atan2(startx-circle1x,starty-circle1y));
	var angle2 = flightPlanner.radtodeg(Math.atan2(departx-circle1x,departy-circle1y));
	var angle3 = flightPlanner.radtodeg(Math.atan2(arrivex-circle2x,arrivey-circle2y));
	var angle4 = flightPlanner.radtodeg(Math.atan2(endx-circle2x,endy-circle2y));
	var angulardistance1 = direction1 / 90 * angle2 - direction1 / 90 * angle1;
	angulardistance1 = (360 + angulardistance1) % 360;
	angulardistance1 = 2 * Math.PI * turnradv * angulardistance1 / 360;
	var angulardistance2 = direction2 / 90 * angle4 - direction2 / 90 * angle3;
	angulardistance2 = (360 + angulardistance2) % 360;
	angulardistance2 = 2 * Math.PI * turnradv * angulardistance2 / 360;
	var straightdistance = flightPlanner.distbtwnpt(departx,departy,arrivex,arrivey);
	var totaldistance = angulardistance1 + angulardistance2 + straightdistance;
	return totaldistance;
};


flightPlanner.tangentcirclepathdistance = function(startx,starty,startcircle,tangentcircle,tangentline,endx,endy,endcircle,direction1,direction2,direction3,turnrad){

	var angle1 = (360+flightPlanner.radtodeg(Math.atan2(startx-startcircle.x,starty-startcircle.y)))%360;
	var angle2 = (360+flightPlanner.radtodeg(Math.atan2(tangentcircle.xint-startcircle.x,tangentcircle.yint-startcircle.y)))%360;
	var angle3 = (360+flightPlanner.radtodeg(Math.atan2(tangentcircle.xint-tangentcircle.x,tangentcircle.yint-tangentcircle.y)))%360;
	var angle4 = (360+flightPlanner.radtodeg(Math.atan2(tangentline.firstx-tangentcircle.x,tangentline.firsty-tangentcircle.y)))%360;
	var angle5 = (360+flightPlanner.radtodeg(Math.atan2(tangentline.lastx-endcircle.x,tangentline.lasty-endcircle.y)))%360;
	var angle6 = (360+flightPlanner.radtodeg(Math.atan2(endx-endcircle.x,endy-endcircle.y)))%360;
	var angulardistance1 = direction1 / 90 * angle2 - direction1 / 90 * angle1;
	angulardistance1 = (360 + angulardistance1) % 360;
	angulardistance1 = 2 * Math.PI * turnrad * angulardistance1 / 360;
	var angulardistance2 = direction2 / 90 * angle4 - direction2 / 90 * angle3;
	angulardistance2 = (360 + angulardistance2) % 360;
	angulardistance2 = 2 * Math.PI * turnrad * angulardistance2 / 360;
	var angulardistance3 = direction3 / 90 * angle6 - direction3 / 90 * angle5;
	angulardistance3 = (360 + angulardistance3) % 360;
	angulardistance3 = 2 * Math.PI * turnrad * angulardistance3 / 360;
	var straightdistance1 = flightPlanner.distbtwnpt(tangentline.firstx,tangentline.firsty,tangentline.lastx,tangentline.lasty);
	var totaldistance = angulardistance1 + angulardistance2 + angulardistance3 + straightdistance1;
	return totaldistance;
};

flightPlanner.generatetangentcircle = function(x1,y1,x2,y2,turnradv){
	var heading = (flightPlanner.radtodeg(Math.atan2(x2-x1,y2-y1)) + 360) % 360;
	var initdist = flightPlanner.distbtwnpt(x1,y1,x2,y2);
	var perpdist = Math.pow(Math.pow(2*turnradv,2)- Math.pow(initdist/2,2),.5);
	var intermediatex = flightPlanner.newx(x1,heading,initdist/2);
	var intermediatey = flightPlanner.newy(y1,heading,initdist/2);
	var tangentcircle = new Object;
	tangentcircle.right = { };
	tangentcircle.left = { };
	tangentcircle.right.x = flightPlanner.newx(intermediatex,heading+90,perpdist);
	tangentcircle.right.y = flightPlanner.newy(intermediatey,heading+90,perpdist);
	tangentcircle.left.x = flightPlanner.newx(intermediatex,heading-90,perpdist);
	tangentcircle.left.y = flightPlanner.newy(intermediatey,heading-90,perpdist);
	var intheadright = (flightPlanner.radtodeg(Math.atan2(x1-tangentcircle.right.x,y1-tangentcircle.right.y)) + 360) % 360;
	var intheadleft = (flightPlanner.radtodeg(Math.atan2(x1-tangentcircle.left.x,y1-tangentcircle.left.y)) + 360) % 360;
	tangentcircle.right.xint = flightPlanner.newx(tangentcircle.right.x,intheadright,turnradv);
	tangentcircle.right.yint = flightPlanner.newy(tangentcircle.right.y,intheadright,turnradv);
	tangentcircle.left.xint = flightPlanner.newx(tangentcircle.left.x,intheadleft,turnradv);
	tangentcircle.left.yint = flightPlanner.newy(tangentcircle.left.y,intheadleft,turnradv);
	return tangentcircle;
};


flightPlanner.calcmindist = function(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad){
	mindist = 9000000000000000000000000000000000000000000000000000;
	rightoutside.distance = flightPlanner.pathdistance(initx,inity,rightoutside.firstx,rightoutside.firsty,rightoutside.lastx,rightoutside.lasty,finx,finy,circles.initright.x,circles.initright.y,circles.finright.x,circles.finright.y,90,90,turnrad);
	if(rightoutside.distance)
		mindist = rightoutside.distance;
	leftoutside.distance = flightPlanner.pathdistance(initx,inity,leftoutside.firstx,leftoutside.firsty,leftoutside.lastx,leftoutside.lasty,finx,finy,circles.initleft.x,circles.initleft.y,circles.finleft.x,circles.finleft.y,-90,-90,turnrad);
	if(leftoutside.distance)
		mindist = Math.min(mindist,leftoutside.distance);
	rightinside.distance = flightPlanner.pathdistance(initx,inity,rightinside.firstx,rightinside.firsty,rightinside.lastx,rightinside.lasty,finx,finy,circles.initright.x,circles.initright.y,circles.finleft.x,circles.finleft.y,90,-90,turnrad);
	if(rightinside.distance)
		mindist = Math.min(mindist,rightinside.distance);
	leftinside.distance = flightPlanner.pathdistance(initx,inity,leftinside.firstx,leftinside.firsty,leftinside.lastx,leftinside.lasty,finx,finy,circles.initleft.x,circles.initleft.y,circles.finright.x,circles.finright.y,-90,90,turnrad);
	if(leftinside.distance)
		mindist = Math.min(mindist,leftinside.distance);
	if(tangentoutside.rr.firstx){
		flightPlanner.turns.torrd = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initright,tangentcircler.right,tangentoutside.rr,finx,finy,circles.finleft,90,-90,-90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.torrd);
	}
	if(tangentoutside.rl.firstx){
		flightPlanner.turns.torld = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initright,tangentcircler.left,tangentoutside.rl,finx,finy,circles.finleft,90,-90,-90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.torld);
	}
	if(tangentoutside.ll.firstx){
		flightPlanner.turns.tolld = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initleft,tangentcirclel.left,tangentoutside.ll,finx,finy,circles.finright,-90,90,90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tolld);
	}
	if(tangentoutside.lr.firstx){
		flightPlanner.turns.tolrd = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initleft,tangentcirclel.right,tangentoutside.lr,finx,finy,circles.finright,-90,90,90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tolrd);
	}

	if(tangentinside.rr.firstx){
		flightPlanner.turns.tirrd = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initright,tangentcircler.right,tangentinside.rr,finx,finy,circles.finright,90,-90,90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tirrd);
	}
	if(tangentinside.rl.firstx){
		flightPlanner.turns.tirld = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initright,tangentcircler.left,tangentinside.rl,finx,finy,circles.finright,90,-90,90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tirld);
	}
	if(tangentinside.ll.firstx){
		flightPlanner.turns.tilld = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initleft,tangentcirclel.left,tangentinside.ll,finx,finy,circles.finleft,-90,90,-90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tilld);
	}
	if(tangentinside.lr.firstx){
		flightPlanner.turns.tilrd = flightPlanner.tangentcirclepathdistance(initx,inity,circles.initleft,tangentcirclel.right,tangentinside.lr,finx,finy,circles.finleft,-90,90,-90,turnrad);
		mindist = Math.min(mindist,flightPlanner.turns.tilrd);
	}
	return mindist;
};


flightPlanner.cpddrawtangent = function(startx,starty,endx,endy,startcircle,tangentcircle,path,endcircle,direction1,direction2,direction3,turnrad){
	var startcircleval = new Object;
	startcircleval = converttofake(startcircle.x,-1*startcircle.y);
	var endcircleval = new Object;
	endcircleval = converttofake(endcircle.x,-1*endcircle.y);
	var tangentcircleval = new Object;
	tangentcircleval = converttofake(tangentcircle.x,-1*tangentcircle.y);
	var startpath = new Object;
	startpath = converttofake(path.firstx,-1*path.firsty);
	var endpath = new Object;
	endpath = converttofake(path.lastx,-1*path.lasty);
	cpdcontext.beginPath();
	cpdcontext.arc(startcircleval.x,startcircleval.y,scalevalue(turnrad),Math.atan2(startx-startcircle.x,starty-startcircle.y)-Math.PI/2,Math.atan2(tangentcircle.xint-startcircle.x,tangentcircle.yint-startcircle.y)-Math.PI/2,direction1);
	cpdcontext.stroke();
	cpdcontext.beginPath();
	cpdcontext.arc(tangentcircleval.x,tangentcircleval.y,scalevalue(turnrad),Math.atan2(tangentcircle.xint-tangentcircle.x,tangentcircle.yint-tangentcircle.y)-Math.PI/2,Math.atan2(path.firstx-tangentcircle.x,path.firsty-tangentcircle.y)-Math.PI/2,direction2);
	cpdcontext.stroke();
	cpdcontext.beginPath();
	cpdcontext.moveTo(startpath.x,startpath.y);
	cpdcontext.lineTo(endpath.x,endpath.y);
	cpdcontext.stroke();
	cpdcontext.beginPath();
	cpdcontext.arc(endcircleval.x,endcircleval.y,scalevalue(turnrad),Math.atan2(path.lastx-endcircle.x,path.lasty-endcircle.y)-Math.PI/2,Math.atan2(endx-endcircle.x,endy-endcircle.y)-Math.PI/2,direction3);
	cpdcontext.stroke();
};

flightPlanner.scalevalue = function(value){
	 value = value   / cpdmaxdistance * Math.min(cpdres.x,cpdres.y) * cpdscale;
		return value;
};
flightPlanner.cpddrawvanilla = function(startx,starty,endx,endy,startcircle,path,endcircle,direction1,direction2,turnrad){
	var startcircleval = new Object;
	startcircleval = converttofake(startcircle.x,-1*startcircle.y);
	var endcircleval = new Object;
	endcircleval = converttofake(endcircle.x,-1*endcircle.y);
	var startpath = new Object;
	startpath = converttofake(path.firstx,-1*path.firsty);
	var endpath = new Object;
	endpath = converttofake(path.lastx,-1*path.lasty);
	cpdcontext.beginPath();
	cpdcontext.arc(startcircleval.x,startcircleval.y,scalevalue(turnrad),Math.atan2(startx-startcircle.x,starty-startcircle.y)-Math.PI/2,Math.atan2(path.firstx-startcircle.x,path.firsty-startcircle.y)-Math.PI/2,direction1);
	cpdcontext.stroke();
	cpdcontext.beginPath();
	cpdcontext.moveTo(startpath.x,startpath.y);
	cpdcontext.lineTo(endpath.x,endpath.y);
	cpdcontext.stroke();
	cpdcontext.beginPath();
	cpdcontext.arc(endcircleval.x,endcircleval.y,scalevalue(turnrad),Math.atan2(path.lastx-endcircle.x,path.lasty-endcircle.y)-Math.PI/2,Math.atan2(endx-endcircle.x,endy-endcircle.y)-Math.PI/2,direction2);
	cpdcontext.stroke();
};

flightPlanner.cpddrawbestpath = function(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,turnrad){
cpdcontext.strokeStyle = "#FF00FF";
	if(rightoutside.distance == mindist){
		cpddrawvanilla(initx,inity,finx,finy,circles.initright,rightoutside,circles.finright,false,false,turnrad);
	}
	else if(leftoutside.distance == mindist){
		cpddrawvanilla(initx,inity,finx,finy,circles.initleft,leftoutside,circles.finleft,true,true,turnrad);
	}
	else if(rightinside.distance == mindist){
		cpddrawvanilla(initx,inity,finx,finy,circles.initright,rightinside,circles.finleft,false,true,turnrad);
	}
	else if(leftinside.distance == mindist){
		cpddrawvanilla(initx,inity,finx,finy,circles.initleft,leftinside,circles.finright,true,false,turnrad);
	}
	else if(flightPlanner.turns.torrd == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentoutside.rr,circles.finleft,false,true,true,turnrad);
	}
	else if(flightPlanner.turns.torld == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentoutside.rl,circles.finleft,false,true,true,turnrad);
	}
	else if(flightPlanner.turns.tolld == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentoutside.ll,circles.finright,true,false,false,turnrad);
	}
	else if(flightPlanner.turns.tolrd == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentoutside.lr,circles.finright,true,false,false,turnrad);
	}
	else if(flightPlanner.turns.tirrd == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentinside.rr,circles.finright,false,true,false,turnrad);
	}
	else if(flightPlanner.turns.tirld == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentinside.rl,circles.finright,false,true,false,turnrad);
	}
	else if(flightPlanner.turns.tilld == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentinside.ll,circles.finleft,true,false,true,turnrad);
	}
	else if(flightPlanner.turns.tilrd == mindist){
		cpddrawtangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentinside.lr,circles.finleft,true,false,true,turnrad);
	}
};
flightPlanner.arclength = function(centerx,centery,startx,starty,endx,endy,turnradv,directionx){
	var angle1 = (360+flightPlanner.radtodeg(Math.atan2(startx-centerx,starty-centery)))%360;
	var angle2 = (360+flightPlanner.radtodeg(Math.atan2(endx-centerx,endy-centery)))%360;
	var angulardistance = parseFloat(directionx) / 90 * angle2 - parseFloat(directionx) / 90 * angle1;
	angulardistance = (360 + angulardistance) % 360;
	angulardistance = 2 * Math.PI * turnradv * angulardistance / 360;
	return angulardistance;
};


flightPlanner.movealongarc = function(centerx,centery,startx,starty,turnradv,direction,secdist){
	var angulardistance = secdist/(2*Math.PI*turnradv)*360;
	var angle1 = (360+flightPlanner.radtodeg(Math.atan2(startx-centerx,starty-centery)))%360;
	var angle2 = (angulardistance + direction/90*angle1)*90/direction;
	angle2 = (360 + angle2) % 360;
	var posit = new Object;
	posit.x = centerx + turnradv * Math.sin(flightPlanner.degtorad(angle2));
	posit.y = centery + turnradv * Math.cos(flightPlanner.degtorad(angle2));
	posit.head = Math.atan2(posit.x-centerx,posit.y-centery) + direction / 90 * Math.PI / 2;
	return posit;
};

flightPlanner.movealongline = function(startx,starty,endx,endy,secdist){
	var angle = Math.atan2(endx-startx,endy-starty);
	var posit = new Object;
	posit.x = startx + secdist * Math.sin((angle));
	posit.y = starty + secdist * Math.cos((angle));
	posit.head = Math.atan2(endx-startx,endy-starty);
	return posit;
};

flightPlanner.storetangent = function(startx,starty,endx,endy,startcircle,tangentcircle,path,endcircle,direction1,direction2,direction3,turnrad,secdist,gamepath){
	var tangentstart = new Object;
	tangentstart.x = tangentcircle.xint;
	tangentstart.y = tangentcircle.yint;
	var startpath = new Object;
	startpath.x = path.firstx;
	startpath.y = path.firsty;
	var endpath = new Object;
	endpath.x = path.lastx;
	endpath.y = path.lasty;

	gamepath.push();
	//calc firs turn
	gamepath[gamepath.length-1] = new Object;
	gamepath[gamepath.length-1].x = startx;
	gamepath[gamepath.length-1].y = starty;
	
	var arclength1 = flightPlanner.arclength(startcircle.x,startcircle.y,startx,starty,tangentstart.x,tangentstart.y,turnrad,direction1);
	var priorlength = gamepath.length;
	var newspots = Math.floor(arclength1/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(startcircle.x,startcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction1,secdist));
	}

	//calc second turn
	var arclength2 = flightPlanner.arclength(tangentcircle.x,tangentcircle.y,tangentstart.x,tangentstart.y,startpath.x,startpath.y,turnrad,direction2);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength2/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(tangentcircle.x,tangentcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction2,secdist));
	}

	//calc third turn
	var arclength3 = flightPlanner.arclength(endcircle.x,endcircle.y,endpath.x,endpath.y,endx,endy,turnrad,direction3);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength3/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(endcircle.x,endcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction3,secdist));
	}




	return gamepath;
};


flightPlanner.storetangentlat = function(initLat,initLng,finLat,finLng,startx,starty,endx,endy,startcircle,tangentcircle,path,endcircle,direction1,direction2,direction3,turnrad,secdist,gamepath){
	console.log("tangent")
	var tangentstart = new Object;
	tangentstart.x = tangentcircle.xint;
	tangentstart.y = tangentcircle.yint;
	var startpath = new Object;
	startpath.x = path.firstx;
	startpath.y = path.firsty;
	var endpath = new Object;
	endpath.x = path.lastx;
	endpath.y = path.lasty;

	gamepath.push();
	//calc firs turn
	gamepath[gamepath.length-1] = new Object;
	gamepath[gamepath.length-1].x = startx;
	gamepath[gamepath.length-1].y = starty;
	var latpath = [];
	latpath.push();
	latpath[latpath.length-1] = new Object;
	latpath[latpath.length-1].latlng = [initLat,initLng];

	var arclength1 = flightPlanner.arclength(startcircle.x,startcircle.y,startx,starty,tangentstart.x,tangentstart.y,turnrad,direction1);
	var priorlength = gamepath.length;
	var newspots = Math.floor(arclength1/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(startcircle.x,startcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction1,secdist));
		var brngAndDist = flightPlanner.distAndBrngBtwnPt(startx,starty,gamepath[i].x,gamepath[i].y)
		var latlng = flightPlanner.llFromDistance(initLat, initLng, brngAndDist.distance, brngAndDist.brng)
		latpath.push(latlng);
	}

	//calc second turn
	var arclength2 = flightPlanner.arclength(tangentcircle.x,tangentcircle.y,tangentstart.x,tangentstart.y,startpath.x,startpath.y,turnrad,direction2);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength2/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(tangentcircle.x,tangentcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction2,secdist));
		brngAndDist = flightPlanner.distAndBrngBtwnPt(startx,starty,gamepath[i].x,gamepath[i].y)
		latlng = flightPlanner.llFromDistance(initLat, initLng, brngAndDist.distance, brngAndDist.brng)
		latpath.push(latlng);
	}

	//calc third turn
	var arclength3 = flightPlanner.arclength(endcircle.x,endcircle.y,endpath.x,endpath.y,endx,endy,turnrad,direction3);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength3/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(endcircle.x,endcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction3,secdist));
		brngAndDist = flightPlanner.distAndBrngBtwnPt(endx,endy,gamepath[i].x,gamepath[i].y)
		latlng = flightPlanner.llFromDistance(finLat, finLng, brngAndDist.distance, brngAndDist.brng)
		latpath.push(latlng);
	}




	latpath.push([finLat,finLng])
	return {"gamepath":gamepath,"latpath":latpath};
};

flightPlanner.storevanilla = function(startx,starty,endx,endy,startcircle,path,endcircle,direction1,direction2,turnrad,secdist,gamepath){
	var startpath = new Object;
	startpath.x = path.firstx;
	startpath.y = path.firsty;
	var endpath = new Object;
	endpath.x = path.lastx;
	endpath.y = path.lasty;
	gamepath.push();
	gamepath[gamepath.length-1] = new Object;
	gamepath[gamepath.length-1].x = startx;
	gamepath[gamepath.length-1].y = starty;
	var arclength1 = flightPlanner.arclength(startcircle.x,startcircle.y,startx,starty,startpath.x,startpath.y,turnrad,direction1);
	var priorlength = gamepath.length;
	var newspots = Math.floor(arclength1/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(startcircle.x,startcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction1,secdist));
	}
	var linelength = flightPlanner.distbtwnpt(startpath.x,startpath.y,endpath.x,endpath.y);
	priorlength = gamepath.length;
	newspots = Math.floor(linelength/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongline(gamepath[i-1].x,gamepath[i-1].y,endpath.x,endpath.y,secdist));
	}
	var arclength2 = flightPlanner.arclength(endcircle.x,endcircle.y,endpath.x,endpath.y,endx,endy,turnrad,direction2);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength2/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(endcircle.x,endcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction2,secdist));
	}
	return gamepath;
};

flightPlanner.storevanillalat = function(initLat,initLng,finLat,finLng,startx,starty,endx,endy,startcircle,path,endcircle,direction1,direction2,turnrad,secdist,gamepath){
	console.log("vanilla")
	var startpath = new Object;
	startpath.x = path.firstx;
	startpath.y = path.firsty;
	var endpath = new Object;
	endpath.x = path.lastx;
	endpath.y = path.lasty;
	gamepath.push();
	gamepath[gamepath.length-1] = new Object;
	gamepath[gamepath.length-1].x = startx;
	gamepath[gamepath.length-1].y = starty;

	var latpath = [];
	latpath.push();
	latpath[latpath.length-1] = new Object;
	latpath[latpath.length-1].latlng = [initLat,initLng];

	

	//first turn
	var arclength1 = flightPlanner.arclength(startcircle.x,startcircle.y,startx,starty,startpath.x,startpath.y,turnrad,direction1);
	var priorlength = gamepath.length;
	var newspots = Math.floor(arclength1/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(startcircle.x,startcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction1,secdist));
		var brngAndDist = flightPlanner.distAndBrngBtwnPt(startx,starty,gamepath[i].x,gamepath[i].y)
		var latlng = flightPlanner.llFromDistance(initLat, initLng, brngAndDist.distance, brngAndDist.brng)
		latpath.push(latlng);
	}


	//straight path gamepath
	var linelength = flightPlanner.distbtwnpt(startpath.x,startpath.y,endpath.x,endpath.y);
	priorlength = gamepath.length;
	newspots = Math.floor(linelength/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongline(gamepath[i-1].x,gamepath[i-1].y,endpath.x,endpath.y,secdist));
	}

	//straight path latpath
	var straightStart = latpath[latpath.length-1];
	var endBrngAndDist = flightPlanner.distAndBrngBtwnPt(endx,endy,endpath.x,endpath.y);
	var straightEnd = flightPlanner.llFromDistance(finLat, finLng, endBrngAndDist.distance, endBrngAndDist.brng)

	var generator = new arc.GreatCircle({y:straightStart[0],x:straightStart[1]}, {y:straightEnd[0],x:straightEnd[1]}, {'name': 'straight path'});
    var line = generator.Arc(50);
	var testLatLngs = line.geometries[0].coords;
    for(var i=0;i<testLatLngs.length;i++){
		latpath.push([testLatLngs[i][1],testLatLngs[i][0]])
    }
	


	//final turn
	var arclength2 = flightPlanner.arclength(endcircle.x,endcircle.y,endpath.x,endpath.y,endx,endy,turnrad,direction2);
	priorlength = gamepath.length;
	newspots = Math.floor(arclength2/secdist);
	for(i = priorlength; i < newspots + priorlength; i++){
		gamepath.push(flightPlanner.movealongarc(endcircle.x,endcircle.y,gamepath[i-1].x,gamepath[i-1].y,turnrad,direction2,secdist));
		brngAndDist = flightPlanner.distAndBrngBtwnPt(endx,endy,gamepath[i].x,gamepath[i].y)
		latlng = flightPlanner.llFromDistance(finLat, finLng, brngAndDist.distance, brngAndDist.brng)
		latpath.push(latlng);
	}

	latpath.push([finLat,finLng])
	return {"gamepath":gamepath,"latpath":latpath};
};


flightPlanner.storebestpath = function(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad,secdist,gamepath){
//cpdcontext.strokeStyle = "#FF00FF";
	if(rightoutside.distance == mindist){
		gamepath = flightPlanner.storevanilla(initx,inity,finx,finy,circles.initright,rightoutside,circles.finright,90,90,turnrad,secdist,gamepath);
	}
	else if(leftoutside.distance == mindist){
		gamepath = flightPlanner.storevanilla(initx,inity,finx,finy,circles.initleft,leftoutside,circles.finleft,-90,-90,turnrad,secdist,gamepath);
	}
	else if(rightinside.distance == mindist){
		gamepath = flightPlanner.storevanilla(initx,inity,finx,finy,circles.initright,rightinside,circles.finleft,90,-90,turnrad,secdist,gamepath);
	}
	else if(leftinside.distance == mindist){
		gamepath = flightPlanner.storevanilla(initx,inity,finx,finy,circles.initleft,leftinside,circles.finright,-90,90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.torrd == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentoutside.rr,circles.finleft,90,-90,-90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.torld == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentoutside.rl,circles.finleft,90,-90,-90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tolld == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentoutside.ll,circles.finright,-90,90,90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tolrd == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentoutside.lr,circles.finright,-90,90,90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tirrd == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentinside.rr,circles.finright,90,-90,90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tirld == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentinside.rl,circles.finright,90,-90,90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tilld == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentinside.ll,circles.finleft,-90,90,-90,turnrad,secdist,gamepath);
	}
	else if(flightPlanner.turns.tilrd == mindist){
		gamepath = flightPlanner.storetangent(initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentinside.lr,circles.finleft,-90,90,-90,turnrad,secdist,gamepath);
	}
	return gamepath;
};


flightPlanner.storelatpath = function(initLat,initLng,finLat,finLng,initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad,secdist,gamepath){
	//cpdcontext.strokeStyle = "#FF00FF";
		var pathType = ""
		if(rightoutside.distance == mindist){
			pathType = "rightoutside";
			gamepath = flightPlanner.storevanillalat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,rightoutside,circles.finright,90,90,turnrad,secdist,gamepath);
		}
		else if(leftoutside.distance == mindist){
			pathType = "leftoutside";
			gamepath = flightPlanner.storevanillalat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,leftoutside,circles.finleft,-90,-90,turnrad,secdist,gamepath);
		}
		else if(rightinside.distance == mindist){
			pathType = "rightinside";
			gamepath = flightPlanner.storevanillalat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,rightinside,circles.finleft,90,-90,turnrad,secdist,gamepath);
		}
		else if(leftinside.distance == mindist){
			pathType = "leftinside";
			gamepath = flightPlanner.storevanillalat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,leftinside,circles.finright,-90,90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.torrd == mindist){
			pathType = "torrd";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentoutside.rr,circles.finleft,90,-90,-90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.torld == mindist){
			pathType = "torld";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentoutside.rl,circles.finleft,90,-90,-90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tolld == mindist){
			pathType = "tolld";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentoutside.ll,circles.finright,-90,90,90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tolrd == mindist){
			pathType = "tolrd";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentoutside.lr,circles.finright,-90,90,90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tirrd == mindist){
			pathType = "tirrd";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,tangentcircler.right,tangentinside.rr,circles.finright,90,-90,90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tirld == mindist){
			pathType = "tirld";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initright,tangentcircler.left,tangentinside.rl,circles.finright,90,-90,90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tilld == mindist){
			pathType = "tilld";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,tangentcirclel.left,tangentinside.ll,circles.finleft,-90,90,-90,turnrad,secdist,gamepath);
		}
		else if(flightPlanner.turns.tilrd == mindist){
			pathType = "tilrd";
			gamepath = flightPlanner.storetangentlat(initLat,initLng,finLat,finLng,initx,inity,finx,finy,circles.initleft,tangentcirclel.right,tangentinside.lr,circles.finleft,-90,90,-90,turnrad,secdist,gamepath);
		}
		console.log(pathType)
		return gamepath;
	};

	
flightPlanner.drawpoints = function(startx,starty,endx,endy){
	ctx.strokeStyle = "#CCCCCC";
	ctx.beginPath();
	ctx.arc(startx,-1*starty,2,0,2*Math.PI);
	ctx.stroke();
	ctx.strokeStyle = "#FF00FF";
	ctx.beginPath();
	ctx.arc(endx,-1*endy,2,0,2*Math.PI);
	ctx.stroke();
};

flightPlanner.turns = new Object;


  //get distance in nm
flightPlanner.llFromDistance = function(latitude, longitude, distance, bearing) {
	// taken from: https://stackoverflow.com/a/46410871/13549 
	// distance in KM, bearing in degrees
	distance *= 1.852;//converts to KM
	const R = 6378.1; // Radius of the Earth
	const brng = bearing * Math.PI / 180; // Convert bearing to radian
	let lat = latitude * Math.PI / 180; // Current coords to radians
	let lon = longitude * Math.PI / 180;

	// Do the math magic
	lat = Math.asin(Math.sin(lat) * Math.cos(distance / R) + Math.cos(lat) * Math.sin(distance / R) * Math.cos(brng));
	lon += Math.atan2(Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat), Math.cos(distance / R) - Math.sin(lat) * Math.sin(lat));

	// Coords back to degrees and return
	return [(lat * 180 / Math.PI), (lon * 180 / Math.PI)];
}

flightPlanner.get_bearing_between_two_points = function(lat1,lng1,lat2,lng2){
	let startLat = this.degtorad(lat1);
	let startLng = this.degtorad(lng1);
	let destLat = this.degtorad(lat2);
	let destLng = this.degtorad(lng2);

	let y = Math.sin(destLng - startLng) * Math.cos(destLat);
	let x = Math.cos(startLat) * Math.sin(destLat) -
			Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
	let brng = Math.atan2(y, x);
	brng = this.radtodeg(brng);
	return (brng + 360) % 360;
}

flightPlanner.get_distance_between_points = function(lat1, lon1, lat2, lon2){
	var R = 6371; // km
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180;
	lat1 = (lat1) * Math.PI / 180;
	lat2 = (lat2) * Math.PI / 180;

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d / 1.852;
}
//secdist is how often you want a position in the gamepath array
//you can use any units as long as you are consistent across all variables
flightPlanner.turnCalculator = function(initx,inity,inithead,finx,finy,finhead,speed,aob,secdist){
	var turnrad = flightPlanner.getTurnRadius(speed,aob);
	var circles = flightPlanner.generatecircles(initx,inity,finx,finy,inithead,finhead,turnrad);
	var rightoutside = flightPlanner.determineoutsidetangent(circles.initright,circles.finright,90,turnrad);
	var leftoutside = flightPlanner.determineoutsidetangent(circles.initleft,circles.finleft,-90,turnrad);
	var rightinside = flightPlanner.determineinsidetangent(circles.initright,circles.finleft,90,-90,turnrad);
	var leftinside = flightPlanner.determineinsidetangent(circles.initleft,circles.finright,-90,90,turnrad);
	var tangentcircler = flightPlanner.generatetangentcircle(circles.initright.x,circles.initright.y,circles.finright.x,circles.finright.y,turnrad);
	var tangentcirclel = flightPlanner.generatetangentcircle(circles.initleft.x,circles.initleft.y,circles.finleft.x,circles.finleft.y,turnrad);

	var tangentoutside = {
	rr: flightPlanner.determineoutsidetangent(tangentcircler.right,circles.finleft,-90,turnrad),
	rl:	flightPlanner.determineoutsidetangent(tangentcircler.left,circles.finleft,-90,turnrad),
	lr: flightPlanner.determineoutsidetangent(tangentcirclel.right,circles.finright,90,turnrad),
	ll: flightPlanner.determineoutsidetangent(tangentcirclel.left,circles.finright,90,turnrad)};
	var tangentinside = {
	rr: flightPlanner.determineinsidetangent(tangentcircler.right,circles.finright,-90,90,turnrad),
	rl: flightPlanner.determineinsidetangent(tangentcircler.left,circles.finright,-90,90,turnrad),
	ll: flightPlanner.determineinsidetangent(tangentcirclel.left,circles.finleft,90,-90,turnrad),
	lr: flightPlanner.determineinsidetangent(tangentcirclel.right,circles.finleft,90,-90,turnrad)};
	var mindist = flightPlanner.calcmindist(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad);
	var gamepath = flightPlanner.storebestpath(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad,secdist,[]);
	
	
	//add the starting and ending positions to the gamepath
	gamepath.unshift({x:initx,y:inity,head:flightPlanner.degtorad(inithead)});
	gamepath.push({x:finx,y:finy,head:flightPlanner.degtorad(finhead)});
	
	return {"mindist":mindist,"gamepath":gamepath};

};

flightPlanner.distAndBrngBtwnPt = function(x1,y1,x2,y2){
	var result = {};
	result.distance = Math.pow(Math.pow(x1-x2,2)+Math.pow(y1-y2,2),.5);
	result.brng = flightPlanner.radtodeg(Math.atan2((x2-x1),(y2-y1)));
	return result;
}

flightPlanner.measureLatPathLength = function(latpath){
	var dist = 0;
	for(var i=1;i<latpath.length;i++){
		dist += flightPlanner.get_distance_between_points(latpath[i-1][0], latpath[i-1][1], latpath[i][0], latpath[i][1])
	}
	return dist;
}

//secdist is how often you want a position in the gamepath array
//turnrad and secdist should be nautical miles
flightPlanner.latLongTurnCalculator = function(initLat,initLng,inithead,finLat,finLng,finhead,speed,aob,secdist){
	if(!secdist)
		secdist = .05;
	var turnrad = flightPlanner.getTurnRadius(speed,aob);
	var initx = 0;
	var inity = 0;
	//
	//
	var bearing = flightPlanner.get_bearing_between_two_points(initLat,initLng,finLat,finLng)
	var distance = flightPlanner.get_distance_between_points(initLat,initLng,finLat,finLng)

	var finx = initx + distance * Math.sin(flightPlanner.degtorad(bearing));
	var finy = inity + distance * Math.cos(flightPlanner.degtorad(bearing));


	var circles = flightPlanner.generatecircles(initx,inity,finx,finy,inithead,finhead,turnrad);
	var rightoutside = flightPlanner.determineoutsidetangent(circles.initright,circles.finright,90,turnrad);
	var leftoutside = flightPlanner.determineoutsidetangent(circles.initleft,circles.finleft,-90,turnrad);
	var rightinside = flightPlanner.determineinsidetangent(circles.initright,circles.finleft,90,-90,turnrad);
	var leftinside = flightPlanner.determineinsidetangent(circles.initleft,circles.finright,-90,90,turnrad);
	var tangentcircler = flightPlanner.generatetangentcircle(circles.initright.x,circles.initright.y,circles.finright.x,circles.finright.y,turnrad);
	var tangentcirclel = flightPlanner.generatetangentcircle(circles.initleft.x,circles.initleft.y,circles.finleft.x,circles.finleft.y,turnrad);
	var tangentoutside = {
	rr: flightPlanner.determineoutsidetangent(tangentcircler.right,circles.finleft,-90,turnrad),
	rl:	flightPlanner.determineoutsidetangent(tangentcircler.left,circles.finleft,-90,turnrad),
	lr: flightPlanner.determineoutsidetangent(tangentcirclel.right,circles.finright,90,turnrad),
	ll: flightPlanner.determineoutsidetangent(tangentcirclel.left,circles.finright,90,turnrad)};
	var tangentinside = {
	rr: flightPlanner.determineinsidetangent(tangentcircler.right,circles.finright,-90,90,turnrad),
	rl: flightPlanner.determineinsidetangent(tangentcircler.left,circles.finright,-90,90,turnrad),
	ll: flightPlanner.determineinsidetangent(tangentcirclel.left,circles.finleft,90,-90,turnrad),
	lr: flightPlanner.determineinsidetangent(tangentcirclel.right,circles.finleft,90,-90,turnrad)};


	console.log(rightinside)
	
	var mindist = flightPlanner.calcmindist(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad);

	var gamepath = flightPlanner.storebestpath(initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad,secdist,[]);
	
	var gameAndLatpath = flightPlanner.storelatpath(initLat,initLng,finLat,finLng,initx,inity,rightoutside,rightinside,leftoutside,leftinside,circles,finx,finy,tangentoutside,tangentinside,tangentcircler,tangentcirclel,turnrad,secdist,[]);

	//add the starting and ending positions to the gamepath
	gamepath.unshift({x:initx,y:inity,head:flightPlanner.degtorad(inithead)});
	gamepath.push({x:finx,y:finy,head:flightPlanner.degtorad(finhead)});
	

	mindist = flightPlanner.measureLatPathLength(gameAndLatpath.latpath);

	var flightMinutes = mindist / speed * 60;//minutes
	return {"dist":mindist,"gamepath":gamepath,"latpath":gameAndLatpath.latpath,"flightMinutes":flightMinutes};

};



