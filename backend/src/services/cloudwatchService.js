const { CloudWatchLogsClient, FilterLogEventsCommand } = require('@aws-sdk/client-cloudwatch-logs')
const { CloudWatchClient, GetMetricStatisticsCommand } = require('@aws-sdk/client-cloudwatch')

const logsClient = new CloudWatchLogsClient({ region: process.env.AWS_REGION || 'us-east-1' })
const metricsClient = new CloudWatchClient({ region: process.env.AWS_REGION || 'us-east-1' })

const LOG_GROUP = process.env.CW_LOG_GROUP || '/ecs/pulseboard'

// Get last 20 log lines from ECS container
async function getRecentLogs() {
  try {
    const command = new FilterLogEventsCommand({
      logGroupName: LOG_GROUP,
      limit: 20,
      startTime: Date.now() - 10 * 60 * 1000  // last 10 minutes
    })
    const result = await logsClient.send(command)
    return (result.events || []).map(e => ({
      timestamp: new Date(e.timestamp).toISOString(),
      message: e.message.trim(),
      stream: e.logStreamName
    })).reverse()
  } catch (err) {
    console.error('CloudWatch logs fetch failed:', err.message)
    return []
  }
}

// Get real ALB metrics from CloudWatch
async function getALBMetrics(albArn) {
  try {
    // Extract the suffix from ALB ARN for CloudWatch dimension
    // ARN format: arn:aws:elasticloadbalancing:region:account:loadbalancer/app/name/id
    const albSuffix = albArn.split(':loadbalancer/')[1]
    const now = new Date()
    const fiveMinAgo = new Date(now - 5 * 60 * 1000)

    async function getMetric(metricName, unit, stat = 'Sum') {
      const cmd = new GetMetricStatisticsCommand({
        Namespace: 'AWS/ApplicationELB',
        MetricName: metricName,
        Dimensions: [{ Name: 'LoadBalancer', Value: albSuffix }],
        StartTime: fiveMinAgo,
        EndTime: now,
        Period: 300,
        Statistics: [stat]
      })
      const result = await metricsClient.send(cmd)
      const points = result.Datapoints || []
      if (points.length === 0) return 0
      return Math.round(points.sort((a, b) => b.Timestamp - a.Timestamp)[0][stat])
    }

    const [requestCount, target5xx, target4xx, responseTime] = await Promise.all([
      getMetric('RequestCount', 'Count', 'Sum'),
      getMetric('HTTPCode_Target_5XX_Count', 'Count', 'Sum'),
      getMetric('HTTPCode_Target_4XX_Count', 'Count', 'Sum'),
      getMetric('TargetResponseTime', 'Seconds', 'Average')
    ])

    return {
      requestCount,
      target5xx,
      target4xx,
      responseTime: parseFloat((responseTime * 1000).toFixed(1)),  // convert to ms
      errorRate: requestCount > 0
        ? parseFloat(((target5xx / requestCount) * 100).toFixed(2))
        : 0
    }
  } catch (err) {
    console.error('ALB metrics fetch failed:', err.message)
    return null
  }
}

module.exports = { getRecentLogs, getALBMetrics }