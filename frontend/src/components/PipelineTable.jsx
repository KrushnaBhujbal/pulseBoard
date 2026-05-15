import { Badge } from './Badge'

export function PipelineTable({ runs = [] }) {
  const displayRuns = runs.length > 0 ? runs : []

  return (
    <div className="bg-[#1a1f2e] rounded-xl border border-[#2d3748] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#2d3748] flex items-center justify-between">
        <p className="text-xs text-slate-400 uppercase tracking-wide">Pipeline run history</p>
        <span className="text-xs text-slate-500">
          {runs.length > 0 ? 'live from GitHub' : 'loading...'}
        </span>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-500 border-b border-[#2d3748]">
            <th className="text-left px-4 py-2">Run</th>
            <th className="text-left px-4 py-2">Workflow</th>
            <th className="text-left px-4 py-2">Branch</th>
            <th className="text-left px-4 py-2">Status</th>
            <th className="text-left px-4 py-2">Duration</th>
            <th className="text-left px-4 py-2">Time</th>
          </tr>
        </thead>
        <tbody>
          {displayRuns.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-4 py-6 text-center text-slate-500 text-xs">
                fetching pipeline runs...
              </td>
            </tr>
          ) : (
            displayRuns.map((run, i) => (
              <tr key={i} className="border-b border-[#2d3748]/50 hover:bg-[#2d3748]/20 transition-colors">
                <td className="px-4 py-2.5 text-slate-300 font-mono">#{run.id}</td>
                <td className="px-4 py-2.5 text-slate-400 text-xs">{run.workflow || 'CI/CD'}</td>
                <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{run.branch}</td>
                <td className="px-4 py-2.5"><Badge status={run.status} /></td>
                <td className="px-4 py-2.5 text-slate-400">{run.duration}</td>
                <td className="px-4 py-2.5 text-slate-500 text-xs">{run.time}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}