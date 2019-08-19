class EventLog {
  constructor(message) {
    this.message = message;
    this.life = 0;
  }

  update(){
    this.life++;
    if(this.life == 600) return true;
    return false;
  }

  show(x, y){
    textSize(16);
    noStroke();
    if(this.life < 540)
      fill(255,255,255,255);
    else
      fill(255,255,255, 2415 - 4*this.life);
    text(this.message, x, y);
  }
}