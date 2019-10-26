const WIDTH = sharedModule.WIDTH;
const HEIGHT = sharedModule.HEIGHT;

var session;
var inSession = false;
var inSettings = false;

var tpBut;
var mpBut;
var nickInput;

var shot;
var hit;
var explosion;
var thrust;
var spawn;
var empty;
var reloaded;

var connected;
var disconnected;

var graphics; 

function preload(){
  shot = loadSound('assets/shot.wav');
  hit = loadSound('assets/hit.wav');//
  explosion = loadSound('assets/explosion.wav');
  thrust = loadSound('assets/thrust.wav');
  spawn = loadSound('assets/spawn.wav');
  empty = loadSound('assets/empty.wav');
  reloaded = loadSound('assets/reloaded.wav');

  connected = loadSound('assets/joined.wav');
  disconnected = loadSound('assets/left.wav');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  masterVolume(0.1);

  graphics = createGraphics(WIDTH, HEIGHT);

  tpBut = createButton('Two player');
  tpBut.style('background-color', 'black');
  tpBut.style('color', 'white');
  tpBut.style('font-size', '48px');
  tpBut.position(width/2 - 125, 250);
  tpBut.mousePressed(tpButFun);

  mpBut = createButton('Multiplayer');
  mpBut.style('background-color', 'black');
  mpBut.style('color', 'white');
  mpBut.style('font-size', '48px');
  mpBut.position(width/2 - 125, 350);
  mpBut.mousePressed(mpButFun);
  mpBut.style('background-color', 'black');

  settingsBut = createButton('  Settings  ');
  settingsBut.style('width', '250px');
  settingsBut.style('background-color', 'black');
  settingsBut.style('color', 'white');
  settingsBut.style('font-size', '48px');
  settingsBut.position(width/2 - 125, 450);
  settingsBut.mousePressed(settingsButFun);
  settingsBut.style('background-color', 'black');

  nickInput = createInput('Player');
  nickInput.position(width/2 - 50, 175);
  nickInput.attribute('maxLength','10');
  nickInput.style('background-color', 'black');
  nickInput.style('color', 'white');
  nickInput.style('font-size', '32px');
  nickInput.size(170);

  createSettings();
}

function draw() {
  if(inSession){
    background(0);
    session.update();
  }
  else{
    if(inSettings) drawSettings();
    else {
      background(0);
      textAlign(CENTER);
      textSize(100);
      fill('white');
      text('Space shooter', width/2, 100);
      textAlign(LEFT);
      textSize(32);
      text('Nick: ', width/2 - 130, 210);
    }
  }

  if (keyIsDown(ESCAPE)){
    inSession = false;
    backButFun();
    thrust.stop();
    if(typeof socket !== 'undefined') socket.disconnect();
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

function settingsButFun() {
  hideDOM();
  inSettings = true;
  settingsShowDOM();
}

function showDOM() {
  nickInput.show();
  tpBut.show();
  mpBut.show();
  settingsBut.show();
}

function hideDOM() {
  nickInput.hide();
  tpBut.hide();
  mpBut.hide();
  settingsBut.hide();
}


