/* This code snippet is setting up a route in an Express application. It imports the `Router` class
from the "express" package and an `aiController` module from '../Controllers/ai.controller.js'. It
then creates a new instance of the `Router` class, defines a GET route '/get-ans', and assigns the
`aiGetResult` function from the `aiController` module as the handler for this route. Finally, it
exports the configured routes for use in other parts of the application. */
import { Router } from "express";
import * as aiController from '../Controllers/ai.controller.js'


const routes=Router();

routes.get('/get-ans',aiController.aiGetResult);


export default routes;