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
        currTime = new Date().getTime();
        let dt = (currTime - prevTime) / 1000;

        background(0);
        gi++;

        for (let a of this.asteroids) {
            a.show();
        }

        for (let b of this.bullets.values()) {
            if (b.update()) {
                b.onHit();
                this.bullets.delete(b.shooter + b.id);
            } else {
                b.move(dt);
                b.show();
            }
        }

        if (typeof this.myShip !== "undefined") {
            let changed = this.myShip.input();
            this.myShip.update();
            this.myShip.move(dt);

            if (gi % 10 == 0 || changed) {
                this.myShip.sendData();
            }

            fill(255);
            this.myShip.show();
        }

        for (let sh of this.ships.values()) {
            sh.move(dt);
            fill(0, 255, 255, 255);
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

        prevTime = currTime;
    }

    getComets() {
        return this.comets;
    }

    getBullets() {
        return this.bullets.values();
    }

    playerDestroyed(p) {
        this.myShip.sendDestroyed();
    }

    addBullet(b) {
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
        this.myShip.sendHit(b);
        session.bullets.delete(b.shooter + b.id);
    }
}

function setupSocket() {
    socket = io.connect(window.location.origin);

    socket.on('p', //position
        function(data) {
            let sh = session.ships.get(data.id);
            if (typeof sh === 'undefined') {
                sh = new Ship(data.x, data.y, data.id);
                sh.usePseudoPos = true;
                session.ships.set(data.id, sh);

                print("nowy");
                print(data.id);
                print(session.ships.get(data.id));
            }

            let timeDif = (currTime - data.time) / 1000;

            sh.pPos = sh.pos.copy();

            sh.serverUpdate(data);
            sh.move(timeDif);

            sh.pVel = sh.pos.copy();
            sh.pVel.sub(sh.pPos);
            sh.pVel.div(0.1);
            sh.timeToCompensationEnd = 0.1;
        }
    );

    socket.on('b', //bullet
        function(data) {
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
            }
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

    //called once we connect
    socket.on('connected',
        function(data) {
            session.myShip = new Ship(data.x, data.y, data.id);

            for (let i = 0; i < data.xs.length; i++) {
                let a = new Asteroid(data.xs[i], data.ys[i], data.s[i]);
                session.asteroids.push(a);
            }
        }
    );
}