/**
 * The provided JavaScript function is an authorization middleware that checks for a valid JWT token in
 * the request, verifies it, and allows access to the route if the token is valid and not blacklisted.
 * @param req - The `req` parameter in the `authorization` function stands for the request object. It
 * contains information about the HTTP request that is being made, such as the headers, body,
 * parameters, cookies, etc. In this context, the function is checking for a JWT token in the request
 * cookies or headers
 * @param res - The `res` parameter in the `authorization` function is an object representing the HTTP
 * response that an Express app sends when it gets an HTTP request. It is used to send a response back
 * to the client making the request. In the provided code snippet, `res` is used to send JSON responses
 * @param next - The `next` parameter in the `authorization` function is a callback function that is
 * used to pass control to the next middleware function in the stack. When called, it will execute the
 * next middleware function. In this context, `next()` is called after the authorization logic is
 * successfully completed to proceed to
 * @returns The `authorization` middleware function is being returned. This function is responsible for
 * checking the authorization token in the request, verifying it using JWT, and setting the decoded
 * user information in the request object before passing the control to the next middleware function.
 * If any errors occur during this process, an appropriate error response is sent back to the client.
 */
import jwt from "jsonwebtoken";
import redisClient from "../Services/redis.service.js";

export const authorization = async (req, res, next) => {
  try {
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
    if (!token) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const isBlacklisted = await redisClient.get(token);
    if (isBlacklisted) {
      res.clearCookie("token"); 
      return res.status(401).json({ message: "Unauthorized User" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized User" });
    }

    req.user = decoded; 
    next();
  } catch (error) {
    return res.status(400).send({ message: error.message });
  }
};
