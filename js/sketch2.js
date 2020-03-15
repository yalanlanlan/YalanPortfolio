// a shader variable
let theShader;

function preload(){
  // load the shader
  theShader = loadShader('shader.vert', 'shader.frag');
}
function setup() {
  
  
	var canvas = createCanvas(windowWidth, 900, WEBGL);
 
  // Move the canvas so it’s inside our <div id="sketch-holder">.
  canvas.parent('sketch-holder');
  noStroke();
}

function windowResized() {
  resizeCanvas(windowWidth, 900);
}


function draw() {  
  // shader() sets the active shader with our shader
  shader(theShader);
  
  theShader.setUniform("u_resolution", [width, height]);
  theShader.setUniform("u_time", millis() / 1000.0);
  theShader.setUniform("u_mouse", [mouseX, map(mouseY, 0, height, height, 0)]);

  // rect gives us some geometry on the screen
  rect(0,0,width, height);
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}