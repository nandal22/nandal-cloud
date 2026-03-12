require('dotenv').config()
const express = require('express')
const cors    = require('cors')

const authRoutes     = require('./routes/auth')
const filesRoutes    = require('./routes/files')
const uploadRoutes   = require('./routes/upload')
const downloadRoutes = require('./routes/download')
const healthRoutes   = require('./routes/health')
const errorHandler   = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimit')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/api', apiLimiter)

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health',   healthRoutes)
app.use('/api/auth',     authRoutes)
app.use('/api/files',    filesRoutes)
app.use('/api/upload',   uploadRoutes)
app.use('/api/download', downloadRoutes)

// ── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 Nandal Cloud API running on port ${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app
