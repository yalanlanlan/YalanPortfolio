let palette = ["#FFCAAC","#FFA588","#FDBF69","#B7D8D7","#B7D8D7","#FFD799", "#F5F6F1"];
let minS = 20;

function setup() {
	var canvas = createCanvas(windowWidth, 700);
  // Move the canvas so it’s inside <div id="sketch-holder">.
  canvas.parent('sketch-holder');
    rectMode(CENTER);
    frameRate(1);
    noLoop();
}

function windowResized() {
  resizeCanvas(windowWidth, 700);
}
//#E5725C
function draw(){
  background("#FFEFD0");
  stroke("#ffffff");
  strokeWeight(5);
  rectRec(0, 0, width+500, height);
}

function rectRec(x, y, w) {
  let c = int(random(2, 4));
  let sw = w/c;
  let rnd = random(1);
  let p = map(w, minS, width, 0, 1);
  let corner = 5;

  if(rnd < p){
    for(let i=0; i<c; i++){
      for(let j=0; j<c; j++){
          if(sw > minS){
            rectRec(x+i*sw, y+j*sw, sw);
          }
          else{
            fill(random(palette));
            rect(x+i*sw, y+j*sw, sw, sw, corner);
          }
        }
      }
    }else{
      let off = 20;
      let ww = w-off;
      fill(random(palette));
      rect(x, y, w, w, corner);
      if(ww > minS){
        rectRec(x+off/2, y+off/2, ww, ww);
      }
    }
  }