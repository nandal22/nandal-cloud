const router  = require('express').Router()
const multer  = require('multer')
const crypto  = require('crypto')
const supabase = require('../services/supabase')
const github   = require('../services/github')
const authMiddleware = require('../middleware/auth')

const MAX_SIZE = 5 * 1024 * 1024 * 1024 // 5 GB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
})

// POST /api/upload
// Body: multipart/form-data with field "file", optional "folderId"
router.post('/', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    const userId   = req.user.userId
    const folderId = req.body.folderId || null
    const fileId   = crypto.randomUUID()
    const ext      = req.file.originalname.split('.').pop()
    const ghPath   = `users/${userId}/files/${fileId}.enc`

    // Upload the (already client-encrypted) file to GitHub
    await github.uploadFile(ghPath, req.file.buffer, `Upload: ${req.file.originalname}`)

    // Record metadata in Supabase
    const { data: record, error } = await supabase
      .from('files')
      .insert({
        id:            fileId,
        user_id:       userId,
        folder_id:     folderId,
        name:          req.file.originalname,
        size:          req.file.size,
        mime_type:     req.file.mimetype,
        extension:     ext,
        github_path:   ghPath,
        is_encrypted:  true,
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        id:        record.id,
        name:      record.name,
        size:      record.size,
        mimeType:  record.mime_type,
        folderId:  record.folder_id,
        createdAt: record.created_at,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
