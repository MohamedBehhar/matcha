import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routers/authRoutes';


// server
const PORT = 3000;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);



server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
