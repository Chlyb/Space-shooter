class TwoPlayerSession extends Session{
    constructor() {
        super();
        this.bullets = [];

        this.leftShip = new Ship( 0, 0, 'left', 'Player 1');
        this.rightShip = new Ship( 0, 0, 'right', 'Player 2');

        //this.leftShip.pos = Ship.findSpawnpoint();
        //this.rightShip.pos = Ship.findSpawnpoint();

        let gameMap = sharedModule.generateMap();

        for (let i = 0; i < gameMap.xs.length; i++) {
          let a = new Asteroid(gameMap.xs[i], gameMap.ys[i], gameMap.s[i]);
          this.asteroids.push(a);
        }
    }

    update() {
        background(0);
        gi++;

        let dt = 1.0/60.0;

        let r = Math.random();
        if(r < 0.01) {
          let data = sharedModule.generateComet();
          let c = new Comet(data.x, data.y, data.vx, data.vy, data.r);
          this.comets.push(c);
        }

        for (let a of this.asteroids) {
            a.show();
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            if (b.update()) {
                b.onHit();
                this.bullets.splice(i, 1);
            } else {
                b.move(dt);
                b.show();
            }
        }

        this.leftShip.input('left');
        this.rightShip.input('right');
        this.leftShip.update();
        this.rightShip.update();
        this.leftShip.move(dt);
        this.rightShip.move(dt);   

        fill(255);
        this.leftShip.show();
        this.rightShip.show();

        for (let i = this.comets.length - 1; i >= 0; i--) {
            let c = this.comets[i];
            if (c.update()) {
                this.comets.splice(i, 1);
            } else {
                c.move(dt);
                c.show();
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.update(dt);
            p.show();
            if (p.life == 0) {
                this.particles.splice(i, 1);
            }
        }

        textSize(16);
        fill(255,255,255,150);
        noStroke();
        text("Player1 " + this.leftShip.kills + " " + this.leftShip.deaths, 10, 20);
        text("Player2 " + this.rightShip.kills + " " + this.rightShip.deaths, 10, 40);
    }

    getComets(){
      return this.comets;
    }

    getBullets(){
      return this.bullets;
    }

    playerDestroyed(p, cause){
      if(cause == "left")
        this.leftShip.kills++;
      else if(cause == "right")
        this.rightShip.kills++;
    }

    addBullet(b){
      this.bullets.push(b);
    }

    removeBullet(b){
      let index = this.bullets.indexOf(b);
      if(index !== -1) {
        this.bullets.splice(index, 1);
      }
    }
}

