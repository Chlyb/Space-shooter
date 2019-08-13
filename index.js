var express = require('express');
// Create the app
var app = express();

//importing shared code
var sharedModule = require('./public/sharedModule'),
sys = require('util');

var gameMap = sharedModule.generateMap();

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

    var data = {
      id: socket.id,
      x: sharedModule.WIDTH*Math.random(),
      y: sharedModule.HEIGHT*Math.random(),

      //asteroids
      xs: gameMap.xs,
      ys: gameMap.ys,
      s: gameMap.s
    };
    socket.emit('connected', data);
    
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
    let c = sharedModule.generateComet();

    let data = {
      x: c.x,
      y: c.y,
      vx: c.vx,
      vy: c.vy,
      r: c.r,
      t: new Date().getTime()
    };
    io.emit('c', data); //comet
  }
}
