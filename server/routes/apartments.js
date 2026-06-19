const express = require('express')
const pool    = require('../config/db')
const { requireAuth }   = require('../middleware/auth')
const { validateReview, validateComment } = require('../middleware/validate')

const router = express.Router()

// ── GET /api/apartments ───────────────────────────────────────
// Dashboard: all apartments with avg rating + review count
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        a.apartment_id,
        a.slug,
        a.name,
        a.address,
        a.neighbourhood,
        a.landlord,
        a.units,
        a.year_built,
        a.description,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
        COUNT(r.review_id)                   AS review_count
      FROM apartments a
      LEFT JOIN reviews r ON a.apartment_id = r.apartment_id
      GROUP BY a.apartment_id
      ORDER BY avg_rating DESC
    `)
    return res.json({ apartments: rows })
  } catch (err) {
    console.error('GET /apartments error:', err)
    return res.status(500).json({ message: 'Failed to fetch apartments.' })
  }
})

// ── GET /api/apartments/:slug ─────────────────────────────────
// Single apartment: info + reviews + comments + rating breakdown
router.get('/:slug', async (req, res) => {
  try {
    // Apartment info
    const [aptRows] = await pool.query(
      `SELECT
        a.*,
        ROUND(COALESCE(AVG(r.rating), 0), 1) AS avg_rating,
        COUNT(DISTINCT r.review_id)          AS review_count
       FROM apartments a
       LEFT JOIN reviews r ON a.apartment_id = r.apartment_id
       WHERE a.slug = ?
       GROUP BY a.apartment_id`,
      [req.params.slug]
    )

    if (aptRows.length === 0)
      return res.status(404).json({ message: 'Apartment not found.' })

    const apartment = aptRows[0]

    // Reviews with author name
    const [reviews] = await pool.query(
      `SELECT
        r.review_id,
        r.rating,
        r.body,
        r.image_url,
        r.created_at,
        r.updated_at,
        u.user_id,
        u.name AS author
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.apartment_id = ?
       ORDER BY r.created_at DESC`,
      [apartment.apartment_id]
    )

    // Comments for all reviews in one query, then group in JS
    const reviewIds = reviews.map(r => r.review_id)
    let commentsByReview = {}

    if (reviewIds.length > 0) {
      const [comments] = await pool.query(
        `SELECT
          c.comment_id,
          c.review_id,
          c.body,
          c.created_at,
          u.user_id,
          u.name AS author
         FROM comments c
         JOIN users u ON c.user_id = u.user_id
         WHERE c.review_id IN (?)
         ORDER BY c.created_at ASC`,
        [reviewIds]
      )
      comments.forEach(c => {
        if (!commentsByReview[c.review_id]) commentsByReview[c.review_id] = []
        commentsByReview[c.review_id].push(c)
      })
    }

    // Rating breakdown (1–5)
    const [breakdown] = await pool.query(
      `SELECT rating, COUNT(*) AS count
       FROM reviews
       WHERE apartment_id = ?
       GROUP BY rating`,
      [apartment.apartment_id]
    )
    const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    breakdown.forEach(b => { ratingBreakdown[b.rating] = parseInt(b.count) })

    const reviewsWithComments = reviews.map(r => ({
      ...r,
      comments: commentsByReview[r.review_id] || [],
    }))

    return res.json({ apartment, reviews: reviewsWithComments, ratingBreakdown })
  } catch (err) {
    console.error('GET /apartments/:slug error:', err)
    return res.status(500).json({ message: 'Failed to fetch apartment.' })
  }
})

// ── POST /api/apartments/:slug/reviews  (protected) ──────────
router.post('/:slug/reviews', requireAuth, validateReview, async (req, res) => {
  const { rating, body, image_url } = req.body

  try {
    const [aptRows] = await pool.query(
      'SELECT apartment_id FROM apartments WHERE slug = ?',
      [req.params.slug]
    )
    if (aptRows.length === 0)
      return res.status(404).json({ message: 'Apartment not found.' })

    const apartmentId = aptRows[0].apartment_id

    // One review per user per apartment
    const [existing] = await pool.query(
      'SELECT review_id FROM reviews WHERE apartment_id = ? AND user_id = ?',
      [apartmentId, req.user.user_id]
    )
    if (existing.length > 0)
      return res.status(409).json({ message: 'You have already reviewed this apartment.' })

    const [result] = await pool.query(
      'INSERT INTO reviews (apartment_id, user_id, rating, body, image_url) VALUES (?, ?, ?, ?, ?)',
      [apartmentId, req.user.user_id, parseInt(rating), body.trim(), image_url || null]
    )

    const [newReview] = await pool.query(
      `SELECT r.*, u.name AS author
       FROM reviews r JOIN users u ON r.user_id = u.user_id
       WHERE r.review_id = ?`,
      [result.insertId]
    )

    return res.status(201).json({ review: { ...newReview[0], comments: [] } })
  } catch (err) {
    console.error('POST /reviews error:', err)
    return res.status(500).json({ message: 'Failed to submit review.' })
  }
})

// ── PUT /api/apartments/:slug/reviews/:reviewId  (protected) ──
router.put('/:slug/reviews/:reviewId', requireAuth, validateReview, async (req, res) => {
  const { rating, body, image_url } = req.body
  const reviewId = parseInt(req.params.reviewId)

  try {
    const [rows] = await pool.query(
      'SELECT review_id, user_id FROM reviews WHERE review_id = ?',
      [reviewId]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'Review not found.' })

    if (rows[0].user_id !== req.user.user_id)
      return res.status(403).json({ message: 'You can only edit your own reviews.' })

    await pool.query(
      'UPDATE reviews SET rating = ?, body = ?, image_url = ? WHERE review_id = ?',
      [parseInt(rating), body.trim(), image_url || null, reviewId]
    )

    const [updated] = await pool.query(
      `SELECT r.*, u.name AS author
       FROM reviews r JOIN users u ON r.user_id = u.user_id
       WHERE r.review_id = ?`,
      [reviewId]
    )

    return res.json({ review: updated[0] })
  } catch (err) {
    console.error('PUT /reviews error:', err)
    return res.status(500).json({ message: 'Failed to update review.' })
  }
})

// ── DELETE /api/apartments/:slug/reviews/:reviewId  (protected)
router.delete('/:slug/reviews/:reviewId', requireAuth, async (req, res) => {
  const reviewId = parseInt(req.params.reviewId)

  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM reviews WHERE review_id = ?',
      [reviewId]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'Review not found.' })

    if (rows[0].user_id !== req.user.user_id)
      return res.status(403).json({ message: 'You can only delete your own reviews.' })

    await pool.query('DELETE FROM reviews WHERE review_id = ?', [reviewId])
    return res.json({ message: 'Review deleted.' })
  } catch (err) {
    console.error('DELETE /reviews error:', err)
    return res.status(500).json({ message: 'Failed to delete review.' })
  }
})

// ── POST /api/apartments/:slug/reviews/:reviewId/comments  (protected)
router.post('/:slug/reviews/:reviewId/comments', requireAuth, validateComment, async (req, res) => {
  const reviewId = parseInt(req.params.reviewId)
  const { body } = req.body

  try {
    const [reviewRows] = await pool.query(
      'SELECT review_id FROM reviews WHERE review_id = ?',
      [reviewId]
    )
    if (reviewRows.length === 0)
      return res.status(404).json({ message: 'Review not found.' })

    const [result] = await pool.query(
      'INSERT INTO comments (review_id, user_id, body) VALUES (?, ?, ?)',
      [reviewId, req.user.user_id, body.trim()]
    )

    const [newComment] = await pool.query(
      `SELECT c.*, u.name AS author
       FROM comments c JOIN users u ON c.user_id = u.user_id
       WHERE c.comment_id = ?`,
      [result.insertId]
    )

    return res.status(201).json({ comment: newComment[0] })
  } catch (err) {
    console.error('POST /comments error:', err)
    return res.status(500).json({ message: 'Failed to post comment.' })
  }
})

// ── DELETE /api/apartments/:slug/reviews/:reviewId/comments/:commentId
router.delete('/:slug/reviews/:reviewId/comments/:commentId', requireAuth, async (req, res) => {
  const commentId = parseInt(req.params.commentId)

  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM comments WHERE comment_id = ?',
      [commentId]
    )
    if (rows.length === 0)
      return res.status(404).json({ message: 'Comment not found.' })

    if (rows[0].user_id !== req.user.user_id)
      return res.status(403).json({ message: 'You can only delete your own comments.' })

    await pool.query('DELETE FROM comments WHERE comment_id = ?', [commentId])
    return res.json({ message: 'Comment deleted.' })
  } catch (err) {
    console.error('DELETE /comments error:', err)
    return res.status(500).json({ message: 'Failed to delete comment.' })
  }
})

module.exports = router