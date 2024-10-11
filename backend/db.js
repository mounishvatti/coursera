import { Schema as _Schema, Types, model } from "mongoose";


const Schema = _Schema;
const ObjectId = Types.ObjectId;

const userSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
});

const adminSchema = new Schema({
    email: { type: String, unique: true },
    password: String,
    firstName: String,
    lastName: String,
});

const courseSchema = new Schema({
    title: String,
    description: String,
    price: Number,
    imageUrl: String,
    creatorId: ObjectId
});

const purchaseSchema = new Schema({
    userId: ObjectId,
    courseId: ObjectId
});

const userModel = model("user", userSchema);
const adminModel = model("admin", adminSchema);
const courseModel = model("course", courseSchema);
const purchaseModel = model("purchase", purchaseSchema);

export { userModel, adminModel, courseModel, purchaseModel };