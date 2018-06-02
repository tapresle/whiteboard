const io = require('socket.io').listen(4000);
let clients = [];
let roomMap = {};

io.sockets.on('connection', (socket) => {
  // Add new Client to list, use TBD;
  clients.push(socket.client.id);
  console.log('New client, ' + clients.length + ' clients connected.');
  
  socket.on('disconnecting', (reason) => {
    clients.splice(clients.indexOf(socket.client.id, 1));
    console.log('Client left, ' + clients.length + ' clients remain.');
  });

  // When someone draws, send it out to everyone else in the room
  socket.on('drawClick', (data) => {
    roomMap[data.roomId].whiteboardModel = data.whiteboardModel;
    socket.broadcast.to(data.roomId).emit('draw', {
      whiteboardModel: data.whiteboardModel
    });
  });

  socket.on('joinRoom', (data) => {
    socket.join(data.room);
    // If the room doesn't exist in the map, set it up
    if (!roomMap[data.room]) {
      roomMap[data.room] = {
        roomId: data.room,
        whiteboardModel: {
          clickX: [],
          clickY: [],
          clickDrag: [],
          color: []
        }
      };
    }
    console.log('Client ' + socket.client.id + ', joined room ' + data.room);
    
    socket.emit('joinedRoom', {
      roomId: data.room,
      whiteboardModel: roomMap[data.room].whiteboardModel
    });
  });
});
