export type Diretoria = 'DPA' | 'DPB' | 'DSA' | 'DPBEA' | 'DJU' | 'DFI' | 'DAGP' | 'Gabinete';

export const baseKPIs: Record<Diretoria, string[]> = {
  DPA: [
    "quantas multas aplicadas (com temas) mês a mês",
    "quantas visitas de fiscalização realizadas mês a mês por tema e por fiscal",
    "quantos processos de loteamento iniciados/finalizados mês a mês, número do empreendedor",
    "quantos licenciamentos iniciados/finalizados, indeferidos, deferidos mês a mês",
    "tipos de licenciamentos indeferidos/defeitos mês a mês, nome do empreendedor",
    "quantos processos aprovados no CODEMA mês a mês",
    "Qtde autorização de supressão de árvores mês a mês (zona, espécie)",
    "Quantidade de árvores plantadas mês a mês (zona, espécie, empreendedor)",
    "nº de ligações recebidas no canal 0800 de fiscalização",
    "Quantidade de eventos aprovados em áreas públicas (praças) mês a mês",
    "Quantidade de dias de Operação Eirene mês a mês (quantidade de fiscais, locais visitados e autuações emitidas)",
    "Quantidade de processos DPA em andamento mês a mês",
    "Quantidade de processos DPA congelados/pendentes mês a mês",
    "Quantidade de processos DPA em monitoramento mês a mês",
  ],
  DPB: [
    "quantas praças reformadas",
    "quantas mudas doadas mês a mês",
    "quantas mudas existentes no horto mês a mês (por tipo)",
    "Qtde autorização de supressão de árvores mês a mês (zona, espécie)",
    "Qtde de árvores podadas mês a mês",
    "quantas praças lavadas mês a mês",
    "quantas praças limpas",
    "qtd de parquinhos/academias instalados mês a mês",
    "Quantidade de árvores plantadas mês a mês (zona, espécie, projeto)",
  ],
  DSA: [
    "quantos processos de adoção de praça iniciados/finalizados mês a mês",
    "quantas visitas de monitoramentos de praças realizadas mês a mês com nome da praça",
    "quantos projetos de praças iniciados/finalizados mês a mês, chame do projeto",
    "quantas praças adotadas mês a mês – qtd de processos DPA em andamento",
    "nº de atendimentos NEA mês a mês (pessoas, escolas, parques, eventos)",
    "nº de eventos DSA realizados e público participante mês a mês",
    "áreas degradadas recuperadas",
    "lista de parcerias e projetos DSA em andamento/finalizados",
    "Quantidade de Emendas Parlamentares vigentes (valor, autor e status)",
    "Eventos DAS realizados e público alcançado",
  ],
  DPBEA: [
    "nº visitas Zoo mês a mês",
    "Quantidade de animais no Zoo mês a mês",
    "Custo Zoo por visita – mês a mês",
    "Fauna doméstica castrada mês a mês",
    "Quantidade de animais atendidos contrato UFU x valor (mês a mês)",
    "Peso de ração de gato recebida",
    "Peso de ração de cães recebida",
    "Peso de ração de gato doada",
    "Peso de ração de cães recebidas",
    "Quantidade de denúncia de maus tratos recebidas mês a mês",
    "Quantidade de visitas/fiscalização/inspeção de maus tratos mês a mês",
    "Quantidade de Cães e Gatos doados mês a mês",
    "OSCs apoiadas pela SMGAS (nomes, valor doado, qtde animais)",
    "Quantidade de Emendas Parlamentares vigentes (valor, autor e status)",
    "nº de eventos DSA realizados e público participante mês a mês",
  ],
  DJU: [
    "Processos judiciais vigentes / iniciados / finalizados mês a mês",
    "Processos judiciais ganhos / perdas",
    "Quantidade de Publicações SMGAS no Diário Oficial mês a mês",
    "Quantidade de Editais publicados mês a mês",
    "Quantidade de pendência com MP",
  ],
  DFI: [
    "Valores orçados x realizados mês a mês",
    "Quantidade de contratos ativos",
    "Quantidade de pagamentos pendentes (aging / fornecedor)",
    "Quantidade de visitas de fiscalização de contratos a praças, número de infrações e valor de glosa",
  ],
  DAGP: [
    "qtd de servidores de férias/licença/afastados/ativos/emprestado/aposentado mês a mês (afastados)",
    "nº de reclamações SMGA – ouvidoria / SIM / outras",
    "lista de projetos (plano de Governo e Plano Estratégico) sem início / pendentes / finalizados",
    "nº de pedidos de vereadores mês a mês",
    "Quantidade de documentos protocolados (entrada/saída/pendente) mês a mês",
    "Quantidade de pendências com governo",
    "Quantidade de pendências com vereadores",
    "Quantidade de pedidos feitos para a SECOM mês a mês",
    "Qtde pedido de informação / nota imprensa /",
  ],
  Gabinete: [
    "Eventos prestigiados mês a mês",
    "Entrevistas concedidas mês a mês finalizadas com nome da praça",
    "Qtde de visitas técnicas em praças: nome técnico e praça",
    "Quantidade de projetos de praças iniciadas /  finalizada",
  ]
};

