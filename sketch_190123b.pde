void setup() {
  fullScreen();
  rectMode(CENTER);
  frameRate(120);
}

void draw() {
  background(20);
  noStroke();
  fill(mouseY/2, 0, 0);
  rect(mouseX, mouseY, 100, 100);
  rect(mouseX/2, mouseY/2, 100, 100);
  println(mouseY);
  rect(random(width), random(height),50,50);
  stroke(255);
  strokeWeight(.2);
  line(random(width+20)-80,random(height+20)-80,random(width+100)-80,random(height+100)-80);
  noFill();
  stroke(255);
  arc(100,100,100,100,random(TAU), random(TAU),PIE);
}
