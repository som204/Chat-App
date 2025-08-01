/* This JavaScript code is setting up routes for a user authentication system using Express.js. Here is
a breakdown of what each part does: */
import * as userController from "../Controllers/user.controller.js";
import { Router } from "express";
import { body } from "express-validator";
import { authorization } from "../Middleware/auth.middleware.js";

const router = Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Email Must Be Valid"),
  body("username")
    .isLength({ min: 5 })
    .withMessage("Username Must be at least 5"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password Must be at least 8"),
  userController.createUserController
);

router.post('/login',
  body("email").isEmail().withMessage("Email Must Be Valid"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password Must be at least 8"),
    userController.loginController
)

router.get('/profile',authorization,userController.profileController);

router.patch(
  '/updateProfile',
  authorization,
  body("username").optional().isLength({ min: 5 }).withMessage("Username Must be at least 5"),
  body("email").optional().isEmail().withMessage("Email Must Be Valid"),
  userController.updateProfileController
);

router.get('/logout',authorization,userController.logoutController);

router.get('/all',authorization,userController.getAllUser);

export default router;
