const router   = require('express').Router()
const bcrypt   = require('bcryptjs')
const supabase = require('../services/supabase')
const { signToken } = require('../services/jwt')
const { authLimiter } = require('../middleware/rateLimit')
const authMiddleware  = require('../middleware/auth')

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
    if (password.length < 8)  return res.status(400).json({ error: 'Password must be at least 8 characters' })

    // Check for duplicate
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) return res.status(409).json({ error: 'Email already registered' })

    // Hash password (salt rounds = 12)
    const passwordHash = await bcrypt.hash(password, 12)

    const { data: user, error } = await supabase
      .from('users')
      .insert({ email: email.toLowerCase(), password_hash: passwordHash, name: name || email.split('@')[0] })
      .select('id, email, name, created_at')
      .single()

    if (error) throw error

    const token = signToken({ userId: user.id, email: user.email })

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) return res.status(401).json({ error: 'Invalid email or password' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' })

    const token = signToken({ userId: user.id, email: user.email })

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, created_at')
      .eq('id', req.user.userId)
      .single()

    if (error || !user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    next(err)
  }
})

module.exports = router
