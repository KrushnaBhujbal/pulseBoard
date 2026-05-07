import { useWebSocket } from '../hooks/useWebSocket'
import { MetricCard } from '../components/MetricCard'
import { LiveChart } from '../components/LiveChart'
import { PipelineTable } from '../components/PipelineTable'
import { Badge } from '../components/Badge'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001'

export function Dashboard() {
  const { metrics, connected, history } = useWebSocket(WS_URL)

  const m = metrics || {
    cpu: 0, memory: 0, requestCount: 0,
    errorRate: 0, p99Latency: 0
  }

  return (
    <div className="min-h-screen bg-[#0f1117] p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">PulseBoard</h1>
          <p className="text-xs text-slate-500 mt-0.5">real-time ops dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-slate-400">{connected ? 'live' : 'connecting...'}</span>
          <Badge status={connected ? 'healthy' : 'failed'} />
        </div>
      </div>

      {/* Top metric cards — 4 columns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <MetricCard label="CPU usage"   value={m.cpu}          unit="%" color="text-blue-400"    animate />
        <MetricCard label="Memory"      value={m.memory}       unit="%" color="text-purple-400"  animate />
        <MetricCard label="Req / sec"   value={m.requestCount} unit=""  color="text-emerald-400" animate />
        <MetricCard label="p99 latency" value={m.p99Latency}   unit="ms" color="text-amber-400" animate />
      </div>

      {/* Second row — 3 columns */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <MetricCard
          label="Error rate"
          value={m.errorRate}
          unit="%"
          color={m.errorRate > 3 ? 'text-red-400' : 'text-emerald-400'}
          animate
        />
        <MetricCard label="Uptime"       value={99.98} unit="%" color="text-emerald-400" animate />
        <MetricCard label="Deploy count" value={47}    unit=""  color="text-white"       animate />
      </div>

      {/* Sparkline charts — 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <LiveChart data={history} dataKey="cpu"          color="#378ADD" label="CPU %" />
        <LiveChart data={history} dataKey="p99Latency"   color="#EF9F27" label="p99 latency (ms)" />
      </div>

      {/* Pipeline table — full width */}
      <PipelineTable />

    </div>
  )
}