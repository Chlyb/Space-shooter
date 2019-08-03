class Bullet {
  constructor(angle, x, y, shooter, id) {
    this.pos = createVector(x,y);
    this.vel = createVector(0,400);
    this.vel.rotate(-angle);

    this.shooter = shooter;
    this.id = id;
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
  }

  show() {
    strokeWeight(5);
    stroke(255,255,0);
    point(this.pos.x, this.pos.y);
  }

  sendOnCreation() {
    var data = {
      a: this.angle,
      x: this.pos.x,
      y: this.pos.y,
      s: this.shooter,
      id: this.id,
      t: currTime
    };
    socket.emit('b',data); //bullet
  }
}