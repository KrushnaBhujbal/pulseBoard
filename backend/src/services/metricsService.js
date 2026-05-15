const { v4: uuidv4 } = require('uuid')

const SERVER_START_TIME = Date.now()

const SERVICES = [
  { name: 'orders-service',    baseLoad: 40, pods: 3 },
  { name: 'payments-service',  baseLoad: 20, pods: 2 },
  { name: 'users-service',     baseLoad: 65, pods: 3 },
  { name: 'inventory-service', baseLoad: 12, pods: 2 },
]

function generateMetrics() {
  const now = new Date().toISOString()
  const uptimeMs = Date.now() - SERVER_START_TIME
  const uptimeSeconds = Math.floor(uptimeMs / 1000)
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
  const uptimePercent = parseFloat(
    Math.min((uptimeMs / thirtyDaysMs) * 100, 99.99).toFixed(2)
  )

  return {
    id: uuidv4(),
    timestamp: now,
    cpu: parseFloat((Math.random() * 60 + 10).toFixed(2)),
    memory: parseFloat((Math.random() * 40 + 30).toFixed(2)),
    requestCount: Math.floor(Math.random() * 500 + 100),
    errorRate: parseFloat((Math.random() * 5).toFixed(2)),
    p99Latency: Math.floor(Math.random() * 200 + 20),
    uptimeSeconds,
    uptimePercent,
    environment: process.env.NODE_ENV || 'development'
  }
}

function generateServiceMetrics() {
  return SERVICES.map(svc => {
    const cpu = parseFloat((svc.baseLoad + Math.random() * 20 - 10).toFixed(1))
    const memory = parseFloat((svc.baseLoad + 15 + Math.random() * 15).toFixed(1))
    const reqPerSec = Math.floor(Math.random() * 300 + 50)
    const errorRate = parseFloat((Math.random() * 3).toFixed(2))
    const healthyPods = cpu > 80 ? svc.pods - 1 : svc.pods
    const status = cpu > 80 || errorRate > 2.5 ? 'warning' : 'healthy'

    return {
      name: svc.name,
      cpu,
      memory,
      reqPerSec,
      errorRate,
      totalPods: svc.pods,
      healthyPods,
      status,
      version: 'v2.1.0'
    }
  })
}

module.exports = { generateMetrics, generateServiceMetrics, SERVER_START_TIME }