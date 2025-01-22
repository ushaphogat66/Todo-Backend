"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("./routes/taskRoutes"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: [
        "https://do-it-tasks.vercel.app",
        "http://localhost:4000",
        "https://do-it-tasks.vercel.app/"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.get("/", (req, res) => {
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
app.use("/auth", authRoutes_1.default);
//* Middleware to authenticate JWT token
// app.use(authenticateToken);
//* Routes
app.use("/tasks", taskRoutes_1.default);
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
