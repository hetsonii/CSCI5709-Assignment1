/**
 * Lightweight validation helpers used as Express middleware.
 * Each returns 400 with an errors object if validation fails,
 * otherwise calls next().
 */

function validateSignup(req, res, next) {
  const { name, email, password } = req.body
  const errors = {}

  if (!name || name.trim().length < 2)
    errors.name = 'Name must be at least 2 characters.'

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Please enter a valid email address.'

  if (!password || password.length < 8)
    errors.password = 'Password must be at least 8 characters.'

  if (Object.keys(errors).length)
    return res.status(400).json({ message: 'Validation failed.', errors })

  next()
}

function validateLogin(req, res, next) {
  const { email, password } = req.body
  const errors = {}

  if (!email || email.trim() === '')
    errors.email = 'Email is required.'

  if (!password || password.trim() === '')
    errors.password = 'Password is required.'

  if (Object.keys(errors).length)
    return res.status(400).json({ message: 'Validation failed.', errors })

  next()
}

function validateReview(req, res, next) {
  const { rating, body } = req.body
  const errors = {}

  const r = parseInt(rating)
  if (!r || r < 1 || r > 5)
    errors.rating = 'Rating must be between 1 and 5.'

  if (!body || typeof body !== 'string' || body.trim().length < 10)
    errors.body = 'Review must be at least 10 characters.'

  if (body && body.trim().length > 2000)
    errors.body = 'Review must be at most 2000 characters.'

  if (Object.keys(errors).length)
    return res.status(400).json({ message: 'Validation failed.', errors })

  next()
}

function validateComment(req, res, next) {
  const { body } = req.body

  if (!body || typeof body !== 'string' || body.trim().length < 1)
    return res.status(400).json({ message: 'Comment body is required.' })

  if (body.trim().length > 1000)
    return res.status(400).json({ message: 'Comment must be at most 1000 characters.' })

  next()
}

module.exports = { validateSignup, validateLogin, validateReview, validateComment }