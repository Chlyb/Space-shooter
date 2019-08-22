class Star {
  constructor(x, y, size, w, a) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.w = w;
    this.a = a;
  }

  show(t) {
    graphics.stroke(255);
    graphics.strokeWeight(3 * this.size * (1 + cos(t*this.w*5 + this.a*10)/2));
    graphics.point(this.x, this.y);
  }
}