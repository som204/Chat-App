import express from "express";
import morgan from "morgan";
import cors from 'cors'
import connectDB from "./Db/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./Routes/user.routes.js";
import projectRoute from './Routes/project.routes.js'

connectDB();
const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, 
};

app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/users", userRoute);
app.use("/projects",projectRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

export default app;
