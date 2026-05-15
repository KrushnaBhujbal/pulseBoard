const express = require('express')
const router = express.Router()
const { getRecentMetrics } = require('../services/dynamoService')
const { getRecentLogs, getALBMetrics } = require('../services/cloudwatchService')
const { CodeDeployClient, ListDeploymentsCommand, GetDeploymentCommand } = require('@aws-sdk/client-codedeploy')

const codedeployClient = new CodeDeployClient({ region: process.env.AWS_REGION || 'us-east-1' })

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

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

router.get('/logs', async (req, res) => {
  try {
    const logs = await getRecentLogs()
    res.json({ success: true, count: logs.length, data: logs })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/alb', async (req, res) => {
  try {
    const albArn = process.env.ALB_ARN || ''
    if (!albArn) {
      return res.status(400).json({ success: false, error: 'ALB_ARN not configured' })
    }
    const metrics = await getALBMetrics(albArn)
    res.json({ success: true, data: metrics })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/deploys', async (req, res) => {
  try {
    const listCmd = new ListDeploymentsCommand({
      applicationName: process.env.CODEDEPLOY_APP || 'pulseboard-backend',
      deploymentGroupName: process.env.CODEDEPLOY_GROUP || 'pulseboard-backend-dg',
      includeOnlyStatuses: ['Succeeded', 'Failed', 'Stopped']
    })
    const { deployments } = await codedeployClient.send(listCmd)

    const details = await Promise.all(
      (deployments || []).slice(0, 5).map(async (id) => {
        const cmd = new GetDeploymentCommand({ deploymentId: id })
        const result = await codedeployClient.send(cmd)
        const d = result.deploymentInfo
        const durationMs = d.completeTime && d.createTime
          ? new Date(d.completeTime) - new Date(d.createTime)
          : null
        const durationStr = durationMs
          ? `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
          : 'n/a'
        return {
          id: d.deploymentId,
          status: d.status.toLowerCase(),
          branch: 'main',
          duration: durationStr,
          time: d.completeTime
            ? `${Math.floor((Date.now() - new Date(d.completeTime)) / 60000)} min ago`
            : 'in progress'
        }
      })
    )

    res.json({
      success: true,
      totalCount: deployments ? deployments.length : 0,
      recent: details
    })
  } catch (err) {
    console.error('CodeDeploy fetch failed:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/pipelines', async (req, res) => {
  try {
    const owner = process.env.GITHUB_OWNER || 'KrushnaBhujbal'
    const repo = process.env.GITHUB_REPO || 'pulseBoard'
    const token = process.env.GITHUB_TOKEN || ''

    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`,
      { headers }
    )
    const data = await response.json()

    const runs = (data.workflow_runs || []).map(run => {
      const durationMs = run.updated_at && run.run_started_at
        ? new Date(run.updated_at) - new Date(run.run_started_at)
        : null
      const durationStr = durationMs
        ? `${Math.floor(durationMs / 60000)}m ${Math.floor((durationMs % 60000) / 1000)}s`
        : 'n/a'
      return {
        id: run.run_number,
        branch: run.head_branch,
        status: run.conclusion || run.status,
        duration: durationStr,
        time: `${Math.floor((Date.now() - new Date(run.updated_at)) / 60000)} min ago`,
        workflow: run.name
      }
    })

    res.json({ success: true, runs })
  } catch (err) {
    console.error('GitHub API fetch failed:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router