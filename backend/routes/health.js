const router = require('express').Router()

router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'nandal-cloud-api',
  })
})

module.exports = router
