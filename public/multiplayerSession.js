var socket;

class MultiplayerSession extends Session {
    constructor() {
        super();
        this.ships = new Map();
        this.bullets = new Map();

        this.myShip;

        setupSocket();
    }

    update() {
        if (typeof this.myShip === "undefined") return;

        currTime = new Date().getTime();
        let dt = (currTime - prevTime) / 1000;
        gi++;

        background(0);

        graphics.fill(0);
        graphics.stroke(255);
        graphics.strokeWeight(5);
        graphics.rect(0,0,WIDTH,HEIGHT);

        let t = currTime/1000;
        
        if(starsBox.checked())
          for (let s of this.stars) 
            s.show(t);
        
        for (let a of this.asteroids) {
            a.show();
        }

        for (let b of this.bullets.values()) {
            if (b.update()) {
                hit.play();

                b.onHit();
                this.bullets.delete(b.shooter + b.id);
            } else {
                b.move(dt);
                b.show();
            }
        }

            let changed = this.myShip.input();
            this.myShip.update();
            this.myShip.move(dt);

            if (gi % 10 == 0 || changed) {
              if(this.myShip.health > 0)
                this.myShip.sendData();
            }

            graphics.fill(255);
            this.myShip.show();
        

        for (let sh of this.ships.values()) {
            sh.move(dt);
            graphics.fill(0, 255, 255, 255);
            sh.show();
        }

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
        image(graphics, (windowWidth - windowHeight*WIDTH/HEIGHT)/2,0, windowHeight*WIDTH/HEIGHT, windowHeight);

        textSize(16);
        fill(255,255,255,255);
        textSize(16);
        stroke(0);
        strokeWeight(6);
        textAlign(LEFT);
    
        text(this.myShip.nick + " " + this.myShip.kills + " " + this.myShip.deaths, 10, 20);

        let i = 0;
        for (let sh of this.ships.values()){
          text(sh.nick + " " + sh.kills + " " + sh.deaths, 10, 40 + 20 * i);
          i++;
        }

        let x = width - 20;
        let y = 20;

        textAlign(RIGHT);

        for (let i = this.logs.length - 1; i >= 0; i--) {
            let l = this.logs[i];
            if (l.update()) {
                this.logs.splice(i, 1);
            }
            else{
              l.show(x,y);
              y += 20;
            }
        }

        this.engineWorking = 0;
        if(this.myShip.vi != 0)
          this.engineWorking++;
        for(let s of this.ships.values()){
          if(s.vi != 0) this.engineWorking++;
        }
        if(this.prevEngineWorking != this.engineWorking){
          thrust.setVolume( Math.log(this.engineWorking+1));
        }
        this.prevEngineWorking = this.engineWorking;

        prevTime = currTime;
    }

    getComets() {
        return this.comets;
    }

    getBullets() {
        return this.bullets.values();
    }

    playerDestroyed(p, cause) {
      this.myShip.sendDestroyed(cause);

      if(cause[0] == "/")
        this.ships.get(cause).kills++;

      let message;
      if(cause[0] == "/") {
        message = this.ships.get(cause).nick + " killed " + this.myShip.nick;
      }
      else if(cause == "wall"){
        message = this.myShip.nick + " smashed into wall";
      }
      else if(cause == "comet"){
        message = this.myShip.nick + " was killed by comet";
      }
      else if(cause == "asteroid"){
        message = this.myShip.nick + " flew into asteroid";
      }
      let l = new EventLog(message); 
      this.logs.push(l);
    }

    addBullet(b) {
        shot.play();

        var data = {
            a: this.myShip.angle,
            x: this.myShip.pos.x,
            y: this.myShip.pos.y,
            s: this.myShip.id,
            id: this.myShip.ammo,
            t: currTime
        };
        socket.emit('b', data); //bullet

        session.bullets.set(this.myShip.id + this.myShip.ammo, b);
    }

    removeBullet(b) { //on player hit
        hit.play();

        this.myShip.sendHit(b);
        session.bullets.delete(b.shooter + b.id);
    }
}

