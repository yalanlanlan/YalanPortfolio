var weather;
var api = 'http://api.openweathermap.org/data/2.5/weather?q=';
var city='New York';
var apiKey = '&appid=eedf376d354bb8e856c0eeb272de048b'; //plz use your own api key if copy the code -yalan
var units='&units=metric';

var a = 60; 
var b = 60;
var dir = 2;
var decrA;
var decrB;
function setup() {
    frameRate(10000);
    createCanvas(windowWidth, windowHeight);
    var button = select('#submit');
    button.mousePressed(weatherAsk);
    input = select('#city');
   background(255);
  rectMode(CENTER);
  noFill();
}
function weatherAsk(){
    var url=  api+input.value()+apiKey+units;
    loadJSON(url, gotData);
}
function gotData(data){
    weather=data;
}

var rot=0;
var n = 256;
var minRad = 50;
var maxRad = 400;
var nfAng = 0.01;
var nfTime = 0.005;

function draw() {

  push();
  fill(180,180,180);
  noStroke();
  textAlign(RIGHT);
  text("clear to white = 'd'",width-50, height-100);
  text("clear to black = 'x'",width-50, height-150);
  pop();
  push();
            fill(180,180,180);
            noStroke();
            translate(width/2, height/2);
            rect(0,0,3,3);
            rect(100,0,4,4);
            rect(200,0,5.3,5.3);
            rect(300,0,6.7,6.7);
            rect(400,0,8,8);
  pop();
if(weather){
        var city=weather.name;
        var des=weather.weather[0].description;
        var main=weather.weather[0].main;
        push();
        translate(50,100);
        fill(180,180,180);
        noStroke();
        textSize(20);
        textAlign(LEFT);
        text(city,0,0);
        textSize(16);
        text(des,0,40);
        pop();
          var temp=weather.main.temp;
          var tempMap = map(temp,-42,50,0,300);
          push();
          translate(width/2, height/2);
          beginShape();
          for (var i=0; i<n; i++) {
            stroke(0,255,180,20);
            
            var ang = map(i, 0, n, 0, TWO_PI);
            var rad = map(noise(i*nfAng, frameCount*nfTime), 0, 1, tempMap,tempMap+100);
            var x = rad * cos(ang);
            var y = rad * sin(ang);
            curveVertex(x, y);
          }
          endShape(CLOSE);
          pop();
          var humidity=weather.main.humidity;
          var huMap = map(humidity,0,100,0,300);
          push();
          translate(width/2, height/2);
          beginShape();
          for (var i=0; i<n; i++) {
            stroke(255,212,79,20);
            var ang = map(i, 0, n, 0, TWO_PI);
            var rad = map(noise(i*nfAng*2, frameCount*nfTime), 0, 1, huMap,huMap+100);
            var x = rad * cos(ang);
            var y = rad * sin(ang);
            curveVertex(x, y);
          }
          endShape(CLOSE);
          pop();
          var wind=weather.wind.speed;
          var windMap = map(wind,0,70,0,300);
          push();
          translate(width/2, height/2);
          beginShape();
          for (var i=0; i<n; i++) {
            stroke(0,200,250,20);
            var ang = map(i, 0, n, 0, TWO_PI);
            var rad = map(noise(i*nfAng, frameCount*nfTime*2), 0, 1, windMap, windMap+100);
            var x = rad * cos(ang);
            var y = rad * sin(ang);
            curveVertex(x, y);
          }
          endShape(CLOSE);
          pop();
    push();
    
    fill(0,255,180);
    text("TEMPERATURE",50, height/2-120);
    text(temp+" Celsius degree",50, height/2-100);
    fill(255,212,79);
    text("HUMIDITY",50, height/2-20);
    text(humidity+" % humid",50, height/2);
    fill(0,200,250);
    text("WINDSPEED",50, height/2+80);
    text(wind+" mph",50, height/2+100);
    
    textSize(12);
    textAlign(CENTER);

    pop();
        // var humidity=weather.main.humidity;
        // var wind=weather.wind.speed;
        // noFill();
        // strokeWeight(0.2);
        // translate(width/2, height/2); 
        // scale(rot*0.05);
        
        // push();
        // stroke(255,155,0);
        // translate(sqrt(tempMap), sqrt(tempMap));
        // rotate(-rot);
        // triangle(-300, 0, 300, 0, 0, 639);
        // pop();
      
        // push();
        // stroke(255,255,0);
        // translate(-sqrt(tempMap), -sqrt(tempMap));
        // rotate(-rot);
        // triangle(-300, 0, 300, 0, 0, 639);
        // pop();
      
        // rot = rot+0.01;
  
  
}

// noFill();
//         translate(width/2, height/2); 
//         scale(rot*0.05);
        
//         push();
//         stroke(255,0,0,20);
//         translate(100, 100);
//         rotate(-rot);
//         triangle(-300, 0, 300, 0, 0, 639);
//         pop();
      
//         push();
//         stroke(255,0,0,20);
//         translate(-100, -100);
//         rotate(-rot);
//         triangle(-300, 0, 300, 0, 0, 639);
//         pop();
      
//         rot = rot+0.01;
  
  stroke(255,255,150,20);
  strokeWeight(0.5);
  translate(width/2, height/2);
  beginShape();
  for (var i=0; i<n; i++) {
    var ang = map(i, 0, n, 0, TWO_PI);
    var rad = map(noise(i*nfAng, frameCount*nfTime), 0, 1, minRad, maxRad);
    var x = rad * cos(ang);
    var y = rad * sin(ang);
    curveVertex(x, y);
  }
  endShape(CLOSE);
}
function keyPressed() {
  if (key=='d') {
    background(255);
  }
  if (key=='x') {
    background(0);
  }
}