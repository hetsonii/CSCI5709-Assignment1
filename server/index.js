require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes      = require('./routes/auth')
const apartmentRoutes = require('./routes/apartments')
const profileRoutes   = require('./routes/profile')
const uploadRoutes    = require('./routes/upload')

const app  = express()
const PORT = process.env.PORT || 5000

// ── CORS — must allow credentials so the browser sends the cookie ──
app.use(cors({
  origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,   // <── required for cookies
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Health ────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/apartments', apartmentRoutes)
app.use('/api/profile',    profileRoutes)
app.use('/api/upload',     uploadRoutes)

// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ message: 'Route not found.' }))

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error.' })
})

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`✔  Server running → http://localhost:${PORT}`)
  )
}

module.exports = app