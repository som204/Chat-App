/**
 * The above functions are related to managing projects and users in a system, including creating
 * projects, adding users to projects, getting project details, and deleting users from projects.
 * @param projectId - The `projectId` parameter refers to the unique identifier of a project. It is
 * used to identify a specific project in the system.
 * @param name - The code you provided is a set of functions related to managing projects and users in
 * a MongoDB database using Mongoose. Here's a brief overview of each function:
 * @param userId - The `userId` parameter refers to the unique identifier of a user in the system. It
 * is used to identify and perform operations related to a specific user, such as creating projects,
 * getting projects associated with the user, adding users to a project, getting project details, and
 * deleting users from a project.
 * @returns The code provided contains functions for creating projects, getting all projects for a
 * specific user, adding users to a project, getting project details including users, and deleting a
 * user from a project. Each function performs specific tasks related to project and user management
 * using Mongoose and MongoDB.
 */
import mongoose from "mongoose";
import projectModel from "../Models/project.model.js";
import userModel from "../Models/user.model.js";

export const createProject = async (projectId, name, userId) => {
  if (!projectId) {
    throw new Error("Project Id required");
  }
  if (!name) {
    throw new Error("Project Name required");
  }
  if (!userId) {
    throw new Error("User Id required");
  }
  try {
    const project = await projectModel.create({
      project_id: projectId,
      name: name,
      users: [userId],
    });
    return project;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getAllProject = async ({ userId }) => {
  if (!userId) {
    throw new Error("User Id required");
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("User ID is not Valid");
  }
  try {
    const projects = await projectModel.find({ users: userId });
    return projects;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const addUser = async ( user, projectId, userId ) => {
  if (!projectId) throw new Error("Project ID is required");
  if (!user) throw new Error("User array is required");
  if (!userId) throw new Error("User ID is required");
  
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid User ID");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid Project ID");
  }
  if (!Array.isArray(user) || user.some((userId) => !mongoose.Types.ObjectId.isValid(userId))) {
    throw new Error("Invalid User IDs in the array");
  }

  try {
    // Verify the requesting user belongs to the project
    const project = await projectModel.findOne({
      _id: projectId,
      users: userId, // Ensure the requesting user is part of the project
    });

    if (!project) {
      throw new Error("Requesting user does not belong to the project");
    }

    // Check if any user is already a collaborator
    const alreadyCollaborators = user.filter((userId) => project.users.includes(userId));
    if (alreadyCollaborators.length > 0) {
      throw new Error(`Users already collaborators: ${alreadyCollaborators.join(", ")}`);
    }

    // Add users to the project
    const updatedProject = await projectModel.findOneAndUpdate(
      { _id: projectId },
      {
        $addToSet: { users: { $each: user } },
      },
      { new: true }
    );

    return updatedProject;
  } catch (error) {
    throw new Error(error.message);
  }
};



export const getProject = async ({ projectId }) => {
  if (!projectId) {
    throw new Error("Project ID required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is not valid");
  }

  try {
    const project = await projectModel.findOne({ _id: projectId });

    if (!project) {
      throw new Error("Project not found");
    }
    if (!project.users || project.users.length === 0) {
      return [];
    }

    
    const users = await userModel.find(
      { _id: { $in: project.users } },
      { username: 1, _id: 0 }
    ); 
    return users.map((user) => user.username);
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteUser = async({projectId,collaboratorName})=>{
  if (!projectId) {
    throw new Error("Project ID required");
  }
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Project ID is not valid");
  }
  if (!collaboratorName) {
    throw new Error("Username required");
  }
  try {
    const user = await userModel.findOne({ username: collaboratorName });
    if (!user) {
      throw new Error("User not found");
    }

    const updatedProject = await projectModel.findOneAndUpdate(
      { _id: projectId },
      { $pull: { users: user._id } },
      { new: true }
    );

    if (!updatedProject) {
      throw new Error("Project not found or user not part of the project");
    }

    return user._id;
  } catch (error) {
    console.log(error.message)
    throw new Error(error.message);
  }
}

