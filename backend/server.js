import dotenv from "dotenv";
dotenv.config();
import express, { json } from "express";
import { connect } from "mongoose";

import { userRouter } from "./routes/user.js";
import { adminRouter } from "./routes/admin.js";
import { courseRouter } from "./routes/course.js";

const app = express();
app.use(json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
  try {
    console.log("Connecting to database...");
    await connect(process.env.MONGODB_URI);
    console.log("Connected to Database");
    app.listen(3000);
    console.log("listening on port 3000");
  } catch (err) {
    console.log("Error connecting to database - ", err);
  }
}

main();
