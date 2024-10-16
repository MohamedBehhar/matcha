import express, { Request, Response } from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import authRoutes from "./routers/authRoutes";
import pool from "./db/db";
import geolocationRoutes from "./routers/geolocationRoutes";

// server
const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

pool
  .connect()
  .then(() => {
    console.log("connected to the Database");
  })
  .catch((err) => {
    console.log("test", err);
  });

app.use("/api/auth", authRoutes);
app.use("/api/geolocation", geolocationRoutes);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
