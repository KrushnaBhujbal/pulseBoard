const variants = {
  healthy:  'bg-emerald-900/40 text-emerald-400 border border-emerald-800',
  failed:   'bg-red-900/40 text-red-400 border border-red-800',
  rollback: 'bg-amber-900/40 text-amber-400 border border-amber-800',
  passed:   'bg-emerald-900/40 text-emerald-400 border border-emerald-800',
  running:  'bg-blue-900/40 text-blue-400 border border-blue-800',
}

export function Badge({ status }) {
  const style = variants[status] || variants.healthy
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${style}`}>
      {status}
    </span>
  )
}