function setupSocket() {
    socket = io.connect(window.location.origin);

    socket.on('n', //nick
        function(data) {
          connected.play();

          let sh = new Ship(0, 0, data.id, data.n);
          sh.usePseudoPos = true;
          session.ships.set(data.id, sh);

          let l = new EventLog(data.n + " has joined"); 
          session.logs.push(l);
        }
    );

    socket.on('p', //position
        function(data) {
            let sh = session.ships.get(data.id);

            let timeDif = (currTime - data.time) / 1000;

            sh.pPos = sh.pos.copy();

            sh.serverUpdate(data);
            sh.move(timeDif);

            sh.pVel = sh.pos.copy();
            sh.pVel.sub(sh.pPos);
            sh.pVel.div(0.1);
            sh.timeToCompensationEnd = 0.1;

            if(sh.health == -1){
              spawn.play();

              sh.health = 3; 
              let p = new Particle(sh.pos.x, sh.pos.y, 0, 0, 125, -5, color(0,0,255,255), -100, 15, color(0,0,255,255), 5, -5/20, 20);
              session.particles.push(p);

              sh.timeToCompensationEnd = 0;
            }   
        }
    );

    socket.on('b', //bullet
        function(data) {
            shot.play();

            let b = new Bullet(data.a, data.x, data.y, data.s, data.id);
            session.bullets.set(data.s + data.id, b);

            let timeDif = (currTime - data.t) / 1000;

            session.myShip.move(-timeDif);
            let hit = false;

            while (timeDif > 0 && !hit) {
                timeDif -= 0.01666;
                let dt = 0.01666;
                if (timeDif < 0) dt = timeDif + 0.01666;

                b.move(dt);
                session.myShip.move(dt);
                session.myShip.update();

                if (b.update()) {
                    hit = true;
                }
            }
            b.usePseudoPos = true;
            b.pPos = session.ships.get(data.s).pos.copy();
            b.pVel = b.pos.copy();
            b.pVel.sub(b.pPos);
            b.pVel.div(0.1);
            b.timeToCompensationEnd = 0.1;
        }
    );

    socket.on('h', //hit
        function(data) {
            hit.play();
            
            let sh = session.ships.get(data.h);
            sh.hit();
            session.bullets.delete(data.s + data.id);
        }
    );

    socket.on('d', //destroyed
        function(data) {
            let sh = session.ships.get(data.id);
            if (typeof sh !== 'undefined') {
                sh.pos.x = data.x;
                sh.pos.y = data.y;
                sh.destroyed(false);
                sh.health = -1;

                if(data.c == session.myShip.id){
                  session.myShip.kills++;
                }
                else if(data.c[0] == "/") {
                  session.ships.get(data.c).kills++;
                }
            }

            print(data.c + " " + data.id);

            let message;
            if(data.c[0] == "/") {
              if(data.c == session.myShip.id)
                message = session.myShip.nick + " killed " + session.ships.get(data.id).nick;
              else 
                message = session.ships.get(data.c).nick + " killed " + session.ships.get(data.id).nick;
            }
            else if(data.c == "wall"){
              message = session.ships.get(data.id).nick + " smashed into wall";
            }
            else if(data.c == "comet"){
              message = session.ships.get(data.id).nick + " was killed by comet";
            }
            else if(data.c == "asteroid"){
              message = session.ships.get(data.id).nick + " flew into asteroid";
            }
            let l = new EventLog(message); 
            session.logs.push(l);
        }
    );

    socket.on('c', //comet
        function(data) {
            let timeDif = (currTime - data.t) / 1000;
            let c = new Comet(data.x, data.y, data.vx, data.vy, data.r);
            c.move(timeDif);
            session.comets.push(c);
        }
    );

    socket.on('dis', //disconnected
        function(data) {
            disconnected.play();

            let l = new EventLog(session.ships.get(data).nick + " disconnected"); 
            session.logs.push(l);
            session.ships.delete(data);
        }
    );

    //called once we connect
    socket.on('connected',
        function(data) {
            session.myShip = new Ship(data.x, data.y, data.id, nickInput.value());

            for (let i = 0; i < data.xs.length; i++) {
                let a = new Asteroid(data.xs[i], data.ys[i], data.s[i]);
                session.asteroids.push(a);
            }
            
            for (let c of data.clients){
              let sh = new Ship(0,0,c.id,c.nick);
              sh.kills = c.kills;
              sh.deaths = c.deaths;
              session.ships.set(c.id, sh);
            }

            socket.emit('n', {id: data.id, n: nickInput.value()}); //nick

            noiseSeed(data.starSeed);         
            session.generateStarfield();
        }
    );
}