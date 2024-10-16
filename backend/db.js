import { Schema as _Schema, Types, model } from "mongoose";

const Schema = _Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },
});

const adminSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },

  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },
});

const courseSchema = new Schema({
  title: {
    type: String,
    required: true,
  },

  description: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  imageUrl: {
    type: String,
  },

  creatorId: {
    type: Schema.Types.ObjectId,
    ref: "admin",
  },
});

const purchaseSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "admin",
  },

  courseId: {
    type: Schema.Types.ObjectId,
    ref: "course",
  },
});

const userModel = model("user", userSchema);
const adminModel = model("admin", adminSchema);
const courseModel = model("course", courseSchema);
const purchaseModel = model("purchase", purchaseSchema);

export { userModel, adminModel, courseModel, purchaseModel };
