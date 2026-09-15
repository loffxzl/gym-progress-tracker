import { authService } from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiResponse.js';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);

  res.cookie('token', token, COOKIE_OPTIONS);

  return res
    .status(201)
    .json(new ApiResponse(201, { user }, 'User registered successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);

  res.cookie('token', token, COOKIE_OPTIONS);

  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'User logged in successfully'));
});

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', CLEAR_COOKIE_OPTIONS);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'User logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Current user profile fetched successfully'));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, 'User profile updated successfully'));
});
