import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function useWebSocket(url) {
  const [metrics, setMetrics] = useState(null)
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState([])
  const [deploys, setDeploys] = useState({ totalCount: 0, recent: [] })
  const [pipelines, setPipelines] = useState([])
  const [services, setServices] = useState([])
  const wsRef = useRef(null)

  useEffect(() => {
    async function fetchExtras() {
      try {
        const [deployRes, pipelineRes] = await Promise.all([
          fetch(`${API_URL}/api/metrics/deploys`),
          fetch(`${API_URL}/api/metrics/pipelines`)
        ])
        const deployData = await deployRes.json()
        const pipelineData = await pipelineRes.json()
        if (deployData.success) setDeploys(deployData)
        if (pipelineData.success) setPipelines(pipelineData.runs)
      } catch (err) {
        console.error('Failed to fetch extras:', err.message)
      }
    }

    fetchExtras()
    const interval = setInterval(fetchExtras, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.metrics && data.services) {
          setMetrics(data.metrics)
          setServices(data.services)
          setHistory(prev => [...prev, data.metrics].slice(-20))
        } else {
          setMetrics(data)
          setHistory(prev => [...prev, data].slice(-20))
        }
      }

      ws.onclose = () => {
        setConnected(false)
        setTimeout(connect, 3000)
      }

      ws.onerror = (err) => {
        console.error('WebSocket error:', err)
        ws.close()
      }
    }

    connect()
    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [url])

  return { metrics, connected, history, deploys, pipelines, services }
}