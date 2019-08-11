class Comet {
  constructor(x, y, vx, vy, r) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.r = r;
    this.lifeTime = 0;

    this.xs = [];
    this.ys = [];

    let xoff;
    let yoff;
    let pr;
    noiseSeed( Math.random()*100000000);
    
    for(let i = 0; i < 30; i++){
      let angle = i / 30 * 2*Math.PI;
      xoff = map(Math.cos(angle),-1,1,0,2);
      yoff = map(Math.sin(angle),-1,1,0,2);
      pr = map(noise(xoff, yoff), 0,1, 0.8*this.r, 1.2*this.r);
      this.xs.push(Math.cos(angle)*pr);
      this.ys.push(Math.sin(angle)*pr);
    }
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
    fill(80);
    stroke(60);
    strokeWeight(3);
    translate(this.x, this.y);
    beginShape();
    for(let i = 0; i < this.xs.length; i++) {
      vertex( this.xs[i], this.ys[i]);
    }
    endShape(CLOSE);
    translate(-this.x, -this.y);
  }
}