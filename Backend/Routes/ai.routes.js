import { Router } from "express";
import * as aiController from '../Controllers/ai.controller.js'


const routes=Router();

routes.get('/get-ans',aiController.aiGetResult);


export default routes;