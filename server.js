const io = require('socket.io').listen(4000);
let clients = [];
let currentWhiteboardModel;
let roomMap = {};

io.sockets.on('connection', (socket) => {
  // Add new Client to list, use TBD;
  clients.push(socket.client.id);
  console.log('New client, ' + clients.length + ' clients connected.');

  // Send the new client the initial whiteboard, if any
  if (currentWhiteboardModel) {
    socket.emit('drawInitialWhiteboard', {
      whiteboardModel: currentWhiteboardModel
    });
  }
  
  socket.on('disconnecting', (reason) => {
    clients.splice(clients.indexOf(socket.client.id, 1));
    console.log('Client left, ' + clients.length + ' clients remain.');
  });

  // When someone draws, send it out to everyone else
  socket.on('drawClick', (data) => {
    currentWhiteboardModel = data.whiteboardModel;
    socket.broadcast.emit('draw', {
      whiteboardModel: data.whiteboardModel
    });
  });

  socket.on('joinRoom', (data) => {
    socket.join(data.room);
    roomMap[data.room] = {roomId: data.room, whiteboardModel: null};
    console.log('Client ' + socket.client.id + ', joined room ' + data.room);
    
    socket.emit('joinedRoom', {
      roomId: data.room,
      whiteboardModel: null
    });
  });
});
