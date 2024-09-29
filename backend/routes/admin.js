const { Router } = require("express");
const adminRouter = Router();
const { adminModel, courseModel } = require("../db");
const jwt = require("jsonwebtoken");
import { z } from "zod";
const bcrypt = require("bcrypt");
const { JWT_ADMIN_PASSWORD } = require("../config");
const { adminMiddleware } = require("../middleware/admin");
const cookieParser = require("cookie-parser");

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

const courseSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z
    .string()
    .min(2, { message: "Description must be at least 2 characters" }),
  imageUrl: z.string().url({ message: "Invalid URL" }),
  price: z.number().positive({ message: "Price cannot be negative" }),
  courseId: z.string().optional(),
});

const signinSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string(),
});

adminRouter.post("/signup", async function (req, res) {
  try {
    const validatedData = signupSchema.parse(req.body);

    const { email, password, firstName, lastName } = validatedData;
    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    res.json({
      message: "Signup succeeded",
    });
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

adminRouter.post("/signin", async function (req, res) {
  try {
    const { email, password } = signinSchema.parse(req.body);
    const admin = await adminModel.findOne({ email: email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    bcrypt.compare(password, admin.password, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error comparing passwords" });
      }
      if (!result) {
        return res.status(401).json({ message: "Incorrect credentials" });
      } else {
        const token = jwt.sign(
          {
            id: admin._id,
          },
          JWT_ADMIN_PASSWORD
        );

        res.json({
          token: token,
        });
      }
    });

    const token = jwt.sign({ id: admin._id }, JWT_ADMIN_PASSWORD, {
      expiresIn: "7d",
    });

    res.json({ token });

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" || true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.json({ message: "Admin logged in successfully" });
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

userRouter.post("/signout", (req, res) => {
  res.clearCookie("authToken");
  res.json({ message: "Logged out successfully" });
});

adminRouter.post("/course", adminMiddleware, async function (req, res) {
  try {
    // Validate request body
    const { title, description, imageUrl, price } = courseSchema.parse(
      req.body
    );
    const adminId = req.userId;

    // creating a web3 saas in 6 hours
    const course = await courseModel.create({
      title: title,
      description: description,
      imageUrl: imageUrl,
      price: price,
      creatorId: adminId,
    });

    res.json({
      message: "Course created",
      courseId: course._id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.log(error);
      res.status(500).json({
        message: "Error creating course",
      });
    }
  }
});

adminRouter.put("/course", adminMiddleware, async function (req, res) {
  try {
    // Validate request body
    const { title, description, imageUrl, price, courseId } = courseSchema.parse(req.body);
    const adminId = req.userId;

    // creating a web3 saas in 6 hours
    const course = await courseModel.updateOne(
      {
        _id: courseId,
        creatorId: adminId,
      },
      {
        title: title,
        description: description,
        imageUrl: imageUrl,
        price: price,
      }
    );

    res.json({
      message: "Course updated",
      courseId: course._id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      console.log(error);
      res.status(500).json({
        message: "Error updating course",
      });
    }
  }
});

adminRouter.get("/course/bulk", adminMiddleware, async function (req, res) {
  const adminId = req.userId;

  const courses = await courseModel.find({
    creatorId: adminId,
  });

  res.json({
    message: "Course updated",
    courses,
  });
});

module.exports = {
  adminRouter: adminRouter,
};
