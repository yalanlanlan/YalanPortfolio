function setup() {
  
  
	var canvas = createCanvas(windowWidth, 900);
 
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');
	rectMode(CENTER);
}

function windowResized() {
  resizeCanvas(windowWidth, 900);
}

function draw() {
  background(255);
  strokeWeight(1);
  
	fill(255, 164, 133, mouseY/2);
  ellipse(mouseX, mouseY, mouseX/3, mouseX/3);
	fill(0);
  rect(mouseX-mouseX/30, mouseY-mouseX/80, mouseX/80, mouseX/80);
  rect(mouseX+mouseX/30, mouseY-mouseX/80, mouseX/80, mouseX/80);
	noFill();
	stroke(0);
	strokeWeight(2);
	arc(mouseX, mouseY-mouseX/80, mouseX/5, mouseX/5,QUARTER_PI,HALF_PI+QUARTER_PI);
	
	fill(0, 0, 0, mouseY/2);
	strokeWeight(1);
  ellipse(mouseX,mouseY/1.3,mouseX/5,mouseX/5);
  print(mouseY);
	
  stroke(mouseY, 0, 0);
	
	noFill();
  rect(random(width), random(height),50,50);
  stroke(0);
  strokeWeight(.5);
  line(random(width+20)-80,random(height+20)-80,random(width+100)-80,random(height+100)-80);
  noFill();
  stroke(0);
  arc(160,120,100,100,random(TAU), random(TAU),PIE);
}// JavaScript Document