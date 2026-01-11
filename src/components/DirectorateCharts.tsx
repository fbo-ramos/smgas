import React from 'react'
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Diretoria, allKPIsByDir } from '../data/kpis'
import { loadStores } from '../lib/storage'

export default function DirectorateCharts({ dir, year }: { dir: Diretoria, year: number }){
  const kpis = allKPIsByDir[dir].slice(0,3)
  const { r } = loadStores()

  const series = kpis.map(k => {
    const data = Array.from({length:12}, (_,i)=>{
      const month = i+1
      const key = `${dir}|${year}|${month}|${k.key}`
      const value = r[key] || 0
      return { month, value }
    })
    return { kpi: k, data }
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {series.map(s => (
        <div key={s.kpi.key} className="card p-4">
          <div className={`mb-2 ${s.kpi.suggested ? 'text-red-700' : 'text-gray-900'} font-semibold`}>{s.kpi.label}</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={s.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}
