import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routers/authRoutes';
import userRoutes from './routers/userRoutes';
import pool from './db/db';
import authMiddleware from './lib/middleware/authMiddleware';
import { Server, Socket } from 'socket.io';
import userServices from './services/userServices';
// server
const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



pool.connect().then(() => {
  console.log("connected to the Database");
}
).catch((err) => {
  console.log("test",err);
}
);
app.use('/api/auth', authRoutes);
// app.use(authMiddleware);
app.use('/api/user', userRoutes);




const socket = new Server(server, {
  cors: {
    origin: '*',
  },
});



socket.on('connection', (socket) => {
  console.log('User connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
  socket.on('chat message', (msg) => {
    console.log('message: ' + msg);
    // socket.broadcast.emit('chat message', msg);
  });
  userServices.initSocket(socket as unknown as any);
});

socket.on('error', (err) => {
  console.log(err);
}
);



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