export const suggestedKPIs: Record<Diretoria, string[]> = {
  DPA: [
    "Tempo médio de análise/licenciamento (dias)",
    "% de processos dentro do SLA",
    "Backlog de processos (em aberto no fim do mês)",
    "Taxa de deferimento/indeferimento (%)",
    "Autuações por visita (%)",
    "Reincidência de infrações (%)",
  ],
  DPB: [
    "Sobrevivência de mudas após 90/180 dias (%)",
    "% da área programada de roçagem executada",
    "Tempo médio de reforma por praça (dias)",
    "Custo por praça mantida/reformada (R$)",
    "% de espécies nativas nos plantios",
    "Índice de limpeza programada realizada (%)",
  ],
  DSA: [
    "Tempo médio da adoção (proposta → assinatura)",
    "% de projetos no prazo / no orçamento",
    "Captação de recursos por parceria/emenda (R$)",
    "% de metas de educação ambiental cumpridas",
    "Satisfação de parceiros (NPS/nota)",
  ],
  DPBEA: [
    "Taxa de adoção por entrada (%)",
    "Tempo médio de permanência no abrigo (dias)",
    "% de castrações com microchip/vacinação em dia",
    "% de denúncias atendidas dentro do SLA",
    "Custo por animal/dia (R$)",
    "Taxa de readmissão pós-adoção (%)",
  ],
  DJU: [
    "Tempo médio para parecer/manifestação (dias)",
    "% de demandas concluídas no prazo",
    "Taxa de êxito por assunto (%)",
    "Backlog jurídico (pendentes por fase)",
    "Economia/risco evitado estimado (R$)",
  ],
  DFI: [
    "Execução orçamentária (%) mês/YTD",
    "Prazo médio de pagamento – DPP (dias)",
    "Contratos a vencer ≤ 90 dias (qtd/valor)",
    "Glosas aplicadas/evitadas (R$)",
    "Economias em compras/negociações (R$)",
  ],
  DAGP: [
    "Tempo médio de tramitação de documentos (dias)",
    "% de documentos/pedidos respondidos no SLA",
    "Absenteísmo (%)",
    "Rotatividade (%)",
    "Horas de treinamento por servidor",
    "Tempo médio de resposta à Ouvidoria/SIM (dias)",
    "% de pedidos de vereadores atendidos no prazo",
  ],
  Gabinete: [
    "Tempo médio de resposta a demandas da imprensa (h/dias)",
    "Alcance estimado das ações de comunicação (impressões/público)",
    "% de agenda estratégica cumprida (planejado x realizado)",
    "Satisfação de stakeholders pós-evento (nota)",
    "Custo médio por evento (R$)",
  ],
};

export const diretoriaList: Diretoria[] = ["DPA","DPB","DSA","DPBEA","DJU","DFI","DAGP","Gabinete"];

export const allKPIsByDir: Record<Diretoria, { label: string; key: string; suggested: boolean }[]> =
  Object.fromEntries(diretoriaList.map(d => {
    const base = baseKPIs[d].map(l => ({ label: l, key: slug(l), suggested: false }));
    const sug  = suggestedKPIs[d].map(l => ({ label: l, key: slug(l), suggested: true }));
    return [d, [...base, ...sug]];
  })) as Record<Diretoria, { label: string; key: string; suggested: boolean }[]>;

export function slug(s: string){
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'').slice(0,50);
}
