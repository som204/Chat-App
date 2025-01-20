import userModel from "../Models/user.model.js";

export const createUser = async (user = {}) => {
  try {
    const { email, username, password } = user;

    if (!email || !password || !username) {
      throw new Error("Email, Username, and Password are required");
    }

    const hashPassword = await userModel.hashPassword(password);

    const newUser = await userModel.create({
      email,
      username,
      password: hashPassword,
    });

    return newUser;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error(error.message || "An error occurred while creating the user.");
  }
};

export const getAllUser = async ({userId})=>{
  try {
    const allUser= await userModel.find({
      _id: {$ne : userId}
    });
    return allUser;
  } catch (error) {
    throw new Error(error.message);
  }
}
