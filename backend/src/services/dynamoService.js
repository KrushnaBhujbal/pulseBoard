const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb')

// Create the DynamoDB client — it auto-picks credentials from AWS_PROFILE
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' })
const dynamo = DynamoDBDocumentClient.from(client)

const TABLE = process.env.DYNAMO_TABLE_NAME || 'pulseboard-metrics'

// Save one metric snapshot to DynamoDB
async function saveMetric(metric) {
  const command = new PutCommand({
    TableName: TABLE,
    Item: metric
  })
  await dynamo.send(command)
}

// Get the last N metrics (simple scan — fine for learning, not for production at scale)
async function getRecentMetrics(limit = 20) {
  const command = new ScanCommand({
    TableName: TABLE,
    Limit: limit
  })
  const result = await dynamo.send(command)
  // Sort by timestamp descending so newest is first
  return result.Items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

module.exports = { saveMetric, getRecentMetrics }