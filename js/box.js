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
        stroke(0);
        strokeWeight(1);
        rotate(angle);
        rectMode(CENTER);
        rect(0,0,this.w,this.h);
        pop();

    }

}