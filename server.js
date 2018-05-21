const io = require('socket.io').listen(4000);
let clients = [];

io.sockets.on('connection', (socket) => {
  // Add new Client to list, use TBD;
  clients.push(socket.client.id);
  console.log('New client, ' + clients.length + ' clients connected.');

  socket.on('disconnecting', (reason) => {
    clients.splice(clients.indexOf(socket.client.id, 1));
    console.log('Client left, ' + clients.length + ' clients remain.');
  });

  // When someone draws, send it out to everyone else
  socket.on('drawClick', (data) => {
    socket.broadcast.emit('draw', {
      clickX: data.clickX,
      clickY: data.clickY,
      clickDrag: data.clickDrag
    });
  });
});
