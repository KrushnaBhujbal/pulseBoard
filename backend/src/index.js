require('dotenv').config()
const express = require('express')
const http = require('http')
const { startBroadcaster } = require('./websocket/broadcaster')
const metricsRouter = require('./routes/metrics')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(express.json())

// Allow the React frontend (localhost:5173 in dev) to call this API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// Routes
app.use('/api/metrics', metricsRouter)

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'PulseBoard API is running', version: '1.0.0' })
})

// Create HTTP server — WebSocket attaches to this same server
const server = http.createServer(app)

// Start WebSocket broadcaster
startBroadcaster(server)

// Start listening
server.listen(PORT, () => {
  console.log(`PulseBoard backend running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV}`)
  console.log(`DynamoDB table: ${process.env.DYNAMO_TABLE_NAME}`)
})