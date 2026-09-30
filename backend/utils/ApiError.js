// Error carrying an HTTP status code (and optional field errors for forms)
export default class ApiError extends Error {
  constructor(statusCode, message, errors = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
