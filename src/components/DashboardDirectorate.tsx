import React, { useMemo } from 'react'
import { Diretoria, allKPIsByDir } from '../data/kpis'
import { loadStores, rowKey, ytdSumForKPI, getAnnualMeta } from '../lib/storage'
import { TrafficLight } from './TrafficLight'

export default function DashboardDirectorate({ dir, year, month }: { dir: Diretoria, year: number, month: number }){
  const { r, mm, ma } = loadStores()
  const kpis = allKPIsByDir[dir]

  const show = useMemo(()=>{
    const base = kpis.filter(k=>!k.suggested).slice(0,8)
    if(base.length >= 8) return base
    const add = kpis.filter(k=>k.suggested).slice(0, 8-base.length)
    return [...base, ...add]
  }, [dir])

  return (
    <div className="card p-4">
      <div className="text-lg font-semibold mb-3">Meta × Resultado — {dir}</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-grayAccent">
              <th className="text-left p-2">KPI</th>
              <th className="text-right p-2">Meta (mês)</th>
              <th className="text-right p-2">Resultado (mês)</th>
              <th className="text-right p-2">Desvio</th>
              <th className="text-right p-2">% Desvio</th>
              <th className="text-left p-2">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {show.map((k)=>{
              const meta = mm[rowKey(dir,year,month,k.key)] || 0
              const res  = r[rowKey(dir,year,month,k.key)] || 0
              const dev = res - meta
              const pct = meta > 0 ? (dev/meta) : 0
              return (
                <tr key={k.key} className="border-t border-subtle">
                  <td className={`p-2 ${k.suggested ? 'text-red-700' : ''}`}>{k.label}</td>
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

      <div className="mt-6 text-lg font-semibold">Comparativo YTD (Meta anual proporcional)</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-grayAccent">
              <th className="text-left p-2">KPI</th>
              <th className="text-right p-2">Meta Anual</th>
              <th className="text-right p-2">Acum. YTD</th>
              <th className="text-right p-2">Meta Proporc.</th>
              <th className="text-right p-2">Desvio</th>
              <th className="text-right p-2">% Desvio</th>
              <th className="text-left p-2">Semáforo</th>
            </tr>
          </thead>
          <tbody>
            {kpis.slice(0,6).map((k)=>{
              const metaAnual = getAnnualMeta(dir, year, k.key)
              const acum = ytdSumForKPI(dir, year, month, k.key)
              const metaProp = metaAnual * (month/12)
              const dev = acum - metaProp
              const pct = metaProp > 0 ? (dev/metaProp) : 0
              return (
                <tr key={k.key} className="border-t border-subtle">
                  <td className={`p-2 ${k.suggested ? 'text-red-700' : ''}`}>{k.label}</td>
                  <td className="p-2 text-right">{metaAnual.toLocaleString('pt-BR')}</td>
                  <td className="p-2 text-right">{acum.toLocaleString('pt-BR')}</td>
                  <td className="p-2 text-right">{metaProp.toLocaleString('pt-BR')}</td>
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
