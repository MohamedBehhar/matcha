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
import { addSocketIdToRedis, deleteSocketIdFromRedis } from "./utils/redis";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
import msgsServices from "./services/msgsServices";

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

// Socket.io server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const userMap = new Map<string, string>();

io.on("connection", (socket) => {
  // Initialize custom services sockets
  UsersInteractionsServices.initSocket(socket as unknown as any, userMap);
  userServices.initSocket(socket as unknown as any);
  notificationsServices.initSocket(socket as unknown as any, userMap);
  msgsServices.initSocket(socket as unknown as any, userMap);

  socket.on("join", (userId) => {
    console.log(`🔗 User ${userId} connected with socket ID: ${socket.id}`);
    addSocketIdToRedis(userId, socket.id)
      .then(() => {
        console.log(`✅ Socket ID ${socket.id} added for user ${userId}`);
        userMap.set(socket.id, userId);
        // Notify the user of successful connection
        socket.emit("connected", {
          message: `You are connected with socket ID: ${socket.id}`,
          userId: userId,
        });
      })
      .catch((err) => {
        console.error(`❌ Error adding socket ID for user ${userId}:`, err);
      });
  });

  // Handle direct messages
  socket.on("direct_message", (msg) => {
    console.log("--------------------------- 📩 Message received: ", msg);
    const { sender_id, recipient_id, content, media_type, media_url } = msg;
    console.log(userMap);
    if (userMap.has(recipient_id)) {
      const recipientSocketId = userMap.get(recipient_id);
      if (recipientSocketId) {
        console.log(
          `📬 Sending message from ${sender_id} to ${recipient_id} via socket ${recipientSocketId}`
        );
        socket.to(recipientSocketId).emit("message", {
          from: sender_id,
          content,
          media_type,
          media_url,
        });
      } else {
        console.warn(`⚠️ No socket found for user ${recipient_id}`);
      }
    }
    // if (!to || !from || !content) {
    //   console.error("❌ Invalid message format:", msg);
    //   return;
    // }
    // if (userMap.has(to)) {
    //   const recipientSocketId = userMap.get(to);
    //   if (recipientSocketId) {
    //     console.log(
    //       `📬 Sending message from ${from} to ${to} via socket ${recipientSocketId}`
    //     );
    //     socket.to(recipientSocketId).emit("message", {
    //       from,
    //       content,
    //       media_type,
    //       media_url,
    //     });
    //   } else {
    //     console.warn(`⚠️ No socket found for user ${to}`);
    //   }
    // }
    // msgsServices
    //   .saveMsgs(from, to, content, media_type)
    //   .then(() => {
    //     console.log("✅ Message saved successfully");
    //   })
    //   .catch((err) => {
    //     console.error("❌ Error saving message:", err);
    //   });
  });

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    const disconnectedUserId = userMap.get(socket.id);
    console.log(
      `❌ User disconnected: ${disconnectedUserId} (socket: ${socket.id})`
    );
    if (disconnectedUserId) {
      deleteSocketIdFromRedis(socket.id);
      userMap.delete(socket.id);
    }
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
