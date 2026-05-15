import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function LogsTail() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch(`${API_URL}/api/metrics/logs`)
        const data = await res.json()
        if (data.success) setLogs(data.data)
      } catch (err) {
        console.error('Logs fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 15000)
    return () => clearInterval(interval)
  }, [])

  function getLogColor(message) {
    if (message.includes('error') || message.includes('Error') || message.includes('failed'))
      return 'text-red-400'
    if (message.includes('warn') || message.includes('Warn'))
      return 'text-amber-400'
    if (message.includes('connected') || message.includes('running') || message.includes('started'))
      return 'text-emerald-400'
    return 'text-slate-300'
  }

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-[#2d3748] overflow-hidden mb-3">
      <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          CloudWatch logs · /ecs/pulseboard
        </p>
        <span className="text-xs text-slate-500">live · refreshes every 15s</span>
      </div>

      <div className="p-3 font-mono text-xs bg-[#0f1117]" style={{ minHeight: 160 }}>
        {loading ? (
          <p className="text-slate-500">fetching logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-slate-500">no recent logs — container may be idle</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-3 mb-1">
              <span className="text-slate-600 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className={getLogColor(log.message)}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}