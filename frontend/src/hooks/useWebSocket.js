import { useState, useEffect, useRef } from 'react'

export function useWebSocket(url) {
  const [metrics, setMetrics] = useState(null)
  const [connected, setConnected] = useState(false)
  const [history, setHistory] = useState([])
  const wsRef = useRef(null)

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
        setMetrics(data)
        // Keep last 20 snapshots for the sparkline chart
        setHistory(prev => {
          const updated = [...prev, data]
          return updated.slice(-20)
        })
      }

      ws.onclose = () => {
        setConnected(false)
        // Auto-reconnect after 3 seconds if connection drops
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

  return { metrics, connected, history }
}