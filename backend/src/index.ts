import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routers/authRoutes';
import userRoutes from './routers/userRoutes';
import interstsRoutes from './routers/interestsRoutes';
import pool from './db/db';
import authMiddleware from './lib/middleware/authMiddleware';
import { Server, Socket } from 'socket.io';
import userServices from './services/userServices';
import multer from "multer";
import path from 'path';
import authServices from './services/authServices';
import orm from './lib/orm';

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const upload = multer();

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
app.use('/api/interests', interstsRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



const socket = new Server(server, {
  cors: {
    origin: '*',
  },
});


socket.use(async (socket:any, next) => {
  const token = socket.handshake.auth.token;
  if (!token ||  !token.startsWith('Bearer ')) {
    return next(new Error('Authentication error'));
  }
  const authToken = token.split(' ')[1];
  const email = await authServices.verifyToken(authToken, process.env.JWT_SECRET as string);
  if (email) {
    socket.email = email;
    return next();
  } 
  return next(new Error('Authentication error'));
}
);

socket.on('connection', async(socket:any) => {
const email = socket.email; 
const user = await orm.findOne("users", {
  where: {
    email: email,
  },
});
if (!user){
  socket.disconnect();
}
  const chanels = await orm.findMany("chanel_users", {
    select: ['chanel_id'],
    where: {
      user_id: user.id,
    },
  });

  if (chanels) {
    chanels.forEach(async (chanel:any) => {
      socket.join(chanel.chanel_id);
    });
  }
  socket.on('disconnect', () => {
    console.log('User disconnected');
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


