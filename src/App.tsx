import React, { useState } from 'react'
import { diretoriaList, Diretoria } from './data/kpis'
import DirectorateEntry from './components/DirectorateEntry'
import DashboardDirectorate from './components/DashboardDirectorate'
import DashboardGeral from './components/DashboardGeral'
import DirectorateCharts from './components/DirectorateCharts'
import { exportAll, importAll } from './lib/storage'
import { Download, Upload } from 'lucide-react'

export default function App(){
  const today = new Date()
  const [year, setYear] = useState<number>(today.getFullYear())
  const [month, setMonth] = useState<number>(today.getMonth()+1)
  const [tab, setTab] = useState<'geral'|'dir'>('geral')
  const [dir, setDir] = useState<Diretoria>('DPA')

  function doExport(){
    const json = JSON.stringify(exportAll(), null, 2)
    const blob = new Blob([json], {type: 'application/json'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `indicadores_export_${year}-${String(month).padStart(2,'0')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  function doImport(e: React.ChangeEvent<HTMLInputElement>){
    const file = e.target.files?.[0]; if(!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result))
        importAll(payload)
        alert('Dados importados com sucesso. Recarregue as telas para ver.')
      } catch(e){
        alert('Arquivo inválido.')
      }
    }
    reader.readAsText(file)
    e.currentTarget.value = ''
  }

  return (
    <div className="min-h-screen">
      <header className="app-header px-6 py-5 shadow-soft">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/10" title="LOGO AQUI"></div>
            <div className="text-xl font-semibold">Indicadores SMGAS — Painel Web</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="badge bg-white">
              <span className="text-gray-700">Ano</span>
              <input className="input w-24 ml-2" type="number" value={year} onChange={e=>setYear(parseInt(e.target.value||'0'))} />
            </div>
            <div className="badge bg-white">
              <span className="text-gray-700">Mês</span>
              <input className="input w-20 ml-2" type="number" min={1} max={12} value={month} onChange={e=>setMonth(parseInt(e.target.value||'0'))} />
            </div>
            <button className="btn-ghost flex items-center gap-2" onClick={doExport}><Download size={16}/> Exportar</button>
            <label className="btn-ghost flex items-center gap-2 cursor-pointer">
              <Upload size={16}/> Importar
              <input type="file" accept="application/json" className="hidden" onChange={doImport}/>
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <div className="card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className={`btn-ghost ${tab==='geral'?'ring-2 ring-tealbrand':''}`} onClick={()=>setTab('geral')}>Dashboard Geral</button>
            <button className={`btn-ghost ${tab==='dir'?'ring-2 ring-tealbrand':''}`} onClick={()=>setTab('dir')}>Diretoria</button>
          </div>
          <div className="flex items-center gap-3">
            <select className="select" value={dir} onChange={e=>setDir(e.target.value as Diretoria)}>
              {diretoriaList.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {tab==='geral' ? (
          <DashboardGeral year={year} month={month} />
        ) : (
          <div className="space-y-6">
            <DirectorateEntry dir={dir} year={year} month={month} />
            <DashboardDirectorate dir={dir} year={year} month={month} />
            <DirectorateCharts dir={dir} year={year} />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-gray-500 py-8">
        Tema moderno cinza + verde-azulado • KPIs sugeridos destacados em vermelho • v1.0 SPA
      </footer>
    </div>
  )
}
