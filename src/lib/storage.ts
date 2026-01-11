import { Diretoria, allKPIsByDir } from '../data/kpis'

export type ResultsStore = Record<string, number>;
export type MonthlyMetaStore = Record<string, number>;
export type AnnualMetaStore = Record<string, number>;

const RESULTS_KEY = 'smgas_results_v1';
const METAS_M_KEY = 'smgas_metas_mensais_v1';
const METAS_A_KEY = 'smgas_metas_anuais_v1';

export function loadStores(){
  const r = JSON.parse(localStorage.getItem(RESULTS_KEY) || '{}') as ResultsStore;
  const mm = JSON.parse(localStorage.getItem(METAS_M_KEY) || '{}') as MonthlyMetaStore;
  const ma = JSON.parse(localStorage.getItem(METAS_A_KEY) || '{}') as AnnualMetaStore;
  return { r, mm, ma };
}

export function saveStores(r: ResultsStore, mm: MonthlyMetaStore, ma: AnnualMetaStore){
  localStorage.setItem(RESULTS_KEY, JSON.stringify(r));
  localStorage.setItem(METAS_M_KEY, JSON.stringify(mm));
  localStorage.setItem(METAS_A_KEY, JSON.stringify(ma));
}

export function rowKey(dir: Diretoria, year: number, month: number, k: string){
  return `${dir}|${year}|${month}|${k}`;
}
export function annualKey(dir: Diretoria, year: number, k: string){
  return `${dir}|${year}|${k}`;
}

export function sumResultsForMonth(dir: Diretoria, year: number, month: number, kpis?: string[]){
  const { r } = loadStores();
  const list = (kpis && kpis.length>0)? kpis : allKPIsByDir[dir].map(x=>x.key);
  return list.reduce((acc,k)=> acc + (r[rowKey(dir,year,month,k)] || 0), 0);
}

export function sumMetasForMonth(dir: Diretoria, year: number, month: number, kpis?: string[]){
  const { mm } = loadStores();
  const list = (kpis && kpis.length>0)? kpis : allKPIsByDir[dir].map(x=>x.key);
  return list.reduce((acc,k)=> acc + (mm[rowKey(dir,year,month,k)] || 0), 0);
}

export function ytdSumForKPI(dir: Diretoria, year: number, month: number, k: string){
  const { r } = loadStores();
  let s = 0;
  for(let m=1; m<=month; m++){
    s += r[rowKey(dir,year,m,k)] || 0;
  }
  return s;
}

export function getAnnualMeta(dir: Diretoria, year: number, k: string){
  const { ma } = loadStores();
  return ma[annualKey(dir,year,k)] || 0;
}

export function exportAll(){
  const { r, mm, ma } = loadStores();
  return { results: r, metasMensais: mm, metasAnuais: ma };
}

export function importAll(payload: any){
  const r = payload?.results || {};
  const mm = payload?.metasMensais || {};
  const ma = payload?.metasAnuais || {};
  saveStores(r,mm,ma);
}
