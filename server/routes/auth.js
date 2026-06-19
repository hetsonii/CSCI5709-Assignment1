const express  = require('express')
const bcrypt   = require('bcryptjs')
const jwt      = require('jsonwebtoken')
const pool     = require('../config/db')
const { requireAuth }                    = require('../middleware/auth')
const { validateSignup, validateLogin }  = require('../middleware/validate')

const router = express.Router()

// ── Helper: sign a JWT ────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ── POST /api/auth/signup ─────────────────────────────────────
router.post('/signup', validateSignup, async (req, res) => {
  const { name, email, password } = req.body

  try {
    // Check duplicate email
    const [existing] = await pool.query(
      'SELECT user_id FROM users WHERE email = ?',
      [email.toLowerCase()]
    )
    if (existing.length > 0)
      return res.status(409).json({ message: 'An account with that email already exists.' })

    const hashed = await bcrypt.hash(password, 12)

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), email.toLowerCase(), hashed]
    )

    const user = { user_id: result.insertId, name: name.trim(), email: email.toLowerCase() }
    const token = signToken(user)

    return res.status(201).json({ token, user })
  } catch (err) {
    console.error('signup error:', err)
    return res.status(500).json({ message: 'Server error during signup.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body

  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, password FROM users WHERE email = ?',
      [email.toLowerCase()]
    )

    if (rows.length === 0)
      return res.status(401).json({ message: 'Invalid email or password.' })

    const user = rows[0]
    const match = await bcrypt.compare(password, user.password)

    if (!match)
      return res.status(401).json({ message: 'Invalid email or password.' })

    const token = signToken(user)
    const { password: _omit, ...safeUser } = user

    return res.json({ token, user: safeUser })
  } catch (err) {
    console.error('login error:', err)
    return res.status(500).json({ message: 'Server error during login.' })
  }
})

// ── GET /api/auth/me  (protected) ────────────────────────────
router.get('/me', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, name, email, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found.' })

    return res.json({ user: rows[0] })
  } catch (err) {
    console.error('me error:', err)
    return res.status(500).json({ message: 'Server error.' })
  }
})

module.exports = router