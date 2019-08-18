class Ship {
  constructor(x,y, id, nick) {
    this.angle = 0;
    this.pos = createVector(x,y);
    this.vel = createVector();

    this.cooldown = 0;
    this.ammo = 10;
    this.health = -1;

    this.hi = 0;
    this.vi = 0;

    this.id = id;
    this.nick = nick;
    this.kills = 0;
    this.deaths = 0;

    this.usePseudoPos = false;
    this.pAngle = this.angle;
    this.pPos = this.pos.copy();
    this.timeToCompensationEnd = 0;
  }

  input(method) {
    let verticalInput = 0;
    let horizontalInput = 0;

    if(method == 'left'){
      if (keyIsDown(65)) {
      horizontalInput++;
      } 
      if (keyIsDown(68)) {
        horizontalInput--;
      }
      if (keyIsDown(87)) {
        verticalInput++;
      }
      if (keyIsDown(83)) {
        verticalInput--;
      }
      if (keyIsDown(SHIFT)) {
        if(this.cooldown == 0) this.shot();
      }
    }
    else if(method == 'right'){
      if (keyIsDown(LEFT_ARROW)) {
        horizontalInput++;
      } 
      if (keyIsDown(RIGHT_ARROW)) {
        horizontalInput--;
      }
      if (keyIsDown(UP_ARROW)) {
        verticalInput++;
      }
      if (keyIsDown(DOWN_ARROW)) {
        verticalInput--;
      }
      if (keyIsDown(32)) {
        if(this.cooldown == 0) this.shot();
      }
    }
    else {
      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        horizontalInput++;
      } 
      if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        horizontalInput--;
      }
      if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        verticalInput++;
      }
      if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        verticalInput--;
      }
      if (keyIsDown(32) || keyIsDown(SHIFT)) {
        if(this.cooldown == 0) this.shot();
      }
    }

    let changed = false;
    if(this.hi != horizontalInput || this.vi != verticalInput) changed = true;
    
    this.hi = horizontalInput;
    this.vi = verticalInput;

    return changed;
  }

  shot(multiplayer) {
    let b = new Bullet(this.angle, this.pos.x, this.pos.y, this.id, this.ammo);
    /*
    if(multiplayer) {
      var data = {
        a: this.angle,
        x: this.pos.x,
        y: this.pos.y,
        s: this.id,
        id: this.ammo,
        t: currTime
      };
      socket.emit('b',data); //bullet
    }*/

    session.addBullet(b);

    if(this.ammo == 0){
      this.ammo = 15;
      this.cooldown = 200;
    }
    else {
      this.ammo--;
      this.cooldown = 3;
    }
  }

  move(dt) {
    if(this.health <= 0) return;

    let acc = createVector(0, 200*dt);
    acc.mult(this.vi).rotate(-this.angle);
    this.vel.add(acc);
    this.angle += 5 * dt * this.hi;  

    let ds = this.vel.copy();
    ds.mult(dt);
    this.pos.add(ds);

    if(this.usePseudoPos) {
      this.pAngle += (this.angle - this.pAngle)/4;

      if(this.timeToCompensationEnd > 0) {
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
 
    if(this.vi != 0 && gi%3 == 1) {
      let v = createVector(0,-200*this.vi);
      v.rotate(-this.angle);
      v.add(this.vel);
      v.add(p5.Vector.random2D().mult(50));
      
      let p = new Particle(this.pos.x, this.pos.y, v.x, v.y, 0, 0, color(0,0,0,255), 255, -20, color(255,255,255,255), 2, 0, 5);
      session.particles.push(p);
    }
  }

  update() {
    if(this.cooldown > 0) this.cooldown--;
    if(this.cooldown == 0 && this.health == -1) { //respawn
      this.health = 3;
      this.pos = Ship.findSpawnpoint();
      let p = new Particle(this.pos.x, this.pos.y, 0, 0, 125, -5, color(0,0,255,255), -100, 15, color(0,0,255,255), 5, -5/20, 20);
      session.particles.push(p);
    }
    if(this.health <= 0) return;

    let destroyed = false;
    let deathCause;

    if(this.pos.x < 0){
      destroyed = true;
      deathCause = "wall";
    } 
    if(this.pos.x > WIDTH) {
      destroyed = true;
      deathCause = "wall";
    }  
    if(this.pos.y < 0) {
      destroyed = true;
      deathCause = "wall";
    }
    if(this.pos.y > HEIGHT) {
      destroyed = true;
      deathCause = "wall";
    }

    for(let a of session.asteroids) {
      noiseSeed( a.seed);

      let v = this.pos.copy();
      v.sub(a.x, a.y);

      let d = v.mag();

      v.normalize();

      let xoff = map(v.x,-1,1,0,1.5);
      let yoff = map(v.y,-1,1,0,1.5);
      let r = map(noise(xoff, yoff), 0,1,20,100);

      if(d <= r){
        destroyed = true;
        deathCause = "asteroid";
      }
    }

    for(let b of session.getBullets()) {
      if(b.shooter != this.id) {  
        let d = this.pos.copy();
        d.sub(b.pos);
        if(d.magSq() < 150){
          this.hit();
          if(this.health == 0) {
            destroyed = true;
            deathCause = b.shooter;
          }
          session.removeBullet(b);
        }
      }
    }

    for(let c of session.getComets()) {
      let d = (this.pos.x - c.x)*(this.pos.x - c.x);
      d += (this.pos.y - c.y)*(this.pos.y - c.y);
      if(d < 100 + c.r*c.r){
        destroyed = true;
        deathCause = "comet";
      }
    }

    if(destroyed) {
      session.playerDestroyed(this, deathCause);
      this.destroyed(true);
    }
  }

  show() {
    if(this.health < 0) return;

    noStroke();

    if(this.usePseudoPos){
      var sin = Math.sin(this.pAngle);
      var cos = Math.cos(this.pAngle);
    }
    else {
      var sin = Math.sin(this.angle);
      var cos = Math.cos(this.angle);
    }

    if(this.usePseudoPos && this.timeToCompensationEnd > 0) {
      triangle(this.pPos.x + 10 * sin, this.pPos.y + 10 * cos, this.pPos.x - 4 * cos, this.pPos.y + 4 * sin, this.pPos.x + 4 * cos, this.pPos.y - 4 * sin);
    }
    else {
      triangle(this.pos.x + 10 * sin, this.pos.y + 10 * cos, this.pos.x - 4 * cos, this.pos.y + 4 * sin, this.pos.x + 4 * cos, this.pos.y - 4 * sin);
    }
  }

  serverUpdate(data) {
    this.angle = data.a;
    this.pos.x = data.x;
    this.pos.y = data.y;
    this.vel.x = data.vx;
    this.vel.y = data.vy;
    this.hi = data.hi;
    this.vi = data.vi;
  }

  sendData() {
    var data = {
      a: this.angle,
      x: this.pos.x,
      y: this.pos.y,
      vx: this.vel.x,
      vy: this.vel.y,
      id: this.id,
      time: currTime,
      vi: this.vi,
      hi: this.hi
    };
    socket.emit('p',data);
  }

  sendHit(b) {
    var data = {
      h: this.id,
      s: b.shooter,
      id: b.id
    };
    socket.emit('h',data); //hit
  }

  sendDestroyed(cause) {
    var data = {
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      c: cause
    };
    socket.emit('d',data); //destoyed
  }

  destroyed(original) {
    this.health = -1; //flag for being dead
    this.deaths++;

    let p = new Particle(this.pos.x, this.pos.y, 0, 0, 5, 5, color(255,255,0,255), 255, -20, color(255,255,0,255), 5, -5/20, 20);
    session.particles.push(p);

    for(let i = 0; i < 30; ++i) {
      let v= p5.Vector.random2D();
      v.mult(Math.random()*300);
      v.add(this.vel);

      let p = new Particle(this.pos.x, this.pos.y, v.x, v.y, 0, 0, color(0,0,0,255), 255, 0, color(255,255,255,255), 5, -5/40, 40);
      session.particles.push(p);
    }

    if(original) {
      this.vel.x = 0;
      this.vel.y = 0;

      this.cooldown = 180;
      this.ammo = 10; 
    }
  }

  hit(){
    let p = new Particle(this.pos.x, this.pos.y, 0, 0, 0, 2, color(255,255,0,255), 255, -20, color(255,255,0,255), 2.5, -2.5/10, 10);
    session.particles.push(p);
    this.health--;
  }

  static findSpawnpoint(){
    let found = false;
    var x;
    var y;
    var newPos;

    while(!found){
      x = Math.random()*WIDTH;
      y = Math.random()*HEIGHT;
      newPos = createVector(x, y);

      found = true;

      for(let a of session.asteroids) {
        noiseSeed( a.seed);

        let v = newPos.copy();
        v.sub(a.x, a.y);

        let d = v.mag();

        v.normalize();

        let xoff = map(v.x,-1,1,0,1.5);
        let yoff = map(v.y,-1,1,0,1.5);
        let r = map(noise(xoff, yoff), 0,1,20,100);

        if(d <= r + 50){
          found = false;
          break;
        }
      }
      
      if(found)
      for(let b of session.getBullets()) {
          let d = newPos.copy();
          d.sub(b.pos);
          if(d.magSq() < 10000){
            found = false;
            break;
          }
      }

      if(found)
      for(let c of session.getComets()) {
        let d = (newPos.x - c.x)*(newPos.x - c.x);
        d += (newPos.y - c.y)*(newPos.y - c.y);
        if(d < 10000 + c.r*c.r){
          found = false;
          break;
        }
      }
    }
    return newPos;
  }
}