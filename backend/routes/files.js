const router   = require('express').Router()
const supabase = require('../services/supabase')
const github   = require('../services/github')
const authMiddleware = require('../middleware/auth')

// GET /api/files  — list all files for the logged-in user
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId   = req.user.userId
    const folderId = req.query.folderId || null
    const search   = req.query.search   || ''
    const sortBy   = ['name', 'size', 'created_at'].includes(req.query.sortBy) ? req.query.sortBy : 'created_at'
    const sortDir  = req.query.sortDir === 'asc' ? true : false

    let query = supabase
      .from('files')
      .select('id, name, size, mime_type, extension, folder_id, is_encrypted, created_at')
      .eq('user_id', userId)
      .order(sortBy, { ascending: sortDir })

    if (folderId) query = query.eq('folder_id', folderId)
    if (search)   query = query.ilike('name', `%${search}%`)

    const { data: files, error } = await query
    if (error) throw error

    res.json({ files })
  } catch (err) {
    next(err)
  }
})

// GET /api/files/folders  — list folders
router.get('/folders', authMiddleware, async (req, res, next) => {
  try {
    const { data: folders, error } = await supabase
      .from('folders')
      .select('id, name, parent_id, color, created_at')
      .eq('user_id', req.user.userId)
      .order('name')

    if (error) throw error
    res.json({ folders })
  } catch (err) {
    next(err)
  }
})

// POST /api/files/folders  — create folder
router.post('/folders', authMiddleware, async (req, res, next) => {
  try {
    const { name, parentId, color } = req.body
    if (!name?.trim()) return res.status(400).json({ error: 'Folder name is required' })

    const { data: folder, error } = await supabase
      .from('folders')
      .insert({
        name:      name.trim(),
        parent_id: parentId || null,
        color:     color || '#6366f1',
        user_id:   req.user.userId,
      })
      .select()
      .single()

    if (error) throw error
    res.status(201).json({ folder })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/files/folders/:folderId
router.delete('/folders/:folderId', authMiddleware, async (req, res, next) => {
  try {
    const { folderId } = req.params
    const userId = req.user.userId

    // Verify ownership
    const { data: folder } = await supabase
      .from('folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single()

    if (!folder) return res.status(404).json({ error: 'Folder not found' })

    // Delete all files in folder from GitHub
    const { data: files } = await supabase
      .from('files')
      .select('id, github_path, github_sha')
      .eq('folder_id', folderId)
      .eq('user_id', userId)

    await Promise.allSettled((files || []).map(f =>
      github.deleteFile(f.github_path, f.github_sha, `Delete folder ${folderId}`)
    ))

    // Delete records
    await supabase.from('files').delete().eq('folder_id', folderId).eq('user_id', userId)
    await supabase.from('folders').delete().eq('id', folderId).eq('user_id', userId)

    res.json({ message: 'Folder deleted' })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/files/:fileId
router.delete('/:fileId', authMiddleware, async (req, res, next) => {
  try {
    const { fileId } = req.params
    const userId = req.user.userId

    const { data: file } = await supabase
      .from('files')
      .select('github_path, github_sha')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (!file) return res.status(404).json({ error: 'File not found' })

    // Delete from GitHub
    const sha = file.github_sha || await github.getFileSha(file.github_path)
    if (sha) await github.deleteFile(file.github_path, sha)

    // Delete record
    await supabase.from('files').delete().eq('id', fileId).eq('user_id', userId)

    res.json({ message: 'File deleted' })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/files/:fileId  — rename or move
router.patch('/:fileId', authMiddleware, async (req, res, next) => {
  try {
    const { fileId } = req.params
    const { name, folderId } = req.body
    const userId = req.user.userId

    const updates = {}
    if (name)     updates.name      = name.trim()
    if (folderId !== undefined) updates.folder_id = folderId

    const { data: file, error } = await supabase
      .from('files')
      .update(updates)
      .eq('id', fileId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error || !file) return res.status(404).json({ error: 'File not found' })

    res.json({ file })
  } catch (err) {
    next(err)
  }
})

module.exports = router
