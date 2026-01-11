import React from 'react'
import { diretoriaList } from '../data/kpis'
import { sumMetasForMonth, sumResultsForMonth } from '../lib/storage'
import { TrafficLight } from './TrafficLight'

export default function DashboardGeral({ year, month }: { year: number, month: number }){
  return (
    <div className="card p-4">
      <div className="text-lg font-semibold mb-3">Dashboard Geral</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-grayAccent">
              <th className="text-left p-2">Diretoria</th>
              <th className="text-right p-2">Meta Total (mês)</th>
              <th className="text-right p-2">Resultado Total (mês)</th>
              <th className="text-right p-2">Desvio</th>
              <th className="text-right p-2">% Desvio</th>
              <th className="text-left p-2">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {diretoriaList.map(d => {
              const meta = sumMetasForMonth(d, year, month)
              const res  = sumResultsForMonth(d, year, month)
              const dev  = res - meta
              const pct  = meta > 0 ? (dev/meta) : 0
              return (
                <tr key={d} className="border-t border-subtle">
                  <td className="p-2">{d}</td>
                  <td className="p-2 text-right">{meta.toLocaleString('pt-BR')}</td>
                  <td className="p-2 text-right">{res.toLocaleString('pt-BR')}</td>
                  <td className="p-2 text-right">{dev.toLocaleString('pt-BR')}</td>
                  <td className="p-2 text-right">{(pct*100).toFixed(1)}%</td>
                  <td className="p-2"><TrafficLight pct={pct} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
