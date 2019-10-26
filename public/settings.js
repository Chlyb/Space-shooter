var starsBox;
var backBut;

function createSettings() {
  starsBox = createCheckbox('stars', true);
  starsBox.position(width/2, 170);
  let box = starsBox.elt.getElementsByTagName('input')[0];
	box.style.width = '50px';
	box.style.height = '50px';
  starsBox.hide();

  backBut = createButton('Back');
  backBut.style('width', '250px');
  backBut.style('background-color', 'black');
  backBut.style('color', 'white');
  backBut.style('font-size', '48px');
  backBut.position(width/2 - 125, 250);
  backBut.mousePressed(backButFun);
  backBut.hide();
}

function settingsShowDOM() {
  starsBox.show();
  backBut.show();
}

function settingsHideDOM() {
  starsBox.hide();
  backBut.hide();
}

function drawSettings() {
  background(0);
  textAlign(CENTER);
  textSize(100);
  fill('white');
  text('Settings', width/2, 100);
  textAlign(LEFT);
  textSize(32);
  text('Starfield ', width/2 - 130, 210);
}

function backButFun() {
  inSettings = false;
  settingsHideDOM();
  showDOM();
}