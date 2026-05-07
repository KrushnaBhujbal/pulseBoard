const { WebSocketServer } = require('ws')
const { generateMetrics } = require('../services/metricsService')
const { saveMetric } = require('../services/dynamoService')

function startBroadcaster(server) {
  // Attach WebSocket server to the same HTTP server Express uses
  const wss = new WebSocketServer({ server })

  console.log('WebSocket server started')

  // When a client connects (browser opens the dashboard)
  wss.on('connection', (socket) => {
    console.log('Client connected — total:', wss.clients.size)

    socket.on('close', () => {
      console.log('Client disconnected — total:', wss.clients.size)
    })
  })

  // Every 3 seconds: generate metrics, save to DynamoDB, broadcast to all connected clients
  // Baby analogy: the nurse takes vitals every 3 seconds and updates all screens
  setInterval(async () => {
    const metrics = generateMetrics()

    // Save to DynamoDB (fire and don't block the broadcast if it fails)
    saveMetric(metrics).catch((err) => {
      console.error('DynamoDB save failed:', err.message)
    })

    // Broadcast to every connected browser
    const payload = JSON.stringify(metrics)
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {  // 1 = OPEN
        client.send(payload)
      }
    })
  }, 3000)
}

module.exports = { startBroadcaster }