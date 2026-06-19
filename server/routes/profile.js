const express = require('express')
const pool    = require('../config/db')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/profile  (protected) ────────────────────────────
// Returns the logged-in user's profile + all their reviews
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
        r.review_id,
        r.rating,
        r.body,
        r.image_url,
        r.created_at,
        r.updated_at,
        a.name       AS apartment_name,
        a.slug       AS apartment_slug,
        a.address    AS apartment_address,
        (SELECT COUNT(*) FROM comments c WHERE c.review_id = r.review_id) AS comment_count
       FROM reviews r
       JOIN apartments a ON r.apartment_id = a.apartment_id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [req.user.user_id]
    )

    const [commentCount] = await pool.query(
      'SELECT COUNT(*) AS total FROM comments WHERE user_id = ?',
      [req.user.user_id]
    )

    return res.json({
      user: userRows[0],
      reviews,
      stats: {
        review_count:  reviews.length,
        comment_count: parseInt(commentCount[0].total),
      },
    })
  } catch (err) {
    console.error('GET /profile error:', err)
    return res.status(500).json({ message: 'Failed to load profile.' })
  }
})

module.exports = router