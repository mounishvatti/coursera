const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = express();
const port = process.env.PORT || 3000;
const { verifyToken, JWT_SECRET } = require("./auth");
const { UserModel, CourseModel } = require("./db");

const mongodb_url = process.env.MONGODB_URL;

mongoose
  .connect(mongodb_url)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });

    res.json({ message: "User created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating user" });
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email: email }); // find one user with these credentials
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if (!result) {
        return res.status(401).json({ message: "Incorrect password" });
      } else {
        const token = jwt.sign(
          {
            id: user._id.toString(),
          },
          JWT_SECRET,
          { expiresIn: "2h" }
        );

        return res.json({ message: "Login successful", token: token });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error logging in" });
  }
});

