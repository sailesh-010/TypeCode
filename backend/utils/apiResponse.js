/**
 * Standard API Response Helper
 */

class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const sendSuccess = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json(new ApiResponse(statusCode, data, message));
};

const sendError = (res, statusCode, message = 'Error', data = null) => {
  res.status(statusCode).json({
    statusCode,
    data,
    message,
    success: false
  });
};

module.exports = {
  ApiResponse,
  sendSuccess,
  sendError
};
