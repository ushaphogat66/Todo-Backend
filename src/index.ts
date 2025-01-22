import express, { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/authRoutes";
import { authenticateToken } from "./middleware/authMiddleware";
import taskRoutes from "./routes/taskRoutes";
import cors from "cors";
import env from "dotenv";

env.config();

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use(
  cors({
    origin: [
      "https://do-it-tasks.vercel.app",
      "http://localhost:4000",
      "https://do-it-tasks.vercel.app/",
      "http://192.168.1.3:4000"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background: linear-gradient(45deg, #30cfd0 0%, #330867 100%);
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
              }
              .container {
                  text-align: center;
                  background: rgba(255, 255, 255, 0.6);
                  backdrop-filter: blur(10px);
                  padding: 50px;
                  border-radius: 10px;
                  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                  background: linear-gradient(to right, #30cfd0 0%, #330867 100%);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;

              }
              
          </style>
      </head>
      <body>
          <div class="container">
              <h1>Welcome to the Todo Backend</h1>
          </div>
      </body>
      </html>
  `);
});

app.use("/auth", authRoutes);

//* Middleware to authenticate JWT token
// app.use(authenticateToken);

//* Routes

app.use("/tasks", taskRoutes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
