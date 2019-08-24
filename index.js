var express = require('express');
// Create the app
var app = express();

//importing shared code
var sharedModule = require('./public/sharedModule'),
sys = require('util');

var gameMap = sharedModule.generateMap();
var clients = new Map();
var latencies = new Map();
var starSeed = Math.random()*10000000;

// Set up the server
var server = app.listen(process.env.PORT || 6000, listen);

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

app.use(express.static('public'));
var io = require('socket.io')(server, {pingInterval: 1000})

// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function (socket) {
  
    console.log("We have a new client: " + socket.id);

    let cli =  Array.from( clients.values() );

    var data = {
      id: socket.id,
      x: sharedModule.WIDTH*Math.random(),
      y: sharedModule.HEIGHT*Math.random(),

      //asteroids
      xs: gameMap.xs,
      ys: gameMap.ys,
      s: gameMap.s,

      starSeed: starSeed,

      clients: cli
    };
    socket.emit('connected', data);

    var client = {
      id: socket.id,
      nick: "",
      kills: 0,
      deaths: 0
    };
    clients.set(socket.id, client);
    latencies.set(socket.id, 0);

    socket.on('n', //nick
      function(data) {
        socket.broadcast.emit('n', data);

        clients.get(data.id).nick = data.n;
      }
    );
    
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
        clients.get(data.id).deaths++;
        if(data.c[0]=='/')
          clients.get(data.c).kills++;
      }
    );

    socket.on('l', //latency
      function(ms) {
        latencies.set(socket.id, ms);
      }
    );

    socket.on('disconnect', function() {
      socket.broadcast.emit('dis', socket.id);  
      console.log("Client has disconnected");
      clients.delete(socket.id);
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
      //t: new Date().getTime()
      t: Date.now()
    };
    io.emit('c', data); //comet
  }
}
