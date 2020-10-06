var Engine = Matter.Engine,
    //Render = Matter.Render,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Constraint=Matter.Constraint,
    Mouse = Matter.Mouse,
    MouseConstraint=Matter.MouseConstraint;
var engine;
var world;

var ground;
var theCircle;
var boxes=[];
var circles=[];
var boundaries=[];

var mConstraint;

let textintro;
//let graphic;
let motion;
let about;
let interactive;
function preload(){
    textintro= loadImage('img/textintro.gif');
    motion= loadImage('img/motion.gif');
    interactive= loadImage('img/installation_cover-01.png');
    about= loadImage('img/drifting_cover.png');
}
function setup(){
    var canvas = createCanvas(windowWidth, windowHeight);

    engine = Engine.create();
    world = engine.world;
    
    var canvasmouse = Mouse.create(canvas.elt);
    canvasmouse.pixelRatio = pixelDensity();
    var options={
        mouse:canvasmouse
    }
    mConstraint = MouseConstraint.create(engine,options);
    World.add(world, mConstraint);
    
    //Engine.run(engine);

    // var c1 = new theCircle(100 ,0,50,50);
    // circles.push(c1);
    // var c2 = new theCircle(100 ,0,50,50);
    // circles.push(c2);
    // var options={
    //     bodyA: c1.body,
    //     bodyB: c2.body,
    //     length: 100,
    //     stiffness: 0.5
    // }
    // var constraint = Constraint.create(options);
    // World.add(world, constraint); 
    
    boundaries.push(new Boundary (windowWidth/2,windowHeight-windowHeight*0.07,windowWidth,10,0));
    boundaries.push(new Boundary (0,windowHeight/2,windowHeight,10,PI/2));
    boundaries.push(new Boundary (windowWidth,windowHeight/2,windowHeight,10,PI/2));
    boundaries.push(new Boundary (windowWidth/2,0,windowWidth,10,0));
    //ground=new Boundary (width/2,height,width,10);
    //World.add(world, ground);

  
}

function mouseClicked(){
    var boxEdge= random(50,80);
    boxes.push(new theBoxes(mouseX,mouseY,boxEdge,boxEdge));
    
    //circles.push(new theCircle(mouseX,mouseY,30,30));
}

// function mouseDragged(){
//     //boxes.push(new theBoxes(mouseX,mouseY,50,50));
//     circles.push(new theCircle(mouseX,mouseY,50,50));
// }

function draw(){
    background(255);

    imageMode(CENTER);
    image(textintro, width/2, height/2, 640, 360);

    let imagepx=width/2*(1+mouseX/width*0.4)-width*0.2;
    let imagepy=height/2*(1+mouseY/height*0.4)-height*0.2;
    let imagew=height*320/180*0.3;
    let imageh=height*0.3;
    var isToogled = $('.reveal-modal').is(":visible");
    push();
    if(isToogled==true){
    var isHovered = $('.reveal-modal').find('#aboutlink').is(":hover");
        if(isHovered==true){
        image(about, imagepx, imagepy, imagew,imageh);
        }
    }
    pop();
    push();
    if(isToogled==true){
    var isHovered = $('.reveal-modal').find('#interactivelink').is(":hover");
        if(isHovered==true){
        image(interactive, imagepx, imagepy, imagew,imageh);
        }
    }
    pop();
    push();
    if(isToogled==true){
    var isHovered = $('.reveal-modal').find('#motionlink').is(":hover");
        if(isHovered==true){
        image(motion, imagepx, imagepy, imagew,imageh);
        }
    }
    pop();
    
    if(circles.length<20 && width>420){
    circles.push(new theCircle(width/2,10,random(10,70)));
    }
    else if(circles.length<20 && width<=420){
        circles.push(new theCircle(10,10,random(30,40)));
    }

    Engine.update(engine);
    
    for (var i=0; i < boxes.length; i++){
        boxes[i].show();
    }
    for (var i=0; i < circles.length; i++){
        circles[i].show();
        if(circles[i].isOffScreen()){
            circles[i].removeFromWorld();
            circles.splice(i, 1);
            i--; //going Backwards 
        }
    }
    for (var i=0; i < boundaries.length; i++){
        boundaries[i].show();
    }
    // console.log(circles.length, world.bodies.length);
    if (mConstraint) {
        cursor('grab');}else{cursor('')}

}