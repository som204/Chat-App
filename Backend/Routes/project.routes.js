import { Router } from "express";
import { authorization } from "../Middleware/auth.middleware.js";
import * as projectController from "../Controllers/project.controller.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/create",
  body("name").isString().withMessage("Enter a Valid Project Name"),
  authorization,
  projectController.createProjectController
);

router.get("/all", authorization, projectController.getAllProjectController);

router.put(
  "/add-user",
  body('projectId').isString().withMessage("Project ID must be String"),
  body('user').isString().withMessage("User must be String"),
  authorization,
  projectController.addUserController
);

router.get("/get-project/:projectId",authorization,projectController.getProjectController);

router.delete("/delete-user/:projectId",authorization,projectController.deleteUserController);

export default router;
