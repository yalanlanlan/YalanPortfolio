

function theBoxes(x,y,w,h){
    var options ={
        friction: 0,
        restitution: 0.2
    }
    this.body = Bodies.rectangle(x,y,w,h, options);
    this.w=w;
    this.h=h;
    World.add(world, this.body);
    this.show = function(){
        var pos=this.body.position;
        var angle= this.body.angle;
 
        
        push()
        translate(pos.x, pos.y);
        noFill();
        fill(255, 0, 0, 0);
        stroke('#00000077');
        strokeWeight(1);
        rotate(angle);
        rectMode(CENTER);
        rect(0,0,this.w,this.h);
        
        //stroke('#FFA485');
        
        //bezier(-this.w/9, this.h/5, 0, this.h/4, 0, this.h/4, this.w/9, this.h/5);
        ellipse(this.w/6, 0,this.w/6, this.w/10);
        ellipse(-this.w/6, 0,this.w/6, this.w/10);
        //fill('#FFA48533');
        ellipse(this.w/6, 0, this.w/12);
        ellipse(-this.w/6, 0, this.w/12);
        
  fill('#00000033');
  ellipse(w/6, -h/8,w/10, w/15);
  ellipse(-w/6, -h/8,w/10, w/15);
  
        pop();

    }

}