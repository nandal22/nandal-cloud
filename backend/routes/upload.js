const router   = require('express').Router()
const crypto   = require('crypto')
const supabase = require('../services/supabase')
const authMiddleware = require('../middleware/auth')

const BUCKET = 'user-files'

// ── POST /api/upload/sign ────────────────────────────────────────────────────
// Step 1: Client requests a signed upload URL.
// The file is uploaded directly from the browser to Supabase Storage —
// it never passes through Vercel, so there is no 4.5 MB limit.
router.post('/sign', authMiddleware, async (req, res, next) => {
  try {
    const { filename, folderId, size, mimeType } = req.body
    if (!filename) return res.status(400).json({ error: 'filename is required' })

    const userId      = req.user.userId
    const fileId      = crypto.randomUUID()
    const ext         = filename.split('.').pop().toLowerCase()
    const storagePath = `${userId}/${fileId}/${filename}`

    // Create signed upload URL (valid 10 minutes)
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath)

    if (error) throw error

    // Pre-register the file row as 'pending' so we can finalize it later
    await supabase.from('files').insert({
      id:           fileId,
      user_id:      userId,
      folder_id:    folderId || null,
      name:         filename,
      size:         size || 0,
      mime_type:    mimeType || 'application/octet-stream',
      extension:    ext,
      storage_path: storagePath,
      is_encrypted: true,
      status:       'pending',
    })

    res.json({
      fileId,
      signedUrl:   data.signedUrl,
      token:       data.token,
      storagePath,
    })
  } catch (err) {
    next(err)
  }
})

// ── POST /api/upload/complete ────────────────────────────────────────────────
// Step 2: Client calls this after the direct Supabase upload succeeds.
// Marks the file as active in the database.
router.post('/complete', authMiddleware, async (req, res, next) => {
  try {
    const { fileId } = req.body
    if (!fileId) return res.status(400).json({ error: 'fileId is required' })

    const { data: file, error } = await supabase
      .from('files')
      .update({ status: 'active' })
      .eq('id', fileId)
      .eq('user_id', req.user.userId)
      .select('id, name, size, mime_type, folder_id, created_at')
      .single()

    if (error || !file) return res.status(404).json({ error: 'File not found' })

    res.json({
      message: 'Upload complete',
      file: {
        id:        file.id,
        name:      file.name,
        size:      file.size,
        mimeType:  file.mime_type,
        folderId:  file.folder_id,
        createdAt: file.created_at,
      },
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
