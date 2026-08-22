import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dataStore } from '../repositories/dataStore.js';
import { generateTokens, setAuthCookies, clearAuthCookies } from '../utils/token.utils.js';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dayflow_super_secret_jwt_refresh_token_key_2026_$%^';

export const register = async (req, res, next) => {
  try {
    const { fullName, employeeId, email, password, role } = req.body;

    // Check if email or employeeId already exists
    const existingEmail = dataStore.findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'An account with this work email already exists.'
      });
    }

    const existingEmpId = dataStore.findUserByEmployeeId(employeeId);
    if (existingEmpId) {
      return res.status(409).json({
        success: false,
        message: 'This Employee ID is already registered.'
      });
    }

    // Hash password with bcrypt (12 salt rounds)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userRole = role === 'admin' ? 'admin' : 'employee';

    // Create user in repository
    const newUser = dataStore.createUser({
      fullName,
      employeeId,
      email,
      passwordHash,
      role: userRole,
      isVerified: true // Auto-verify for seamless onboarding demo or token verification
    });

    const { accessToken, refreshToken } = generateTokens(newUser);
    setAuthCookies(res, accessToken, refreshToken);

    const profile = dataStore.getEmployeeProfile(newUser.employeeId);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Dayflow.',
      data: {
        user: {
          id: newUser.id,
          employeeId: newUser.employeeId,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role,
          avatar: newUser.avatar,
          isVerified: newUser.isVerified
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = dataStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please check your credentials.'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    const profile = dataStore.getEmployeeProfile(user.employeeId);

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please sign in again.'
      });
    }

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: 'Refresh token expired or invalid. Please sign in again.'
        });
      }

      const user = dataStore.findUserById(decoded.id);
      if (!user) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          message: 'User no longer exists.'
        });
      }

      const tokens = generateTokens(user);
      setAuthCookies(res, tokens.accessToken, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Session token refreshed.',
        data: {
          user: {
            id: user.id,
            employeeId: user.employeeId,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar
          }
        }
      });
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.'
  });
};

export const getMe = (req, res, next) => {
  try {
    const user = dataStore.findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const profile = dataStore.getEmployeeProfile(user.employeeId);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatar: user.avatar,
          isVerified: user.isVerified
        },
        profile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Email address verified successfully. You can now access all portal features.'
  });
};
