const { verifyToken } = require('../services/jwt')

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = header.slice(7)
  try {
    req.user = verifyToken(token)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}
