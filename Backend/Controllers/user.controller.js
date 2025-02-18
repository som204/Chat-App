import userModel from "../Models/user.model.js";
import * as userService from "../Services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../Services/redis.service.js";


export const createUserController = async (req, res) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(400).json({ error: error.array() });
  }

  const { email, username } = req.body;

  try {
    const existingEmail = await userModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const existingUsername = await userModel.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already in use" });
    }
    const user = await userService.createUser(req.body);
    const token = await user.generateJWT();
    return res
    .cookie("token", token)
    .status(200)
    .send({user});
    
  } catch (error) {
    return res.status(400).send({ message: error.message || "An error occurred while creating the user." });
  }
};


export const loginController = async (req, res) => {
  const { email, password } = req.body;
  const error = validationResult(req);
  if (!error.isEmpty) {
    return res.status(400).json({ error: error.array() });
  }
  try {
    const user = await userModel.findOne({email});
    if (!user) {
      return res.status(401).json({ message: "Invalid Credential" });
    }

    const isCheck = await user.isValidPassword(password);
    if (!isCheck) {
      return res.status(401).json({ message: "Invalid Credential" });
    }
    delete user._doc.password;
    const token = await user.generateJWT();
    return res.cookie("token",token).status(200).send({user,token});
  } catch (err) {
    res.status(400).send(err.message);
  }
};

export const profileController =async (req,res)=>{
      res.status(200).json({
        user:req.user
      })
};

export const logoutController= async (req,res)=>{
    try {
      const token =req.cookies.token || req.headers.authorization.split(' ')[1];
      redisClient.set(token,'logout','EX',60*60*24);
      res.status(200).json({message:"Logout Successful"});
    } catch (error) {
      console.error(error);
      res.status(400).json({message:error.message});
    }
};


export const getAllUser =async (req,res)=>{
  try {
    const loggedInUser= await userModel.findOne({
      email:req.user.email
    });
    const userId= loggedInUser._id;
    const allUser= await userService.getAllUser({userId});
    res.status(200).json({allUser});
  } catch (error) {
    
  }
}