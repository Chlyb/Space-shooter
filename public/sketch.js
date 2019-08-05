var socket;

var WIDTH = 600;
var HEIGHT = 400;
var gi = 0;

var date = new Date();

var verticalInput = 0;
var horizontalInput = 0;

var ships = new Map();
var bullets = new Map();

var myShip;
var myId;

var currTime;
var prevTime = new Date().getTime();
var dt;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  background(0);
  frameRate(60);

  // Start a socket connection to the server
  socket = io.connect(window.location.origin);

  socket.on('p', //position
    function(data) {
      let sh = ships.get(data.id);
      if(typeof sh === 'undefined'){
        sh = new Ship(data.x,data.y);
        sh.usePseudoPos = true;
        ships.set(data.id, sh);
      }
      
      let timeDif = (currTime-data.time)/1000;

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
      let timeDif = (currTime-data.t)/1000;
      b.move(timeDif);

      b.usePseudoPos = true;   
      b.pPos = ships.get(data.s).pos.copy();
      b.pVel = b.pos.copy();
      b.pVel.sub(b.pPos);
      b.pVel.div(0.1);
      b.timeToCompensationEnd = 0.1;

      bullets.set(data.s + data.id, b);
    }
  );

  socket.on('h', //hit
    function(data) {
      bullets.delete(data.s + data.id);    
    }
  );

  //called once we connect
  socket.on('connected',
    function(data) {
      myId = data.id;
      myShip = new Ship(data.x,data.y);
    }
  );
}

function draw() {
  currTime = new Date().getTime();
  dt = (currTime - prevTime)/1000;

  background(0);
  verticalInput = 0;
  horizontalInput = 0;

  for(let b of bullets.values()) {
    if(b.update()){
      bullets.delete(b.shooter + b.id);
    }
    else {
      b.move(dt);
      b.show();
    }
  }

  if(typeof myShip !== "undefined") {
    let changed = myShip.input();
    myShip.physics();
    myShip.move(dt);
    
    gi++;
    if(gi%10 == 0 || changed) {
     myShip.sendData();
    }
    
    fill(255);
    myShip.show();
  }

  for(sh of ships.values()) {
    sh.move(dt);
    fill(0,255,255,255);
    sh.show();
  }

  prevTime = currTime;
}

