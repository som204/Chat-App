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
