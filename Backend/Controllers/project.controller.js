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
    console.log(user, projectId);
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
