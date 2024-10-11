import { JWT_USER_PASSWORD } from "../config.js";

import { userModel, purchaseModel, courseModel } from "../db.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import {userMiddleware} from "../middlewares/user.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import cookieParser from "cookie-parser";

const userRouter = Router();

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" })
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      }
    ),
  firstName: z
    .string()
    .min(2, { message: "First name must be at least 2 characters" }),
  lastName: z
    .string()
    .min(2, { message: "Last name must be at least 2 characters" }),
});

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

userRouter.post("/signup", async (req, res) => {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { email, password, firstName, lastName } = validatedData;

    const hashedPassword = await bcrypt.hash(password, 10);

    await userModel.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    });

    res.json({ message: "You have successfully signed up" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.log(error);
      res.status(500).json({
        message: "Error creating user",
      });
    }
  }
});

userRouter.post("/signin", cookieParser, async (req, res) => {
  try {
    const { email, password } = signinSchema.parse(req.body);
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          message: "Error comparing passwords",
        });
      }
      if (!result) {
        return res.status(401).json({
          message: "Incorrect credentials",
        });
      } else {
        const token = jwt.sign(
          {
            id: user._id,
          },
          JWT_USER_PASSWORD
        );

        res.json({
          token: token,
        });
      }
    });

    const token = jwt.sign({ id: user._id }, JWT_USER_PASSWORD, {
      expiresIn: "7d",
    });

    res.json({ token });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ message: "User logged in successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.log(error);
      res.status(500).json({
        message: "Error logging in",
      });
    }
  }
});

userRouter.get("/purchases", userMiddleware, async function (req, res) {
  const userId = req.userId;
  try {
    const purchases = await purchaseModel.find({
      userId,
    });

    let purchasedCourseIds = [];

    for (let i = 0; i < purchases.length; i++) {
      purchasedCourseIds.push(purchases[i].courseId);
    }

    const coursesData = await courseModel.find({
      _id: { $in: purchasedCourseIds },
    });

    res.json({
      purchases,
      coursesData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error fetching purchases",
    });
  }
});

export { userRouter };
