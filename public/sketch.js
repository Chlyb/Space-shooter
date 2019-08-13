const WIDTH = sharedModule.WIDTH;
const HEIGHT = sharedModule.HEIGHT;

var session;
var inSession = false;

var mpBut;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(60);

  mpBut = createButton('Multiplayer');
  mpBut.style('background-color', 'black');
  mpBut.style('color', 'white');
  mpBut.style('font-size', '32px');
  mpBut.position(230, 220);
  mpBut.mousePressed(mpButFun);
}

function draw() {
  if(inSession){
    session.update();
  }
  else{
    background(0);
    textSize(64);
    fill('white');
    text('Space shooter', 100, 100);
  }

  if (keyIsDown(ESCAPE)){
    inSession = false;
    socket = null;
    tpBut.show();
    mpBut.show();
  }
}

function mpButFun() {
  session = new MultiplayerSession();
  inSession = true;
  tpBut.hide();
  mpBut.hide();
}

