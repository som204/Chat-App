import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: false,
    trim: true,
  },
  college: {
    type: String,
    required: false,
    trim: true,
  },
  organisation: {
    type: String,
    required: false,
    trim: true,
  },
  bio: {
    type: String,
    required: false,
    trim: true,
  },
  githubtoken: {
    type: String,
    required: false,
  },
  githublinkstatus: {
    type: Boolean,
    required: false,
    default: false,
  },
});

userSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.generateJWT = function () {
  return jwt.sign(
    {
      email: this.email,
      username: this.username,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "24h",
    }
  );
};

const User = model("user", userSchema);

export default User;
