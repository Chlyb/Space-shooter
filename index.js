var WIDTH = 600;
var HEIGHT = 400;

var express = require('express');
// Create the app
var app = express();

// Set up the server
var server = app.listen(process.env.PORT || 6000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
var io = require('socket.io')(server);

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);
    socket.emit('connected', { id: socket.id, x: 500*Math.random(), y: 500*Math.random()});
    
    socket.on('p', //position
      function(data) {
        socket.broadcast.emit('p', data);
        //io.emit('p', data);
      }
    );

    socket.on('b', //bullet
      function(data) {
        socket.broadcast.emit('b', data);
      }
    );

    socket.on('h', //hit
      function(data) {
        socket.broadcast.emit('h', data);
      }
    );

    socket.on('d', //destroyed
      function(data) {
        socket.broadcast.emit('d', data);   
      }
    );

    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);

setInterval( update, 100);

function update() {
  let r = Math.random();
  if(r < 0.05) {
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

    //sending it one second off the screen
    x = x - vx*(tMin+1);
    y = y - vy*(tMin+1);

    var data = {
      x: x,
      y: y,
      vx: vx,
      vy: vy,
      r: 5 + Math.random()*20,
      t: new Date().getTime()
    };
    io.emit('c', data); //comet
  }
}
