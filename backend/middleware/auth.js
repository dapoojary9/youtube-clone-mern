import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * protect - requires a valid "Authorization: Bearer <token>" header.
 * Attaches the authenticated user document to req.user.
 */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;
  if (!token) throw new ApiError(401, "Not authorized, please sign in");

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Session expired or invalid token, please sign in again");
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, "User for this token no longer exists");
  req.user = user;
  next();
});

/**
 * optionalAuth - same as protect but never fails; used by public routes
 * that can personalise the response (e.g. "did I like this video?").
 */
export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    try {
      const decoded = jwt.verify(header.split(" ")[1], process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } catch {
      /* ignore invalid token on public routes */
    }
  }
  next();
});
