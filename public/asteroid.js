class Asteroid {
  constructor(x, y, seed) {
    this.x = x;
    this.y = y;
    this.seed = seed;

    this.xs = [];
    this.ys = [];

    let xoff;
    let yoff;
    let r;
    noiseSeed( seed);
    
    for(let i = 0; i < 100; i++){
      let angle = i / 100 * 2*Math.PI;

      xoff = map(Math.cos(angle),-1,1,0,1.5);
      yoff = map(Math.sin(angle),-1,1,0,1.5);
      r = map(noise(xoff, yoff), 0,1,20,100);
      this.xs.push(x + Math.cos(angle)*r);
      this.ys.push(y + Math.sin(angle)*r);
    }
  }

  show() {
    graphics.fill(50);
    graphics.stroke(30);
    graphics.strokeWeight(3);
    graphics.beginShape();
    for(let i = 0; i < this.xs.length; i++) {
      graphics.vertex( this.xs[i], this.ys[i]);
    }
    graphics.endShape(CLOSE);
  }
}
