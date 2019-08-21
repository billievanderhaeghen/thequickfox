const express = require('express');
const app = express();
const server = require('http').Server(app);
const port = process.env.PORT || 8081;

const io = require('socket.io')(server);
let connectionUrl = '';

app.use(`/`, express.static(`src`));

const users = {};

io.on('connection', socket => {
  console.log('connection');
  console.log(socket.id);
  socket.emit('connectionUrl', socket.id);

  users[socket.id] = {
    id: socket.id
  };


  socket.on('joinGame', (targetId, data) => {
    // if the target user does not exist, ignore it
    console.log('targetId' + targetId);

    if (!users[targetId]) {
      return;
    }
    console.log('targetId' + targetId);
    // send an update to that particular socket
    socket.to(targetId).emit('startGame', targetId);
    socket.to(data.myId).emit('startGame', data.myId);
  });

  // socket.on('startGame', () => {
  //   //some code code
  // })

  socket.on('disconnect', () => {
    console.log('client disconnected');
    delete users[socket.id];
  });
});

server.listen(port, () => {
  console.log(`App listening on port ${port}!`);

  require('./get-ip-addresses')().then(ipAddresses => {
    if (ipAddresses.en0) {
      connectionUrl = `http://${ipAddresses.en0[0]}:${port}`;
    } else {
      connectionUrl = `http://localhost:${port}`;
    }
  });
});
