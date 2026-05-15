const { WebSocketServer } = require('ws')
const { generateMetrics, generateServiceMetrics } = require('../services/metricsService')
const { saveMetric } = require('../services/dynamoService')

function startBroadcaster(server) {
  const wss = new WebSocketServer({ server })
  console.log('WebSocket server started')

  wss.on('connection', (socket) => {
    console.log('Client connected — total:', wss.clients.size)
    socket.on('close', () => {
      console.log('Client disconnected — total:', wss.clients.size)
    })
  })

  setInterval(async () => {
    const metrics = generateMetrics()
    const services = generateServiceMetrics()

    saveMetric(metrics).catch((err) => {
      console.error('DynamoDB save failed:', err.message)
    })

    // Send both cluster metrics and per-service metrics together
    const payload = JSON.stringify({ metrics, services })
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(payload)
      }
    })
  }, 3000)
}

module.exports = { startBroadcaster }