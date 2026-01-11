import React from 'react'
import { Diretoria, allKPIsByDir } from '../data/kpis'
import { loadStores, saveStores, rowKey, annualKey } from '../lib/storage'

export default function DirectorateEntry({ dir, year, month }: { dir: Diretoria, year: number, month: number }){
  const { r, mm, ma } = loadStores()
  const kpis = allKPIsByDir[dir]

  function updateResult(k: string, v: number){
    const stores = loadStores()
    stores.r[rowKey(dir,year,month,k)] = v
    saveStores(stores.r, stores.mm, stores.ma)
  }
  function updateMetaMensal(k: string, v: number){
    const stores = loadStores()
    stores.mm[rowKey(dir,year,month,k)] = v
    saveStores(stores.r, stores.mm, stores.ma)
  }
  function updateMetaAnual(k: string, v: number){
    const stores = loadStores()
    stores.ma[annualKey(dir,year,k)] = v
    saveStores(stores.r, stores.mm, stores.ma)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-4">
        <div className="text-lg font-semibold mb-2">Resultados do mês</div>
        <div className="max-h-[60vh] overflow-auto border border-subtle rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-grayAccent">
                <th className="text-left p-2">KPI</th>
                <th className="text-right p-2">Valor</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map(k => {
                const val = r[rowKey(dir,year,month,k.key)] || 0
                return (
                  <tr key={k.key} className="border-t border-subtle">
                    <td className={`p-2 ${k.suggested ? 'text-red-700' : ''}`}>{k.label}</td>
                    <td className="p-2 text-right">
                      <input
                        className="input w-40 text-right"
                        type="number" min="0" step="0.01"
                        value={val}
                        onChange={e => updateResult(k.key, parseFloat(e.target.value || '0'))}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-4">
        <div className="text-lg font-semibold mb-2">Metas</div>
        <div className="space-y-6">
          <div>
            <div className="font-medium mb-2">Metas Mensais</div>
            <div className="max-h-[28vh] overflow-auto border border-subtle rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-grayAccent">
                    <th className="text-left p-2">KPI</th>
                    <th className="text-right p-2">Meta (mês)</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map(k => {
                    const val = mm[rowKey(dir,year,month,k.key)] || 0
                    return (
                      <tr key={k.key} className="border-t border-subtle">
                        <td className={`p-2 ${k.suggested ? 'text-red-700' : ''}`}>{k.label}</td>
                        <td className="p-2 text-right">
                          <input
                            className="input w-40 text-right"
                            type="number" min="0" step="0.01"
                            value={val}
                            onChange={e => updateMetaMensal(k.key, parseFloat(e.target.value || '0'))}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="font-medium mb-2">Metas Anuais</div>
            <div className="max-h-[28vh] overflow-auto border border-subtle rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-grayAccent">
                    <th className="text-left p-2">KPI</th>
                    <th className="text-right p-2">Meta (ano)</th>
                  </tr>
                </thead>
                <tbody>
                  {kpis.map(k => {
                    const val = ma[annualKey(dir,year,k.key)] || 0
                    return (
                      <tr key={k.key} className="border-t border-subtle">
                        <td className={`p-2 ${k.suggested ? 'text-red-700' : ''}`}>{k.label}</td>
                        <td className="p-2 text-right">
                          <input
                            className="input w-40 text-right"
                            type="number" min="0" step="0.01"
                            value={val}
                            onChange={e => updateMetaAnual(k.key, parseFloat(e.target.value || '0'))}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
