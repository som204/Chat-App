/**
 * The above code defines functions to create a user with validation and hashing of password, and to
 * retrieve all users except the one with a specific userId.
 * @param [user] - The `user` parameter in the `createUser` function is an object that should have
 * properties for `email`, `username`, and `password`.
 * @returns The `createUser` function returns the newly created user object if successful, and the
 * `getAllUser` function returns an array of all users except the one specified by the `userId`
 * parameter.
 */
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

export const updateUserProfile = async ({userId,fullname, college, organisation, bio, githubtoken }) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const updateFields = {};
    if (fullname !== undefined) updateFields.fullname = fullname;
    if (college !== undefined) updateFields.college = college;
    if (organisation !== undefined) updateFields.organisation = organisation;
    if (bio !== undefined) updateFields.bio = bio;
    if (githubtoken !== undefined) updateFields.githubtoken = githubtoken;

    const result = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error(error.message || "An error occurred while updating the user profile.");
  }
};