import mongoose from "mongoose";

export const notFound = (req, _res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.statusCode = 404;
  next(err);
};

// Central error handler - converts Mongoose/JWT errors into clean JSON responses
// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || "Server error";
  let errors = err.errors && !(err instanceof mongoose.Error) ? err.errors : undefined;

  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
    message = "Validation failed";
  } else if (err instanceof mongoose.Error.CastError) {
    status = 404;
    message = "Resource not found";
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `That ${field} is already taken`;
    errors = { [field]: message };
  }

  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message, ...(errors && { errors }) });
};
