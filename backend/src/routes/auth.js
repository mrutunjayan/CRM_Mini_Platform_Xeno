import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { hasText, isValidEmail } from '../utils/validation.js';

const router = Router();

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {};
  if (!hasText(name) || name.trim().length > 80) {
    return res.status(400).json({ message: 'Name is required and must be 80 characters or fewer.' });
  }
  if (!isValidEmail(email)) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
    return res.status(400).json({ message: 'Password must be between 8 and 72 characters.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (await User.exists({ email: normalizedEmail })) {
    return res.status(409).json({ message: 'An account with this email already exists.' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: await bcrypt.hash(password, 12)
  });

  return res.status(201).json({
    token: createToken(user),
    user: { id: user._id, name: user.name, email: user.email }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!isValidEmail(email) || typeof password !== 'string') {
    return res.status(400).json({ message: 'Enter a valid email and password.' });
  }

  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }

  return res.json({
    token: createToken(user),
    user: { id: user._id, name: user.name, email: user.email }
  });
});

export default router;