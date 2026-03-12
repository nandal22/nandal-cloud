const router   = require('express').Router()
const supabase = require('../services/supabase')
const github   = require('../services/github')
const authMiddleware = require('../middleware/auth')

// GET /api/download/:fileId
router.get('/:fileId', authMiddleware, async (req, res, next) => {
  try {
    const { fileId } = req.params
    const userId = req.user.userId

    // Fetch metadata, verify ownership
    const { data: file, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (error || !file) return res.status(404).json({ error: 'File not found' })

    // Download from GitHub
    const buffer = await github.downloadFile(file.github_path)

    res.set({
      'Content-Type':        file.mime_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.name)}"`,
      'Content-Length':      buffer.length,
      'X-Encrypted':         file.is_encrypted ? 'true' : 'false',
    })

    res.send(buffer)
  } catch (err) {
    next(err)
  }
})

module.exports = router
