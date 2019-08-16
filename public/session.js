var currTime;
var prevTime = new Date().getTime();
var gi = 0;

class Session {
  constructor() {
    this.particles = [];
    this.comets = [];
    this.asteroids = [];
  }
    //Methods to override
    update() {
    }

    getComets(){
    }

    getBullets(){
    }

    playerDestroyed(p, cause){
    }

    addBullet(b){
    }

    removeBullet(b){
    }
}
