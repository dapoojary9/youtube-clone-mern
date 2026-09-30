// Client-side validation - mirrors the backend rules for instant feedback.
export const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const URL_RE = /^https?:\/\/[^\s]+$/i;

export const validateRegister = ({ username, email, password, confirmPassword }) => {
  const e = {};
  if (!username.trim()) e.username = "Enter a username";
  else if (!USERNAME_RE.test(username.trim()))
    e.username = "Use 3-20 characters: letters, numbers or underscores";
  if (!email.trim()) e.email = "Enter an email";
  else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
  if (!password) e.password = "Enter a password";
  else if (!PASSWORD_RE.test(password))
    e.password = "Use 8 or more characters with at least one letter and one number";
  if (password && confirmPassword !== password) e.confirmPassword = "Those passwords didn't match. Try again.";
  return e;
};

export const validateLogin = ({ email, password }) => {
  const e = {};
  if (!email.trim()) e.email = "Enter an email";
  else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address";
  if (!password) e.password = "Enter a password";
  return e;
};

export const validateChannel = ({ channelName, description, channelBanner, channelAvatar }) => {
  const e = {};
  if (!channelName.trim()) e.channelName = "Channel name is required";
  else if (channelName.trim().length < 3 || channelName.trim().length > 50)
    e.channelName = "Channel name must be 3-50 characters";
  if (description.length > 1000) e.description = "Description can be at most 1000 characters";
  if (channelBanner && !URL_RE.test(channelBanner)) e.channelBanner = "Enter a valid image URL";
  if (channelAvatar && !URL_RE.test(channelAvatar)) e.channelAvatar = "Enter a valid image URL";
  return e;
};

export const validateVideo = ({ title, description, videoUrl, thumbnailUrl, category }, isYouTube) => {
  const e = {};
  if (!title.trim()) e.title = "Title is required";
  else if (title.length > 100) e.title = "Title can be at most 100 characters";
  if (description.length > 5000) e.description = "Description can be at most 5000 characters";
  if (!videoUrl.trim()) e.videoUrl = "Video URL is required";
  else if (!URL_RE.test(videoUrl.trim())) e.videoUrl = "Enter a valid URL (mp4/webm file or YouTube link)";
  if (thumbnailUrl && !URL_RE.test(thumbnailUrl.trim())) e.thumbnailUrl = "Enter a valid image URL";
  if (!thumbnailUrl && !isYouTube) e.thumbnailUrl = "Thumbnail is required for non-YouTube videos";
  if (!category) e.category = "Choose a category";
  return e;
};
