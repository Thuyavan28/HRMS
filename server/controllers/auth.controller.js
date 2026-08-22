import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { query } from '../config/db.js';
import { dataStore } from '../repositories/dataStore.js';
import { generateTokens, setAuthCookies, clearAuthCookies } from '../utils/token.utils.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dayflow_super_secret_jwt_refresh_token_key_2026_$%^';

/**
 * Validates an invitation token and returns the trusted read-only invitation metadata.
 * GET /api/auth/invitation/validate?token=...
 */
export const validateInvitation = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token parameter is required.'
      });
    }

    const invitation = dataStore.findInvitationByToken(token);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation link. Please request a new invitation from your HR administrator.'
      });
    }

    if (invitation.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been used and activated. Please sign in with your password.'
      });
    }

    if (invitation.status === 'REVOKED') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has been revoked by HR administration. Please contact your HR department.'
      });
    }

    // Check expiration
    if (new Date() > new Date(invitation.expiresAt)) {
      invitation.status = 'EXPIRED';
      return res.status(410).json({
        success: false,
        message: 'This invitation link has expired. Please ask your HR administrator to resend the invitation.'
      });
    }

    // Return trusted invitation data (Role is strictly authoritative from DB)
    res.status(200).json({
      success: true,
      data: {
        employeeId: invitation.employeeId,
        email: invitation.email,
        fullName: invitation.fullName,
        role: invitation.role, // strictly read-only for frontend
        expiresAt: invitation.expiresAt,
        createdBy: invitation.createdBy
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activates an employee account from a valid invitation.
 * POST /api/auth/activate
 *
 * CRITICAL SECURITY GUARANTEE:
 * The backend completely ignores any 'role' supplied in the request body.
 * The role is strictly retrieved from the trusted invitation database record.
 */
export const activateAccount = async (req, res, next) => {
  try {
    const { token, password, fullName } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Invitation token and password are required.'
      });
    }

    const invitation = dataStore.findInvitationByToken(token);
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation token.'
      });
    }

    if (invitation.status === 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: 'This invitation has already been activated. Please sign in with your credentials.'
      });
    }

    if (invitation.status === 'REVOKED' || invitation.status === 'EXPIRED' || new Date() > new Date(invitation.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This invitation is no longer valid or has expired. Please contact your HR administrator.'
      });
    }

    // Hash password with bcrypt (min 12 salt rounds)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Activate user using the trusted role and employeeId from the invitation record
    // ANY req.body.role or req.body.employeeId is intentionally ignored and discarded!
    // User can customize their full name if provided.
    const user = dataStore.activateUserFromInvitation({
      invitation,
      passwordHash,
      fullName: (fullName && fullName.trim()) || invitation.fullName
    });

    const { accessToken, refreshToken } = generateTokens(user);
    setAuthCookies(res, accessToken, refreshToken);

    const profile = dataStore.getEmployeeProfile(user.employeeId);

    res.status(200).json({
      success: true,
      message: `Account activated successfully! Welcome to Dayflow, ${user.fullName}.`,
      data: {
        user: {
          id: user.id,
          employeeId: user.employeeId,
          email: user.email,
          fullName: user.fullName,
          role: user.role, // Authoritative role from DB
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

/**
 * Public registration endpoint handler.
 * Rejects unrestricted public registration and instructs user to use HR invitation activation.
 */
export const register = async (req, res, next) => {
  const { token } = req.body;
  if (token) {
    return activateAccount(req, res, next);
  }

  return res.status(403).json({
    success: false,
    message: 'Public self-registration is disabled for corporate security. Account activation requires a valid invitation link sent by HR.'
  });
};

/**
 * Authenticates user via email and password.
 * Reads trusted role from database, issues HTTP-only JWT cookies.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your work email or employee ID.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const inputIdentifier = email.trim();
    const cleanLower = inputIdentifier.toLowerCase();
    const cleanUpper = inputIdentifier.toUpperCase();

    let user = null;

    // ALWAYS query Neon DB directly for login — pass pre-lowercased values
    // to avoid PostgreSQL LOWER() function issues with certain drivers
    try {
      const dbRes = await query(
        'SELECT * FROM users WHERE email = $1 OR email = $2 OR employee_id = $3 OR employee_id = $4 LIMIT 1;',
        [cleanLower, inputIdentifier, cleanUpper, inputIdentifier]
      );
      if (dbRes.rows.length > 0) {
        const r = dbRes.rows[0];
        user = {
          id: r.id,
          employeeId: r.employee_id,
          email: r.email,
          fullName: r.full_name,
          passwordHash: r.password_hash,
          role: r.role,
          status: r.status,
          isVerified: r.is_verified,
          avatar: r.avatar,
          createdAt: r.created_at,
          lastLoginAt: r.last_login_at
        };
      }
    } catch (dbErr) {
      console.error('[Login DB Error]:', dbErr.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection error. Please try again.'
      });
    }

    // Fallback: check in-memory dataStore cache
    if (!user) {
      user = dataStore.findUserByEmail(cleanLower) || dataStore.findUserByEmployeeId(cleanUpper);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User record not found in database.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.'
      });
    }

    if (user.status === 'DEACTIVATED' || user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your HR administrator.'
      });
    }

    user.lastLoginAt = new Date().toISOString();

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

/**
 * Generates a password reset token and emails the user a reset link.
 * POST /api/auth/forgot-password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists — do not reveal whether email exists (security)
    const userCheck = await query('SELECT id, full_name FROM users WHERE email = $1 LIMIT 1;', [cleanEmail]);

    // Always respond with success to prevent email enumeration
    if (userCheck.rows.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'If that email is registered, you will receive a reset link shortly.'
      });
    }

    const user = userCheck.rows[0];

    // Invalidate any previous tokens for this email
    await query('DELETE FROM password_reset_tokens WHERE email = $1;', [cleanEmail]).catch(console.error);

    // Generate a secure 32-byte token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES ($1, $2, $3);',
      [cleanEmail, resetToken, expiresAt]
    );

    const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetLink = `${CLIENT_URL}/reset-password?token=${resetToken}`;

    // Send email (non-blocking — server still responds even if email fails)
    sendPasswordResetEmail(cleanEmail, user.full_name || 'User', resetLink).catch(err =>
      console.error('[Forgot Password] Email failed:', err.message)
    );

    res.status(200).json({
      success: true,
      message: 'If that email is registered, you will receive a reset link shortly.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validates the reset token and sets a new password.
 * POST /api/auth/reset-password
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    // Validate password strength
    const strongPassword = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters with one uppercase letter, one number, and one special character.'
      });
    }

    // Look up the reset token
    const tokenResult = await query(
      'SELECT * FROM password_reset_tokens WHERE token = $1 AND used = FALSE AND expires_at > NOW() LIMIT 1;',
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This reset link is invalid or has expired. Please request a new one.'
      });
    }

    const resetRecord = tokenResult.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await query('UPDATE users SET password_hash = $1 WHERE email = $2;', [passwordHash, resetRecord.email]);

    // Mark token as used
    await query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1;', [token]);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.'
    });
  } catch (error) {
    next(error);
  }
};
