import { useEffect, useRef, useState } from 'react'

// Animates a number from its previous value to the new value
function useCountUp(value, duration = 600) {
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const start = prev.current
    const end = value
    const startTime = performance.now()

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const current = start + (end - start) * progress
      setDisplay(current)
      if (progress < 1) requestAnimationFrame(tick)
      else prev.current = end
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return display
}

export function MetricCard({ label, value, unit = '', color = 'text-white', animate = false }) {
  const animated = useCountUp(animate ? parseFloat(value) || 0 : 0)
  const displayValue = animate
    ? `${animated.toFixed(1)}${unit}`
    : `${value}${unit}`

  return (
    <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#2d3748]">
      <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{displayValue}</p>
    </div>
  )
}