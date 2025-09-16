import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
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
import orm from "./lib/orm";
import { errorHandler } from "./lib/middleware/errorHandler";

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
  socket.on("message", async (data: any) => {
    if (data.type === "image") {
      /// i have content base 64 image data
      const base64Data = data.content.replace(/^data:image\/png;base64,/, "");
      const fileName = `image-${Date.now()}.png`;

      //  Error saving image: [Error: ENOENT: no such file or directory, open '/app/public/uploads/image-1749479942891.png'] {
      // check if public/uploads directory exists
      const uploadsDir = path.join(__dirname, "../public/uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const filePath = path.join(__dirname, "../public/uploads", fileName);
      fs.writeFile(filePath, base64Data, "base64", (err) => {
        if (err) {
          console.error("❌ Error saving image:", err);
          return;
        }
        console.log(`✅ Image saved as ${fileName}`);
        data.content = `/uploads/${fileName}`; // Update content to the image path
      });
    }

    socket.broadcast.emit("message", data);
    await msgsServices.saveMsgs(
      data.sender_id,
      data.recipient_id,
      data.content,
      data.type || "text"
    );
    orm
      .querySql(
        `INSERT INTO messages (sender_id, recipient_id, content, type, conversation_id) VALUES ($1, $2, $3, $4, $5)`,
        [
          data.from,
          data.to,
          data.content,
          data.type || "text",
          data.conversation_id,
        ]
      )
      .then(() => {
        console.log("✅ Message saved to database");
      })
      .catch((err) => {
        console.error("❌ Error saving message to database:", err);
      });
  });

  socket.on("newVisit", async ({ user_id, visited_id }: any) => {
    UsersInteractionsServices.newVisit(user_id, visited_id);
  });
});

// Global socket error handler
io.on("error", (err) => {
  console.error("⚠️ Socket.IO error:", err);
});

app.use(errorHandler);

// Server start
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
