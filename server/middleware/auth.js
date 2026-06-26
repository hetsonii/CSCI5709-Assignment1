const jwt = require('jsonwebtoken')

/**
 * requireAuth middleware
 *
 * Primary:  reads the JWT from the httpOnly cookie `tt_token`
 * Fallback: reads a Bearer token from the Authorization header
 *           (so Postman / automated tests keep working)
 *
 * Attaches decoded payload to req.user:
 *   { user_id, name, email, iat, exp }
 */
function requireAuth(req, res, next) {
  // 1. Try cookie first
  let token = req.cookies?.tt_token

  // 2. Fall back to Authorization header (Postman / tests)
  if (!token) {
    const header = req.headers.authorization
    if (header && header.startsWith('Bearer ')) {
      token = header.split(' ')[1]
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated.' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.' })
    }
    return res.status(401).json({ message: 'Invalid token.' })
  }
}

module.exports = { requireAuth }