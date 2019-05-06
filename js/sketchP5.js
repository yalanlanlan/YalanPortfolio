
var weather;
var api = 'http://api.openweathermap.org/data/2.5/weather?q=';
var city='New York';
var apiKey = '&appid=eedf376d354bb8e856c0eeb272de048b';//plz use your own api key if copy the code -yalan
var units='&units=metric';

var particlesQuantity = 18000;

var positionX = new Array(particlesQuantity);
var positionY = new Array(particlesQuantity);
var velocityX = new Array(particlesQuantity).fill(0);
var velocityY = new Array(particlesQuantity).fill(0);

let frames=60, num=20;
var sz=2;
let theta=2;

function setup() {

    createCanvas(windowWidth, windowHeight);
    var button = select('#submit');
    button.mousePressed(weatherAsk);

    input = select('#city');

	stroke(255,255,150);
	
	for (var particle = 1; particle < particlesQuantity; particle++) {
		positionX[particle] = random(0,width);
        positionY[particle] = random(0,height);
    }

	positionX[0] = 0;
	positionY[0] = 0;
}
function weatherAsk(){
    var url=  api+input.value()+apiKey+units;
    loadJSON(url, gotData);
}
function gotData(data){
    weather=data;
}

function draw() {
	background(255,0,0);

if(weather){
        var temp=weather.main.temp;
        var humidity=weather.main.humidity;
        var wind=weather.wind.speed;
        var city=weather.name;
        var des=weather.weather[0].description;
        var main=weather.weather[0].main;
        push();
        translate(70,height/2);
        fill(0);
        noStroke();
        textSize(28);
        textAlign(LEFT);
        text(city,0,0);
        textSize(16);
        text(des,0,40);
        pop();
    randomSeed(125);
    let r=0;
  noStroke();
  fill(255, 50);
  
  for (var i=0; i<=num; i++) {
    var offSet=TWO_PI/num*i;
    push();
    
    fill(0,20);
    text(temp+" Celsius degree",width/2+100, height/2);
    textSize(9);
    textAlign(CENTER);
    translate(width/2+100, height/2);
    
    strokeWeight(3);
    stroke(0); 
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    pop();
    
    push();
    translate(width/2+100, height/2);
    rotate(r);
    var d =  map(sin(theta-offSet*2), -1, 1, 5, 40);
    d=0;
    for (var j=0; j<150; j++) {
      var tempMap = map(temp,-42,50,20,180);
      var x = random(20, tempMap);
      var distance = dist(0,0,x,0);
      var maxsz = map(distance,0,150,10,0);
      sz = map(sin(theta),-1,1,0,maxsz);
      ellipse(x+d, 0, sz, sz);
    }
    
    r+=TWO_PI/num*.5;
    pop();
  }
  for (var i=0; i<=num; i++) {
    var offSet=TWO_PI/num*i;
    push();
    
    fill(0,20);
    text(humidity+" % humid",width/2-200, height/2);
    textSize(12);
    textAlign(CENTER);
    translate(width/2-200, height/2);
    strokeWeight(3);
    stroke(0); 
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    pop();
    
    push();
    translate(width/2-200, height/2);
    rotate(r);
    var d =  map(sin(theta-offSet*2), -1, 1, 5, 40);
    d=0;
    for (var j=0; j<150; j++) {
      var huMap = map(humidity,0,100,20,180);
      var x = random(20, huMap);
      var distance = dist(0,0,x,0);
      var maxsz = map(distance,0,150,10,0);
      sz = map(sin(theta),-1,1,0,maxsz);
      ellipse(x+d, 0, sz, sz);
    }
    r+=TWO_PI/num;
    pop();
  }
  for (var i=0; i<=num; i++) {
    var offSet=TWO_PI/num*i;
    push();
    
    fill(0,20);
    text(wind+" mph",width/2+400, height/2);
    textSize(12);
    textAlign(CENTER);
    translate(width/2+400, height/2);
    strokeWeight(3);
    stroke(0); 
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    rotate(1/2);
    point(0, 150);
    point(0, -150);
    point(150, 0);
    point(-150, 0);
    pop();
    
    push();
    translate(width/2+400, height/2);
    rotate(r);
    var d =  map(sin(theta-offSet*2), -1, 1, 5, 40);
    d=0;
    for (var j=0; j<150; j++) {
      var windMap = map(wind,0,70,0,200);
      var x = random(20, windMap);
      var distance = dist(0,0,x,0);
      var maxsz = map(distance,0,150,10,0);
      sz = map(sin(theta),-1,1,0,maxsz);
      ellipse(x+d, 0, sz, sz);
    }
    r+=TWO_PI/num;
    pop();
  }
  stroke(255);
  theta += TWO_PI/frames;
    }
    
    else{
	velocityX[0] = velocityX[0] * 0.5 + (mouseX - positionX[0]) * 0.1;
	velocityY[0] = velocityY[0] * 0.5 + (mouseY - positionY[0]) * 0.1;
	
	positionX[0] += velocityX[0];
	positionY[0] += velocityY[0];
	
	for (var particle = 1; particle < particlesQuantity; particle++) {
		var whatever = 1024 / (sq(positionX[0] - positionX[particle]) + sq(positionY[0] - positionY[particle]));
		
		velocityX[particle] = velocityX[particle] * 0.95 + (velocityX[0] - velocityX[particle]) * whatever;
		velocityY[particle] = velocityY[particle] * 0.95 + (velocityY[0] - velocityY[particle]) * whatever;
		
		positionX[particle] += velocityX[particle];
		positionY[particle] += velocityY[particle];
		
		if ((positionX[particle] < 0 && velocityX[particle] < 0) || (positionX[particle] > width && velocityX[particle] > 0)) {
			velocityX[particle] = -velocityX[particle];
		}
		
		if ((positionY[particle] < 0 && velocityY[particle] < 0) || (positionY[particle] > height && velocityY[particle] > 0)) {
			velocityY[particle] = -velocityY[particle];
		}
		
		point(positionX[particle], positionY[particle]);
    }
}
}


function mousePressed() {
	for (var particle = 1; particle < particlesQuantity; particle++) {
		positionX[particle] = random(0, width);
		positionY[particle] = random(0, height);
    }
    
    
}
