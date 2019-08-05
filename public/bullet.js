class Bullet {
  constructor(angle, x, y, shooter, id) {
    this.pos = createVector(x,y);
    this.vel = createVector(0,400);
    this.vel.rotate(-angle);

    this.shooter = shooter;
    this.id = id;

    this.usePseudoPos = false;
    this.pPos = this.pos.copy();
    this.pVel = this.vel.copy();
    this.timeToCompensationEnd = 0;
  }

  update() {
    if(this.pos.x > WIDTH) return true;
    if(this.pos.x < 0) return true;
    if(this.pos.y > HEIGHT) return true;
    if(this.pos.y < 0) return true;
    return false;
  }

  move(dt) {
    let ds = this.vel.copy();
    ds.mult(dt);
    this.pos.add(ds);

    if(this.usePseudoPos && this.timeToCompensationEnd > 0) {
      if(this.timeToCompensationEnd <= dt){
        this.timeToCompensationEnd = 0;
      }
      else{
        let dps = this.pVel.copy();
        dps.mult(dt);
        this.pPos.add(ds);
        this.pPos.add(dps);
        this.timeToCompensationEnd -= dt;
      }
    }
  }

  show() {
    if(this.usePseudoPos && this.timeToCompensationEnd > 0) {
      strokeWeight(5);
      stroke(255,255,0);
      point(this.pPos.x, this.pPos.y);
    }
    else {
      strokeWeight(5);
      stroke(255,255,0);
      point(this.pos.x, this.pos.y);
    } 
  }


}