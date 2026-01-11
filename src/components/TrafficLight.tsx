import React from 'react'

export function TrafficLight({ pct }: { pct: number }){
  const color = pct >= 0.05 ? 'bg-green-500' : (pct >= -0.05 ? 'bg-yellow-400' : 'bg-red-500')
  const label = pct >= 0.05 ? 'OK' : (pct >= -0.05 ? 'Atenção' : 'Crítico')
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded-full ${color}`}></span>
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  )
}
