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
    console.log('targetId: ' + targetId);

    if (!users[targetId]) {
      return;
    }
    console.log('targetId: ' + targetId);
    // send an update to that particular socket
    socket.to(targetId).emit('startGame', data.myId);
  });

  socket.on('newRound', (index, targetId) => {
    // if the target user does not exist, ignore it
    console.log('index: ' + index);
    if (!users[targetId]) {
      return;
    }
    console.log('index: ' + index);
    // send an update to that particular socket
    socket.to(targetId).emit('newRound', index);
  });

  socket.on('roundDone', (ids) => {
    // if the target user does not exist, ignore it

    if (!users[ids.winner] && !users[ids.loser]) {
      return;
    }
    console.log("round done");
    // send an update to that particular socket
    socket.to(ids.winner).emit('roundDone', true);
    socket.to(ids.loser).emit('roundDone', false);
  });

  socket.on('updateScore', (score, targetId) =>{
    // if the target user does not exist, ignore it
    console.log("score: " + score);
    if (!users[targetId]) {
      return;
    }
    console.log("score: " + score);
    // send an update to that particular socket
    socket.to(targetId).emit('updateScore', score);
  });

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
