import { Badge } from './Badge'

function PodDots({ total, healthy }) {
  return (
    <div className="flex items-center gap-1 mt-1">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-3 h-3 rounded-sm inline-block ${
            i < healthy ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
          title={i < healthy ? 'running' : 'restarting'}
        />
      ))}
      <span className={`text-xs ml-1 ${
        healthy === total ? 'text-emerald-400' : 'text-amber-400'
      }`}>
        {healthy}/{total} running
        {healthy < total && ` · ${total - healthy} restarting`}
      </span>
    </div>
  )
}

export function ServiceGrid({ services = [] }) {
  if (services.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 mb-3">
        {['orders-service', 'payments-service', 'users-service', 'inventory-service'].map(name => (
          <div key={name} className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748] animate-pulse">
            <div className="h-4 bg-[#2d3748] rounded w-32 mb-3" />
            <div className="h-8 bg-[#2d3748] rounded w-full" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 mb-3">
      {services.map(svc => (
        <div key={svc.name} className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-white">{svc.name}</span>
            <Badge status={svc.status} />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">CPU</p>
              <p className={`text-lg font-semibold ${
                svc.cpu > 75 ? 'text-amber-400' : 'text-blue-400'
              }`}>{svc.cpu}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">MEM</p>
              <p className={`text-lg font-semibold ${
                svc.memory > 80 ? 'text-amber-400' : 'text-purple-400'
              }`}>{svc.memory}%</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">REQ/S</p>
              <p className="text-lg font-semibold text-emerald-400">{svc.reqPerSec}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 mb-1">pods</p>
            <PodDots total={svc.totalPods} healthy={svc.healthyPods} />
          </div>
        </div>
      ))}
    </div>
  )
}