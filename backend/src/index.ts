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
import usersInteractionsRoutes from "./routers/usersInteractionsRoutes";
import UsersInteractionsServices from "./services/UsersInteractionsServices";
import notificationsRoutes from "./routers/notificationsRoutes";
import notificationsServices from "./services/notificationsServices";
import { addSocketIdToRedis, deleteSocketIdFromRedis } from "./utils/redis";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const upload = multer();

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Replace with your frontend URL
    credentials: true, // ✅ Required for cookies
  })
);
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

const userMap = new Map<string, string>();

app.use(express.static(path.join(__dirname, "../public")));
pool
  .connect()
  .then(() => {
    console.log("connected to the Database");
  })
  .catch((err) => {
    console.log("test", err);
  });
app.use("/api/auth", authRoutes);
app.use(authMiddleware);
app.use("/api/user", userRoutes);
app.use("/api/interests", interstsRoutes);
app.use("/api/interactions", usersInteractionsRoutes);
app.use("/api/notifications", notificationsRoutes);

const socket = new Server(server, {
  cors: {
    origin: "*",
  },
});

socket.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("disconnect", () => {
    deleteSocketIdFromRedis(socket.id);
  });
  socket.on("join", (userId) => {
    console.log("User joined", userId);
    addSocketIdToRedis(userId, socket.id);
  });
  socket.on("chat message", (msg) => {
    console.log("message: " + msg);
    // socket.broadcast.emit('chat message', msg);
  });
  UsersInteractionsServices.initSocket(socket as unknown as any, userMap);
  userServices.initSocket(socket as unknown as any);
  notificationsServices.initSocket(socket as unknown as any, userMap);
});

socket.on("error", (err) => {
  console.log(err);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
