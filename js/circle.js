function theCircle(x,y,r){
    var options ={
        friction: 0,
        restitution: 0.2
    }
    this.body = Bodies.circle(x,y,r,options);
    this.r=r;
    World.add(world, this.body);


    this.removeFromWorld = function(){
        World.remove(world, this.body);
    }
    this.isOffScreen=function(){
        var pos=this.body.position;
        return(pos.x > width+100 || pos.x < -100);
    }

    let colors = "EEEEEE-FFFFFF".split("-").map(a=>"#"+a)

    this.show = function(){
        var pos=this.body.position;
        var angle= this.body.angle;

        push()
        translate(pos.x, pos.y);
        rotate(angle);
        //noFill(0);
        fill(0);
        stroke(0);
        strokeWeight(1);
        ellipse(0,0,this.r*2);

        // translate(this.r*0.3,this.r*0.3);
        // fill(30);
        // ellipse(0,0,this.r*0.6)
        // translate(this.r*0.1,this.r*0.1);
        // fill(100);
        // ellipse(0,0,this.r*0.4)
        // translate(this.r*0.05,this.r*0.05);
        // fill(255);
        // ellipse(0,0,this.r*0.2)
        pop();

    }

}