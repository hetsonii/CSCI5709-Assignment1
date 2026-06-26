const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../config/db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/profile  ─────────────────────────────────────────
// Returns logged-in user's info + their reviews with aliased fields
router.get('/', requireAuth, async (req, res) => {
  try {
    const [userRows] = await pool.query(
      'SELECT user_id, name, email, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    if (userRows.length === 0)
      return res.status(404).json({ message: 'User not found.' })

    const [reviews] = await pool.query(
      `SELECT
        r.review_id        AS id,
        r.rating,
        r.body             AS text,
        r.image_url        AS imageUrl,
        r.created_at       AS createdAt,
        r.updated_at       AS updatedAt,
        a.name             AS apartmentName,
        a.slug             AS apartmentSlug,
        a.address          AS apartmentAddress,
        (SELECT COUNT(*) FROM comments c WHERE c.review_id = r.review_id) AS commentCount
       FROM reviews r
       JOIN apartments a ON r.apartment_id = a.apartment_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.user_id]
    )

    const [commentResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM comments WHERE user_id = ?',
      [req.user.user_id]
    )

    const u = userRows[0]
    return res.json({
      user: {
        id: u.user_id,
        name: u.name,
        email: u.email,
        createdAt: u.created_at,
      },
      reviews,
      stats: {
        reviewCount: reviews.length,
        commentCount: parseInt(commentResult[0].total),
      },
    })
  } catch (err) {
    console.error('GET /profile error:', err)
    return res.status(500).json({ message: 'Failed to load profile.' })
  }
})

// ── PUT /api/profile  ─────────────────────────────────────────
// Edit display name and/or password — ownership implicit (own token)
router.put('/', requireAuth, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body

  if (!name && !newPassword)
    return res.status(400).json({ message: 'Provide at least a name or new password to update.' })

  if (name && name.trim().length < 2)
    return res.status(400).json({ message: 'Name must be at least 2 characters.' })

  try {
    const [rows] = await pool.query(
      'SELECT user_id, password FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found.' })

    const updates = []
    const params = []

    if (name) {
      updates.push('name = ?')
      params.push(name.trim())
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required to set a new one.' })

      const match = await bcrypt.compare(currentPassword, rows[0].password)
      if (!match)
        return res.status(401).json({ message: 'Current password is incorrect.' })

      if (newPassword.length < 8)
        return res.status(400).json({ message: 'New password must be at least 8 characters.' })

      const hashed = await bcrypt.hash(newPassword, 12)
      updates.push('password = ?')
      params.push(hashed)
    }

    params.push(req.user.user_id)
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE user_id = ?`, params)

    const [updated] = await pool.query(
      'SELECT user_id, name, email, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    const u = updated[0]
    return res.json({
      user: { id: u.user_id, name: u.name, email: u.email, createdAt: u.created_at },
    })
  } catch (err) {
    console.error('PUT /profile error:', err)
    return res.status(500).json({ message: 'Failed to update profile.' })
  }
})

// ── DELETE /api/profile  ─────────────────────────────────────
// Delete own account — cascades to reviews and comments via FK
router.delete('/', requireAuth, async (req, res) => {
  const { password } = req.body

  if (!password)
    return res.status(400).json({ message: 'Password is required to delete your account.' })

  try {
    const [rows] = await pool.query(
      'SELECT password FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'User not found.' })

    const match = await bcrypt.compare(password, rows[0].password)
    if (!match)
      return res.status(401).json({ message: 'Incorrect password.' })

    await pool.query('DELETE FROM users WHERE user_id = ?', [req.user.user_id])

    // Clear the auth cookie
    res.clearCookie('tt_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })

    return res.json({ message: 'Account deleted.' })
  } catch (err) {
    console.error('DELETE /profile error:', err)
    return res.status(500).json({ message: 'Failed to delete account.' })
  }
})

module.exports = router