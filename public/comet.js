class Comet {
  constructor(x, y, vx, vy, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.lifeTime = 0;
  }

  update() {
    if(this.lifeTime > 1) {
      if(this.x > WIDTH + this.r) return true;
      if(this.x < -this.r) return true;
      if(this.y > HEIGHT + this.r) return true;
      if(this.y < -this.r) return true;
    }
    return false;
  }

  move(dt) {
    this.x += this.vx*dt;
    this.y += this.vy*dt;
    this.lifeTime += dt;
  }

  show() {
    strokeWeight(2*this.r);
    stroke(100,100,100);
    point(this.x, this.y);
  }
}