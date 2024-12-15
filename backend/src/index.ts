import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routers/authRoutes";
import userRoutes from "./routers/userRoutes";
import interstsRoutes from "./routers/interestsRoutes";
import pool from "./db/db";
import authMiddleware from "./lib/middleware/authMiddleware";
import { Server, Socket } from "socket.io";
import userServices from "./services/userServices";
import multer from "multer";
import path from "path";
import geolocationRoutes from "./routers/geolocationRoutes";
import matchMakingRoutes from "./routers/matchMakingRoutes";
import matchMakingServices from "./services/matchMakingServices";
import notificationsRoutes from "./routers/notificationsRoutes";

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const upload = multer();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const userMap = new Map<string, string>();

app.use("/public", express.static(path.join(__dirname, "public")));

pool
  .connect()
  .then(() => {
    console.log("connected to the Database");
  })
  .catch((err) => {
    console.log("test", err);
  });
app.use("/api/auth", authRoutes);
// app.use(authMiddleware);
app.use("/api/user", userRoutes);
app.use("/api/interests", interstsRoutes);
app.use("/api/geolocation", geolocationRoutes);
app.use("/api/matchmaking", matchMakingRoutes);
app.use("/api/notifications", notificationsRoutes);

const socket = new Server(server, {
  cors: {
    origin: "*",
  },
});

<<<<<<< HEAD

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
=======
socket.on("connection", (socket) => {
  console.log("User connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("join", (userId) => {
    console.log("User joined", userId);
    userMap.set(userId, socket.id);
  });
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    // socket.broadcast.emit('chat message', msg);
  });
  matchMakingServices.initSocket(socket as unknown as any, userMap);
>>>>>>> moha
  userServices.initSocket(socket as unknown as any);
});

socket.on("error", (err) => {
  console.log(err);
<<<<<<< HEAD
}
);

=======
});
>>>>>>> moha

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
