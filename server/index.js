require('dotenv').config()

const express    = require('express')
const cors       = require('cors')

// ── Import routes ─────────────────────────────────────────────
const authRoutes       = require('./routes/auth')
const apartmentRoutes  = require('./routes/apartments')
const profileRoutes    = require('./routes/profile')
const uploadRoutes     = require('./routes/upload')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Global middleware ─────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/apartments', apartmentRoutes)
app.use('/api/profile',    profileRoutes)
app.use('/api/upload',     uploadRoutes)

// ── 404 handler ───────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error.' })
})

// ── Start ─────────────────────────────────────────────────────
// Only listen when run directly, not when imported by tests
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✔  Server running on http://localhost:${PORT}`)
  })
}

module.exports = app