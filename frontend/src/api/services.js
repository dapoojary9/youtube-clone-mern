import api from "./client.js";

// Thin wrappers around every REST endpoint - keeps components free of URL strings.
export const authApi = {
  register: (body) => api.post("/auth/register", body).then((r) => r.data),
  login: (body) => api.post("/auth/login", body).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data.user),
};

export const videoApi = {
  list: (params) => api.get("/videos", { params }).then((r) => r.data.videos),
  categories: () => api.get("/videos/categories").then((r) => r.data.categories),
  get: (id) => api.get(`/videos/${id}`).then((r) => r.data.video),
  addView: (id) => api.patch(`/videos/${id}/view`).then((r) => r.data.views),
  create: (body) => api.post("/videos", body).then((r) => r.data.video),
  update: (id, body) => api.put(`/videos/${id}`, body).then((r) => r.data.video),
  remove: (id) => api.delete(`/videos/${id}`).then((r) => r.data),
  like: (id) => api.put(`/videos/${id}/like`).then((r) => r.data),
  dislike: (id) => api.put(`/videos/${id}/dislike`).then((r) => r.data),
};

export const commentApi = {
  list: (videoId) => api.get(`/videos/${videoId}/comments`).then((r) => r.data.comments),
  add: (videoId, text) => api.post(`/videos/${videoId}/comments`, { text }).then((r) => r.data.comment),
  update: (id, text) => api.put(`/comments/${id}`, { text }).then((r) => r.data.comment),
  remove: (id) => api.delete(`/comments/${id}`).then((r) => r.data),
};

export const channelApi = {
  create: (body) => api.post("/channels", body).then((r) => r.data.channel),
  get: (id) => api.get(`/channels/${id}`).then((r) => r.data.channel),
  videos: (id) => api.get(`/channels/${id}/videos`).then((r) => r.data.videos),
  update: (id, body) => api.put(`/channels/${id}`, body).then((r) => r.data.channel),
  subscribe: (id) => api.put(`/channels/${id}/subscribe`).then((r) => r.data),
};
