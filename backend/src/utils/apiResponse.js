/**
 * Standardized success JSON response class.
 * Guarantees all API successful responses share an identical JSON payload schema.
 */
export class ApiResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export const apiResponse = {
  success: (res, message = 'Success', data = null) =>
    res.status(200).json(new ApiResponse(200, data, message)),
  created: (res, message = 'Created successfully', data = null) =>
    res.status(201).json(new ApiResponse(201, data, message)),
};

