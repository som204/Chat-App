/**
 * The above code defines controllers for creating, getting, adding, and deleting projects and users in
 * a project management application.
 * @param req - `req` is an object representing the HTTP request that comes from the client to the
 * server. It contains information such as the request headers, body, parameters, and more. In the
 * context of your code snippets, `req` is being used to access data sent in the request body
 * (`req.body
 * @param res - The `res` parameter in the code snippets you provided stands for the response object in
 * Express.js. It is used to send a response back to the client making the HTTP request. The response
 * object (`res`) has methods like `res.status()` to set the HTTP status code of the response, `
 * @returns The code provided includes several controller functions for handling project-related
 * operations such as creating a project, getting all projects, adding a user to a project, getting a
 * specific project, and deleting a user from a project. Each controller function interacts with the
 * corresponding service functions from `project.service.js` and handles errors appropriately. The
 * functions return JSON responses with relevant data or error messages.
 */
import ProjectModel from "../Models/project.model.js";
import UserModel from "../Models/user.model.js";
import * as projectService from "../Services/project.service.js";
import { validationResult } from "express-validator";

export const createProjectController = async (req, res) => {
  const error = validationResult(req);
  if (!error) {
    return res.status(400).json({ error: error.array() });
  }

  try {
    const { projectName } = req.body;
    const loggedInUser = req.user.email;
    const projectId = Date.now();
    const user = await UserModel.findOne({ email: loggedInUser });
    const userId = user._id;
    const newProject = await projectService.createProject(
      projectId,
      projectName,
      userId
    );
    res.status(200).json({ newProject });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllProjectController = async (req, res) => {
  const error = validationResult(req);
  if (!error) {
    return res.status(400).json({ error: error.array() });
  }
  try {
    const loggedInUser = req.user.email;
    const user = await UserModel.findOne({ email: loggedInUser });
    const userId = user._id;
    const allProjects = await projectService.getAllProject({ userId });
    res.status(200).json({ allProjects });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addUserController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { user, projectId } = req.body;
    const loggedInUserEmail = req.user.email;
    const loggedInUser = await UserModel.findOne({ email: loggedInUserEmail });
    const userId = loggedInUser._id;
    const userToBeAdded = await UserModel.findOne({ username: user });
    const addedUsersIds = [];
    addedUsersIds.push((userToBeAdded._id).toString());
    const updatedProject = await projectService.addUser( addedUsersIds, projectId, userId );
    res.status(200).json({project: updatedProject });
  } catch (error) {
    console.log("Error adding user to project:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getProjectController = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project= await projectService.getProject({projectId});
    res.status(200).json({ project });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUserController =async(req,res)=>{
  const {projectId}=req.params;
  const {collaboratorName}=req.body;
  try {
    const updatedProject= await projectService.deleteUser({projectId,collaboratorName});
    res.status(200).json({updatedProject});
  } catch (error) {
    res.status(400).json({message:error.message});
  }
}
