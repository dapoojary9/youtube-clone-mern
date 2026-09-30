import jwt from "jsonwebtoken";

// Signs a JWT containing only the user id (no sensitive data in the payload)
const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

export default generateToken;
