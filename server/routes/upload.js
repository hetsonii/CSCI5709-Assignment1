const express      = require('express')
const multer       = require('multer')
const streamifier  = require('streamifier')
const cloudinary   = require('../config/cloudinary')
const { requireAuth } = require('../middleware/auth')

const router = express.Router()

// Use memory storage — stream directly to Cloudinary, nothing saved to disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPG, PNG, WEBP, and MP4 files are allowed.'))
    }
  },
})

// ── POST /api/upload  (protected) ────────────────────────────
// Body: multipart/form-data with field "file"
// Returns: { url } — the Cloudinary secure URL to store on the review
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: 'No file provided.' })

  try {
    const url = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder:         'tenanttrails/reviews',
          resource_type:  'auto',          // handles both images and videos
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) return reject(error)
          resolve(result.secure_url)
        }
      )
      streamifier.createReadStream(req.file.buffer).pipe(uploadStream)
    })

    return res.status(201).json({ url })
  } catch (err) {
    console.error('Cloudinary upload error:', err)
    return res.status(500).json({ message: 'Image upload failed.' })
  }
})

// ── Multer error handler ──────────────────────────────────────
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(400).json({ message: 'File too large. Max 10 MB.' })
  }
  return res.status(400).json({ message: err.message || 'Upload error.' })
})

module.exports = router