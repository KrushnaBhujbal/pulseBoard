import { useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { MetricCard } from '../components/MetricCard'
import { LiveChart } from '../components/LiveChart'
import { PipelineTable } from '../components/PipelineTable'
import { ServiceGrid } from '../components/ServiceGrid'
import { LogsTail } from '../components/LogsTail'
import { ALBMetrics } from '../components/ALBMetrics'
import { Badge } from '../components/Badge'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'
const TABS = ['Overview', 'Services', 'Logs & ALB', 'Pipeline']

export function Dashboard() {
  const { metrics, connected, history, deploys, pipelines, services } = useWebSocket(WS_URL)
  const [activeTab, setActiveTab] = useState('Overview')

  const m = metrics || {
    cpu: 0, memory: 0, requestCount: 0,
    errorRate: 0, p99Latency: 0, uptimePercent: 0
  }

  const overallStatus = services.some(s => s.status === 'warning')
    ? 'warning'
    : connected ? 'healthy' : 'failed'

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-white">PulseBoard</h1>
          <p className="text-xs text-slate-500 mt-0.5">e-commerce ops dashboard · ECS Fargate</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${
            connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
          }`} />
          <span className="text-xs text-slate-400">{connected ? 'live' : 'connecting...'}</span>
          <Badge status={overallStatus} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-[#1a1f2e] rounded-lg p-1 w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              activeTab === tab
                ? 'bg-[#2d3748] text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'Overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <MetricCard label="CPU usage"   value={m.cpu}          unit="%" color="text-blue-400"    animate />
            <MetricCard label="Memory"      value={m.memory}       unit="%" color="text-purple-400"  animate />
            <MetricCard label="Req / sec"   value={m.requestCount} unit=""  color="text-emerald-400" animate />
            <MetricCard label="p99 latency" value={m.p99Latency}   unit="ms" color="text-amber-400" animate />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <MetricCard
              label="Error rate"
              value={m.errorRate}
              unit="%"
              color={m.errorRate > 3 ? 'text-red-400' : 'text-emerald-400'}
              animate
            />
            <MetricCard label="Uptime"        value={m.uptimePercent || 0} unit="%" color="text-emerald-400" animate />
            <MetricCard label="Deploy count" value={deploys.totalCount || 0} unit="" color="text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <LiveChart data={history} dataKey="cpu"        color="#378ADD" label="CPU %" />
            <LiveChart data={history} dataKey="p99Latency" color="#EF9F27" label="p99 latency (ms)" />
          </div>
        </>
      )}

      {/* Services tab */}
      {activeTab === 'Services' && (
        <ServiceGrid services={services} />
      )}

      {/* Logs & ALB tab */}
      {activeTab === 'Logs & ALB' && (
        <>
          <ALBMetrics />
          <LogsTail />
        </>
      )}

      {/* Pipeline tab */}
      {activeTab === 'Pipeline' && (
        <PipelineTable runs={pipelines} />
      )}

    </div>
  )
}