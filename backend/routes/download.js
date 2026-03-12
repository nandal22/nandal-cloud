const router   = require('express').Router()
const supabase = require('../services/supabase')
const authMiddleware = require('../middleware/auth')

const BUCKET = 'user-files'

// GET /api/download/:fileId
// Returns a short-lived signed download URL (1 hour).
// The client downloads directly from Supabase Storage — no size limit on Vercel.
router.get('/:fileId', authMiddleware, async (req, res, next) => {
  try {
    const { fileId } = req.params
    const userId = req.user.userId

    // Fetch metadata and verify ownership
    const { data: file, error } = await supabase
      .from('files')
      .select('id, name, mime_type, storage_path, is_encrypted, status')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (error || !file) return res.status(404).json({ error: 'File not found' })
    if (file.status === 'pending') return res.status(409).json({ error: 'File upload not yet complete' })

    // Generate a signed download URL (valid 1 hour)
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.storage_path, 3600, {
        download: file.name,  // sets Content-Disposition: attachment
      })

    if (signErr) throw signErr

    res.json({
      url:         signed.signedUrl,
      name:        file.name,
      mimeType:    file.mime_type,
      isEncrypted: file.is_encrypted,
      expiresIn:   3600,
    })
  } catch (err) {
    next(err)
  }
})

module.exports = router
