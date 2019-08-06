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