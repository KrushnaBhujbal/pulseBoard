const { v4: uuidv4 } = require('uuid')

// Baby analogy: this is a nurse taking readings every few seconds
// and making up realistic-looking numbers for now
function generateMetrics() {
  const now = new Date().toISOString()

  return {
    id: uuidv4(),
    timestamp: now,
    cpu: parseFloat((Math.random() * 60 + 10).toFixed(2)),        // 10–70%
    memory: parseFloat((Math.random() * 40 + 30).toFixed(2)),     // 30–70%
    requestCount: Math.floor(Math.random() * 500 + 100),          // 100–600 req/s
    errorRate: parseFloat((Math.random() * 5).toFixed(2)),        // 0–5%
    p99Latency: Math.floor(Math.random() * 200 + 20),             // 20–220ms
    environment: process.env.NODE_ENV || 'development'
  }
}

module.exports = { generateMetrics }