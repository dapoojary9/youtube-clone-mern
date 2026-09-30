import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import generateToken from "../utils/token.js";
import { validateLogin, validateRegister } from "../utils/validators.js";

/**
 * POST /api/auth/register
 * Creates an account. The client redirects to /login afterwards,
 * so no token is issued here.
 */
export const register = asyncHandler(async (req, res) => {
  const { username = "", email = "", password = "", avatar = "" } = req.body;
  const errors = validateRegister({ username, email, password });
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const [nameTaken, emailTaken] = await Promise.all([
    User.exists({ username: new RegExp(`^${username.trim()}$`, "i") }),
    User.exists({ email: email.trim().toLowerCase() }),
  ]);
  const conflict = {};
  if (nameTaken) conflict.username = "This username is already taken";
  if (emailTaken) conflict.email = "An account with this email already exists";
  if (Object.keys(conflict).length) throw new ApiError(409, "Account already exists", conflict);

  const user = await User.create({
    username: username.trim(),
    email: email.trim(),
    password,
    avatar,
  });

  res.status(201).json({
    success: true,
    message: "Account created successfully. Please sign in.",
    user,
  });
});

/**
 * POST /api/auth/login
 * Verifies credentials and returns a signed JWT + the user profile.
 */
export const login = asyncHandler(async (req, res) => {
  const { email = "", password = "" } = req.body;
  const errors = validateLogin({ email, password });
  if (Object.keys(errors).length) throw new ApiError(400, "Validation failed", errors);

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, "Invalid email or password", {
      password: "Wrong email or password. Try again.",
    });
  }

  await user.populate("channels", "channelName handle channelAvatar");
  res.json({ success: true, token: generateToken(user._id), user });
});

/**
 * GET /api/auth/me  (protected)
 * Returns the currently authenticated user - used to restore sessions.
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "channels",
    "channelName handle channelAvatar"
  );
  res.json({ success: true, user });
});
