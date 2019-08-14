const WIDTH = sharedModule.WIDTH;
const HEIGHT = sharedModule.HEIGHT;

var session;
var inSession = false;

var tpBut;
var mpBut;

function setup() {
  createCanvas(WIDTH, HEIGHT);
  frameRate(60);

  tpBut = createButton('Two player');
  tpBut.style('background-color', 'black');
  tpBut.style('color', 'white');
  tpBut.style('font-size', '32px');
  tpBut.position(230, 150);
  tpBut.mousePressed(tpButFun);

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

function tpButFun() {
  session = new TwoPlayerSession();
  inSession = true;
  tpBut.hide();
  mpBut.hide();
}

function mpButFun() {
  session = new MultiplayerSession();
  inSession = true;
  tpBut.hide();
  mpBut.hide();
}

