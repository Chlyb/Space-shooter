var currTime;
var prevTime = new Date().getTime();
var gi = 0;

var prevEngineWorking;
var engineWorking;

class Session {
  constructor() {
    this.particles = [];
    this.comets = [];
    this.asteroids = [];

    this.stars = [];

    this.logs = [];

    prevEngineWorking = 0;
    engineWorking = 0;
    thrust.loop();
    thrust.setVolume(0);
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

  generateStarfield(){
      var f = 140;

      let noiseValues = [];
      for(let x = 0; x < WIDTH + 1; x++){
        noiseValues[x] = [];
        for(let y = 0; y < HEIGHT + 1; y++){
            noiseValues[x][y] = noise(x/f, y/f);
        }
      }

      for(let x = 1; x < WIDTH; x++){
        for(let y = 1; y < HEIGHT; y++){
          let place = true;
          let val = noiseValues[x][y];

          if(noiseValues[x-1][y-1] > val) place = false;
          if(noiseValues[x-1][y] > val) place = false;
          if(noiseValues[x-1][y+1] > val) place = false;
          if(noiseValues[x][y-1] > val) place = false;
          if(noiseValues[x][y+1] > val) place = false;
          if(noiseValues[x+1][y-1] > val) place = false;
          if(noiseValues[x+1][y] > val) place = false;
          if(noiseValues[x+1][y+1] > val) place = false;

          if(place){
            let s = new Star(x,y,noise(x*y), noise(x*x + y*y), noise( (x+5)*(y-5)));
            this.stars.push(s);
          }
        }
      }
  }
}
