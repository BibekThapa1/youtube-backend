import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// ALL THE CODE RELATED TO ROUTES
// routes import 

import userRouter from "./routes/user.routes.js"

// router declaration
app.use("/api/v1/users",userRouter)

// https://localhost:8000/api/v1/users
export { app };
