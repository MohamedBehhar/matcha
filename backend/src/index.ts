import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routers/authRoutes";
import userRoutes from "./routers/userRoutes";
import interstsRoutes from "./routers/interestsRoutes";
import pool from "./db/db";
import authMiddleware from "./lib/middleware/authMiddleware";
import { Server } from "socket.io";
import userServices from "./services/userServices";
import multer from "multer";
import path from "path";
import usersInteractionsRoutes from "./routers/usersInteractionsRoutes";
import UsersInteractionsServices from "./services/UsersInteractionsServices";
import notificationsRoutes from "./routers/notificationsRoutes";
import notificationsServices from "./services/notificationsServices";
import {
  addSocketIdToRedis,
  deleteSocketIdFromRedis,
  getUserIdBySocketId,
} from "./utils/redis";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import msgsServices from "./services/msgsServices";
import msgsRoutes from "./routers/msgsRoutes";

const PORT = 3000;
const app = express();
const server = http.createServer(app);
const upload = multer();

// Express middlewares
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true,
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

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Database connection
pool
  .connect()
  .then(() => {
    console.log("✅ Connected to the Database");
  })
  .catch((err) => {
    console.error("❌ Database connection error", err);
  });

// API routes
app.use("/api/auth", authRoutes);
app.use(authMiddleware);
app.use("/api/user", userRoutes);
app.use("/api/interests", interstsRoutes);
app.use("/api/interactions", usersInteractionsRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/messages", msgsRoutes);
// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

function initializeServices(io: Server) {
  UsersInteractionsServices.initSocket(io);
  userServices.initSocket(io);
  notificationsServices.initSocket(io);
  msgsServices.initSocket(io);
}
initializeServices(io);

io.on("connection", (socket) => {
  socket.on("disconnect", async () => {
    const disconnectedUserId = await getUserIdBySocketId(socket.id);
    console.log(
      `❌ User disconnected: ${disconnectedUserId} (socket: ${socket.id})`
    );
    if (disconnectedUserId) {
      await deleteSocketIdFromRedis(socket.id);
    }
  });

  socket.on("join", async (userId: string) => {
    await addSocketIdToRedis(userId, socket.id);
    socket.emit("connected", { socketId: socket.id, userId });
  });

  socket.on("direct_message", async (data: any) => {
    const { sender_id, receiver_id, content } = data;
    console.log(
      `New direct message from ${sender_id} to ${receiver_id}: ${content}`
    );

    // Save the message to the database
    await msgsServices.saveMsgs(sender_id, receiver_id, content);
  });
});

// Global socket error handler
io.on("error", (err) => {
  console.error("⚠️ Socket.IO error:", err);
});

// Server start
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
