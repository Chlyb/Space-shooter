const WIDTH = sharedModule.WIDTH;
const HEIGHT = sharedModule.HEIGHT;

var session;
var inSession = false;

var tpBut;
var mpBut;
var nickInput;

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
  mpBut.style('background-color', 'black');

  nickInput = createInput('Player');
  nickInput.position(280, 120);
  nickInput.style('background-color', 'black');
  nickInput.style('color', 'white');
  nickInput.style('font-size', '18px');
  nickInput.size(115);
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
    textSize(18);
    text('Nick: ', 225, 130);
  }

  if (keyIsDown(ESCAPE)){
    inSession = false;
    socket = null;
    showDOM();
  }
}

function tpButFun() {
  session = new TwoPlayerSession();
  inSession = true;
  hideDOM();
}

function mpButFun() {
  session = new MultiplayerSession();
  inSession = true;
  hideDOM();
}

function showDOM() {
  tpBut.show();
  mpBut.show();
  nickInput.show();
}

function hideDOM() {
  tpBut.hide();
  mpBut.hide();
  nickInput.hide();
}

