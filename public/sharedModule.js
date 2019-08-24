(function(exports){
  var WIDTH = 1400;
  var HEIGHT = 868;

  exports.WIDTH = WIDTH;
  exports.HEIGHT = HEIGHT;

  exports.generateMap = function(){
  var n = Math.random()*4 + 10; 
  var xs = [];
  var ys = [];
  var seeds = [];

  let d;

  let i = 0;
  while(i < n) {
    let x = Math.random()*WIDTH;
    let y = Math.random()*HEIGHT;
      
    let coll = false;
    
    for(let j =0; j < xs.length; j++){
      d = (x - xs[j])*(x - xs[j]) + (y - ys[j])*(y - ys[j]);
      if(d < 200*200)
        coll = true;
    }
    
    if(!coll){
      xs.push(x);
      ys.push(y);
      seeds.push(Math.random()*10000000);
      i++;
    }
  }

  var data = { 
      xs: xs,
      ys: ys,
      s: seeds
    };

  return data;
}

exports.generateComet = function() {
  let x = Math.random() * WIDTH;
  let y = Math.random() * HEIGHT;
  let angle = Math.random() * 360;
  let v = 70 + Math.random() * 200;
  let vx = Math.cos(angle) * v;
  let vy = Math.sin(angle) * v;

  let t = [];
    t[0] = x/vx;
    if(t[0] < 0) t[0] = Number.POSITIVE_INFINITY;
    t[1] = -(WIDTH-x)/vx;
    if(t[1] < 0) t[1] = Number.POSITIVE_INFINITY;
    t[2] = y/vy;
    if(t[2] < 0) t[2] = Number.POSITIVE_INFINITY;
    t[3] = -(HEIGHT-y)/vy;
    if(t[3] < 0) t[3] = Number.POSITIVE_INFINITY;

    let tMin = Number.POSITIVE_INFINITY;
    for(let i = 0; i < 4; i++){
      if(t[i] >= 0 && t[i] < tMin){
        tMin = t[i];
      }
    }
    x = x - vx*(tMin+1);
    y = y - vy*(tMin+1);


    //moving it one second off the screen
    var data = {
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      r: 5 + Math.random()*20,
    };
    return data;
}

})(typeof exports === 'undefined'? this['sharedModule']={}: exports);