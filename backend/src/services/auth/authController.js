const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query, queryOne } = require('../../db/db');
const { generateToken } = require('../../utils/jwt');
const { success, error } = require('../../utils/response');

async function register(req, res, next) {
  try {
    const { name, email, password, role = 'GUEST', phone } = req.body;

    if (!name || !email || !password) {
      return error(res, 'Name, email, and password are required', 400);
    }

    const validRoles = ['GUEST', 'RECEPTIONIST', 'MANAGER', 'HOUSEKEEPING', 'MAINTENANCE', 'RESTAURANT'];
    if (!validRoles.includes(role)) {
      return error(res, `Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    // Strict Security: Public self-signup is restricted to GUEST role only
    if (role !== 'GUEST') {
      const requester = req.user;
      if (!requester || requester.role !== 'MANAGER') {
        return error(res, 'Public self-registration is strictly restricted to Guest accounts. Staff and administrative accounts must be provisioned by a Hotel Administrator.', 403);
      }
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUser) {
      return error(res, 'A user with this email address already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = `usr_${uuidv4().substring(0, 8)}`;

    await query(
      `INSERT INTO users (id, name, email, password_hash, role, phone) VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), email.toLowerCase().trim(), passwordHash, role, phone || null]
    );

    const newUser = { id: userId, name: name.trim(), email: email.toLowerCase().trim(), role, phone: phone || null };
    const token = generateToken(newUser);

    return success(res, { user: newUser, token }, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return error(res, 'Email and password are required', 400);
    }

    const user = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user) {
      return error(res, 'Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return error(res, 'Invalid credentials', 401);
    }

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone
    };

    const token = generateToken(userPayload);

    return success(res, { user: userPayload, token }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  return success(res, null, 'Logged out successfully');
}

async function getMe(req, res, next) {
  try {
    const user = await queryOne('SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return error(res, 'User not found', 404);
    }
    return success(res, { user }, 'User details fetched successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
