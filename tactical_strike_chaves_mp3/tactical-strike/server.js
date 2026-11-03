const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.use('/vendor/three', express.static(path.join(__dirname, 'node_modules/three')));
app.use(express.static(path.join(__dirname, 'public')));
const players = {};
io.on('connection', socket => {
  socket.on('join', data => {
    players[socket.id] = { name: String(data?.name || 'Operador').slice(0,16), x: -28, y: -7.3, z: -29.8, yaw: 0 };
    socket.emit('message', 'Conectado à sala. Compartilhe o endereço do servidor com seus amigos.');
  });
  socket.on('move', data => {
    if (!players[socket.id]) return;
    const x = Number(data?.x), z = Number(data?.z), y = Number(data?.y), yaw = Number(data?.yaw);
    if ([x,y,z,yaw].every(Number.isFinite)) {
      // Basic bounds validation; production games should use server-authoritative movement.
      players[socket.id].x = Math.max(-256, Math.min(256, x));
      players[socket.id].z = Math.max(-256, Math.min(256, z));
      players[socket.id].y = Math.max(-100, Math.min(256, y));
      players[socket.id].yaw = yaw;
    }
  });
  socket.on('shoot', () => {
    socket.broadcast.emit('message', `${players[socket.id]?.name || 'Um jogador'} disparou`);
  });
  socket.on('disconnect', () => { delete players[socket.id]; });
});
setInterval(() => io.emit('state', players), 50);
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`Tactical Strike disponível na porta ${PORT}`));
