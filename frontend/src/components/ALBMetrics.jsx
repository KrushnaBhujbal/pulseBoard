import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function ALBMetrics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchALB() {
      try {
        const res = await fetch(`${API_URL}/api/metrics/alb`)
        const json = await res.json()
        if (json.success) setData(json.data)
      } catch (err) {
        console.error('ALB fetch failed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchALB()
    const interval = setInterval(fetchALB, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748] mb-3 animate-pulse">
      <div className="h-4 bg-[#2d3748] rounded w-40 mb-3" />
      <div className="grid grid-cols-4 gap-3">
        {[1,2,3,4].map(i => <div key={i} className="h-12 bg-[#2d3748] rounded" />)}
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748] mb-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 uppercase tracking-wide">
          ALB metrics · last 5 minutes · CloudWatch
        </p>
        <span className="text-xs text-slate-500">real AWS data</span>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-[#0f1117] rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Total requests</p>
          <p className="text-xl font-semibold text-blue-400">
            {data.requestCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">5xx errors</p>
          <p className={`text-xl font-semibold ${
            data.target5xx > 0 ? 'text-red-400' : 'text-emerald-400'
          }`}>{data.target5xx}</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">4xx errors</p>
          <p className={`text-xl font-semibold ${
            data.target4xx > 10 ? 'text-amber-400' : 'text-slate-300'
          }`}>{data.target4xx}</p>
        </div>
        <div className="bg-[#0f1117] rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">Avg response</p>
          <p className="text-xl font-semibold text-amber-400">
            {data.responseTime}ms
          </p>
        </div>
      </div>
    </div>
  )
}