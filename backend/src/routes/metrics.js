const express = require('express')
const router = express.Router()
const { getRecentMetrics } = require('../services/dynamoService')

// GET /api/metrics — returns last 20 snapshots from DynamoDB
// The dashboard calls this once on load to populate the chart before WebSocket kicks in
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const metrics = await getRecentMetrics(limit)
    res.json({ success: true, count: metrics.length, data: metrics })
  } catch (err) {
    console.error('Failed to fetch metrics:', err.message)
    res.status(500).json({ success: false, error: 'Failed to fetch metrics' })
  }
})

// GET /api/metrics/health — simple health check (ALB uses this to verify the container is alive)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = router