import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/user.route.js";
import authRoutes from "./routes/auth.route.js";
import postRoutes from "./routes/posts.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";

const app = express();

// it reads the contents of a .env file in your project directory and adds the variables defined in that file to the process.env object.
dotenv.config();

const port = process.env.PORT || 8000;
const allowedOrigins = ["http://localhost:5173"];

// Get the directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// express json is body parser ,READ THE POST REQ.BODY - OTHERWISE, RETURNS EMPTY SET OF DATA .
app.use(express.json());
// app.use(express.static(path.resolve(__dirname, "dist")));
app.use(cookieParser());
// for cross origin connection
app.use(
  cors({
    origin: allowedOrigins,
    //This option allows requests from the specified origins to include cookies and HTTP authentication headers in the request.
    credentials: true,
  })
);
// routes
app.get("/", (req, res) => {
  return res.status(200).json("Blog api is working");
});
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/posts", postRoutes);

// middleware for handling error
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// mongodb connection
async function dbConnection() {
  try {
    // process object is a global object that provides information about, and control over, the current Node.js process.env is where we store critical info
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`Connected to MongoDB!`);
  } catch (error) {
    console.log("db not connected");
  }
}

// listening on server
app.listen(port, () => {
  dbConnection();
  console.log(`server running on ${port} port`);
});
