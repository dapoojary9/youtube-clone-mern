import CATEGORIES from "../config/categories.js";

// Shared validation rules (mirrored on the frontend for instant feedback)
export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// At least 8 chars, one letter, one number
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

export const isValidUrl = (value) => URL_RE.test(String(value || "").trim());

export const validateRegister = ({ username, email, password }) => {
  const errors = {};
  if (!username || !USERNAME_RE.test(username.trim()))
    errors.username = "Username must be 3-20 characters: letters, numbers or underscores only";
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  if (!password || !PASSWORD_RE.test(password))
    errors.password = "Password must be at least 8 characters and include a letter and a number";
  return errors;
};

export const validateLogin = ({ email, password }) => {
  const errors = {};
  if (!email || !EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  return errors;
};

export const validateChannel = ({ channelName, description, channelBanner, channelAvatar }) => {
  const errors = {};
  if (!channelName || channelName.trim().length < 3 || channelName.trim().length > 50)
    errors.channelName = "Channel name must be 3-50 characters";
  if (description && description.length > 1000)
    errors.description = "Description can be at most 1000 characters";
  if (channelBanner && !isValidUrl(channelBanner)) errors.channelBanner = "Banner must be a valid URL";
  if (channelAvatar && !isValidUrl(channelAvatar)) errors.channelAvatar = "Avatar must be a valid URL";
  return errors;
};

// partial=true is used for updates where only some fields are sent
export const validateVideo = (body, partial = false) => {
  const errors = {};
  const { title, description, videoUrl, thumbnailUrl, category } = body;
  if (!partial || title !== undefined) {
    if (!title || !title.trim()) errors.title = "Title is required";
    else if (title.length > 100) errors.title = "Title can be at most 100 characters";
  }
  if (description && description.length > 5000)
    errors.description = "Description can be at most 5000 characters";
  if (!partial || videoUrl !== undefined) {
    if (!isValidUrl(videoUrl)) errors.videoUrl = "Enter a valid video URL (mp4/webm or YouTube link)";
  }
  if (thumbnailUrl && !isValidUrl(thumbnailUrl)) errors.thumbnailUrl = "Thumbnail must be a valid URL";
  if (!partial || category !== undefined) {
    if (!CATEGORIES.includes(category)) errors.category = "Choose a valid category";
  }
  return errors;
};

// Extracts the 11-char YouTube id from any common YouTube URL format
export const getYouTubeId = (url = "") => {
  const match = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
};
