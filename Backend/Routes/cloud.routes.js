import { Router } from "express";
import * as cloudController from "../Controllers/cloud.controller.js";
import { authorization } from "../Middleware/auth.middleware.js";
import multer from 'multer';
const upload= multer();
const routes=Router();


routes.put('/put',authorization,upload.single("file"),cloudController.putData);
routes.post('/get',authorization,cloudController.getData);
routes.delete('/delete',authorization,cloudController.deleteData);


export default routes;