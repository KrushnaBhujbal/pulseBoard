import { Badge } from './Badge'

// Mock pipeline runs — in Module 6 this will pull from real GitHub Actions API
const mockRuns = [
  { id: 52, branch: 'main',     status: 'passed',   duration: '1m 42s', time: '2 min ago' },
  { id: 51, branch: 'main',     status: 'failed',   duration: '0m 38s', time: '18 min ago' },
  { id: 50, branch: 'feat/ws',  status: 'passed',   duration: '1m 55s', time: '1 hr ago' },
  { id: 49, branch: 'main',     status: 'passed',   duration: '1m 48s', time: '3 hr ago' },
  { id: 48, branch: 'main',     status: 'rollback', duration: '2m 10s', time: '5 hr ago' },
]

export function PipelineTable() {
  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-[#2d3748] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d3748]">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Pipeline run history</p>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-[#2d3748]">
            <th className="text-left px-4 py-2">Run</th>
            <th className="text-left px-4 py-2">Branch</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Duration</th>
            <th className="text-left px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {mockRuns.map((run) => (
            <tr key={run.id} className="border-b border-[#2d3748]/50 hover:bg-[#2d3748]/20 transition-colors">
              <td className="px-4 py-2.5 text-slate-300 font-mono">#{run.id}</td>
              <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{run.branch}</td>
              <td className="px-4 py-2.5"><Badge status={run.status} /></td>
              <td className="px-4 py-2.5 text-slate-400">{run.duration}</td>
              <td className="px-4 py-2.5 text-slate-500 text-xs">{run.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}