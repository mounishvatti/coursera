import { Router } from "express";
import { adminModel, courseModel } from "../db.js";
import jwt from "jsonwebtoken";
import { z } from "zod";
import bcrypt from "bcrypt";
import { adminMiddleware } from "../middlewares/admin.js";

const adminRouter = Router();

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
    // First validate the input using Zod schema
    const validatedData = signupSchema.parse(req.body);

    const { email, password, firstName, lastName } = validatedData;

    // Check if an admin with the same email already exists
    const existingAdmin = await adminModel.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    // If admin doesn't exist, hash the password and create a new admin
    const hashedPassword = await bcrypt.hash(password, 10);

    await adminModel.create({
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });

    // Send success response
    res.json({
      message: "Signup succeeded",
    });
  } catch (error) {
    // Handle validation errors from Zod schema
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }
    // Log the error and return a generic 500 error if something goes wrong
    console.log(error);
    res.status(500).json({
      message: "Error creating user",
    });
  }
});

adminRouter.post("/signin", async function (req, res) {
  try {
    // Validate the input
    const { email, password } = signinSchema.parse(req.body);

    // Find the admin by email
    const admin = await adminModel.findOne({ email: email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    } else {
      // Compare the passwords
      bcrypt.compare(password, admin.password, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error comparing passwords" });
        }
        if (!result) {
          return res.status(401).json({ message: "Incorrect credentials" });
        } else {
          const token = jwt.sign(
            { id: admin._id.toString() },
            process.env.JWT_ADMIN_PASSWORD,
            { expiresIn: "2h" }
          );

          res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
          });

          res.send({
            message: "Admin logged in successfully",
            JWT: token,
          });
        }
      });
    }
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    // Log any unexpected errors and send a 500 error
    console.log(error);
    res.status(500).json({
      message: "Error logging in",
    });
  }
});

adminRouter.post("/signout", adminMiddleware, (req, res) => {
  res.clearCookie("token");
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

adminRouter.put("/course-update", adminMiddleware, async function (req, res) {
  try {
    // Validate request body
    const { title, description, imageUrl, price, courseId } =
      courseSchema.parse(req.body);
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

adminRouter.delete(
  "/course-delete",
  adminMiddleware,
  async function (req, res) {
    const { courseId } = req.body; // Destructuring courseId from req.body
    const adminId = req.userId; // Assuming this comes from adminMiddleware

    try {
      // Check if the course exists
      const courseDetails = await courseModel.findById(courseId);
      if (!courseDetails) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Check if the admin has permission to delete the course
      if (adminId === courseDetails.creatorId.toString()) {
        // If everything is fine, delete the course
        await courseModel.findByIdAndDelete(courseId);

        // Return success response
        res.status(200).json({ message: "Course deleted successfully" });
      } else {
        // If the admin is not authorized to delete the course
        return res
          .status(403)
          .json({ message: "You are not authorized to delete this course" });
      }
    } catch (error) {
      // Handle any errors that occur during the process
      console.error("Error deleting course:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

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

export { adminRouter };
