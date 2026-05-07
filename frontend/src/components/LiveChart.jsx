import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function LiveChart({ data, dataKey, color = '#378ADD', label }) {
  const chartData = data.map((d, i) => ({
    index: i + 1,
    value: parseFloat(d[dataKey]?.toFixed(1) || 0)
  }))

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748]">
      <p className="text-xs text-slate-400 mb-3 uppercase tracking-wide">{label} — last 20 snapshots</p>
      <ResponsiveContainer width="100%" height={80}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #2d3748', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: color }}
            formatter={(v) => [`${v}`, label]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}