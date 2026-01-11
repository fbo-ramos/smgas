-- Ensure pgcrypto for crypt()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Seed: directorates
INSERT INTO directorates (code,name) VALUES
('DPA','Diretoria A'),
('DPB','Diretoria B'),
('DSA','Diretoria S'),
('DPBEA','Diretoria PB/EA'),
('DJU','Diretoria Jurídica'),
('DFI','Diretoria Financeira'),
('DAGP','Diretoria Administrativa e de Processos'),
('GAB','Gabinete')
ON CONFLICT (code) DO NOTHING;

-- Seed: admin user
INSERT INTO users (email, password_hash, role) VALUES ('admin@smgas.local', crypt('Admin@123', gen_salt('bf')), 'ADMIN') ON CONFLICT (email) DO NOTHING;

-- Map directorate codes to ids
WITH dirs AS (SELECT id, code FROM directorates)
-- Create user_directorates for admin
INSERT INTO user_directorates (user_id, directorate_id, can_edit)
SELECT u.id, d.id, true FROM users u CROSS JOIN dirs d WHERE u.email='admin@smgas.local'
ON CONFLICT DO NOTHING;

-- Seed: KPIs (70). These are synthetic but follow mapping counts per request.
-- DPA: 1..14
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DPA_01_MULTAS_APLICADAS','Multas aplicadas','qtd','LOWER_IS_BETTER'),
('DPA_02_ATENDIMENTOS_REALIZADOS','Atendimentos realizados','qtd','HIGHER_IS_BETTER'),
('DPA_03_PROCESSOS_ANALISADOS','Processos analisados','qtd','HIGHER_IS_BETTER'),
('DPA_04_PENDENCIAS_RESOLVIDAS','Pendências resolvidas','qtd','HIGHER_IS_BETTER'),
('DPA_05_RECLAMACOES_RECEBIDAS','Reclamações recebidas','qtd','LOWER_IS_BETTER'),
('DPA_06_TEMPO_MEDIO_ATENDIMENTO','Tempo médio de atendimento (min)','qtd','LOWER_IS_BETTER'),
('DPA_07_DOCUMENTOS_EMITIDOS','Documentos emitidos','qtd','HIGHER_IS_BETTER'),
('DPA_08_CUSTO_POR_PROCESSO','Custo por processo (R$)','R$','LOWER_IS_BETTER'),
('DPA_09_TAXA_CONFORMIDADE','Taxa de conformidade (%)','qtd','HIGHER_IS_BETTER'),
('DPA_10_EVENTOS_REALIZADOS','Eventos realizados','qtd','HIGHER_IS_BETTER'),
('DPA_11_CAPACITACOES','Capacitações realizadas','qtd','HIGHER_IS_BETTER'),
('DPA_12_RECURSOS_APROVADOS','Recursos aprovados','qtd','HIGHER_IS_BETTER'),
('DPA_13_PRAZOS_CUMPRIDOS','Prazos cumpridos (%)','qtd','HIGHER_IS_BETTER'),
('DPA_14_INCIDENTES_REGISTRADOS','Incidentes registrados','qtd','LOWER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DPA' ON CONFLICT (key) DO NOTHING;

-- DPB: 15..23
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DPB_15_FISCALIZACOES','Fiscalizações realizadas','qtd','HIGHER_IS_BETTER'),
('DPB_16_AUTO_DE_INFRACAO','Auto de infração','qtd','LOWER_IS_BETTER'),
('DPB_17_PESQUISAS_SATISFACAO','Pesquisas de satisfação','qtd','HIGHER_IS_BETTER'),
('DPB_18_NOTIFICACOES_EMITIDAS','Notificações emitidas','qtd','HIGHER_IS_BETTER'),
('DPB_19_AJUDA_FINANCEIRA','Ajuda financeira (R$)','R$','HIGHER_IS_BETTER'),
('DPB_20_PARCELAMENTOS_CONCEDIDOS','Parcelamentos concedidos','qtd','HIGHER_IS_BETTER'),
('DPB_21_PROCESSOS_FISCAIS','Processos fiscais','qtd','LOWER_IS_BETTER'),
('DPB_22_TAXA_RECUPERACAO','Taxa de recuperação (%)','qtd','HIGHER_IS_BETTER'),
('DPB_23_RISCO_LEGAL','Risco legal (casos)','qtd','LOWER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DPB' ON CONFLICT (key) DO NOTHING;

-- DSA: 24..33
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DSA_24_RACAO_DISTRIBUIDA','Ração distribuída','kg','HIGHER_IS_BETTER'),
('DSA_25_CASTRACOES','Castrações realizadas','qtd','HIGHER_IS_BETTER'),
('DSA_26_ANIMAIS_ATENDIDOS','Animais atendidos','qtd','HIGHER_IS_BETTER'),
('DSA_27_VACINACOES','Vacinações aplicadas','qtd','HIGHER_IS_BETTER'),
('DSA_28_RESGATES','Resgates realizados','qtd','HIGHER_IS_BETTER'),
('DSA_29_ADOCOES','Adoções efetivadas','qtd','HIGHER_IS_BETTER'),
('DSA_30_ABRIGOS_OCUPADOS','Abrigos ocupados','qtd','HIGHER_IS_BETTER'),
('DSA_31_INCIDENTES_VIOLENCIA','Incidentes de violência','qtd','LOWER_IS_BETTER'),
('DSA_32_RECLAMACOES_SOCIAIS','Reclamações sociais','qtd','LOWER_IS_BETTER'),
('DSA_33_VOLUNTARIOS_ATIVOS','Voluntários ativos','qtd','HIGHER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DSA' ON CONFLICT (key) DO NOTHING;

-- DPBEA: 34..48
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DPBEA_34_OBRAS_CONCLUIDAS','Obras concluídas','qtd','HIGHER_IS_BETTER'),
('DPBEA_35_PRAZAS_REFORMADAS','Praças reformadas','qtd','HIGHER_IS_BETTER'),
('DPBEA_36_ARVORES_PLANTADAS','Árvores plantadas','qtd','HIGHER_IS_BETTER'),
('DPBEA_37_MANUTENCOES','Manutenções realizadas','qtd','HIGHER_IS_BETTER'),
('DPBEA_38_RECLAMACOES_OBRAS','Reclamações sobre obras','qtd','LOWER_IS_BETTER'),
('DPBEA_39_INVESTIMENTO_OBRAS','Investimento em obras (R$)','R$','HIGHER_IS_BETTER'),
('DPBEA_40_VAGAS_IMPLANTADAS','Vagas implantadas','qtd','HIGHER_IS_BETTER'),
('DPBEA_41_ENQUADRAMENTO_AMBIENTAL','Enquadramento ambiental','qtd','HIGHER_IS_BETTER'),
('DPBEA_42_INCIDENTES_OBRAS','Incidentes em obras','qtd','LOWER_IS_BETTER'),
('DPBEA_43_CONTRATOS_VIGENTES','Contratos vigentes','qtd','HIGHER_IS_BETTER'),
('DPBEA_44_FISCALIZACOES_OBRAS','Fiscalizações em obras','qtd','HIGHER_IS_BETTER'),
('DPBEA_45_PRAZOS_OBRAS','Prazos cumpridos em obras (%)','qtd','HIGHER_IS_BETTER'),
('DPBEA_46_QUALIDADE_SERVICO','Qualidade do serviço (%)','qtd','HIGHER_IS_BETTER'),
('DPBEA_47_APROVACAO_PROJETOS','Aprovação de projetos','qtd','HIGHER_IS_BETTER'),
('DPBEA_48_REJEICOES_PROJETOS','Rejeições de projetos','qtd','LOWER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DPBEA' ON CONFLICT (key) DO NOTHING;

-- DJU: 49..53
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DJU_49_PROCESSOS_JUDICIAIS','Processos judiciais','qtd','LOWER_IS_BETTER'),
('DJU_50_ACOES_PREVENTIVAS','Ações preventivas','qtd','HIGHER_IS_BETTER'),
('DJU_51_PARECERES_EMITIDOS','Pareceres emitidos','qtd','HIGHER_IS_BETTER'),
('DJU_52_CUSTOS_LEGAIS','Custos legais (R$)','R$','LOWER_IS_BETTER'),
('DJU_53_TEMPO_MEDIO_PROCESSO','Tempo médio por processo (dias)','qtd','LOWER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DJU' ON CONFLICT (key) DO NOTHING;

-- DFI: 54..57
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DFI_54_ARRECADACAO','Arrecadação (R$)','R$','HIGHER_IS_BETTER'),
('DFI_55_DESPESAS','Despesas (R$)','R$','LOWER_IS_BETTER'),
('DFI_56_INADIMPLENCIA','Inadimplência (%)','qtd','LOWER_IS_BETTER'),
('DFI_57_EXECUCAO_ORCAMENTARIA','Execução orçamentária (%)','qtd','HIGHER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DFI' ON CONFLICT (key) DO NOTHING;

-- DAGP: 58..66
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('DAGP_58_PESSOAL_CONTRATADO','Pessoal contratado','qtd','HIGHER_IS_BETTER'),
('DAGP_59_TEMPO_MEDIO_RECRUTAMENTO','Tempo médio recrutamento (dias)','qtd','LOWER_IS_BETTER'),
('DAGP_60_CUSTO_PESSOAL','Custo de pessoal (R$)','R$','LOWER_IS_BETTER'),
('DAGP_61_TREINAMENTOS','Treinamentos realizados','qtd','HIGHER_IS_BETTER'),
('DAGP_62_APONTAMENTOS','Apontamentos processuais','qtd','HIGHER_IS_BETTER'),
('DAGP_63_PROCESSOS_ADMINISTRATIVOS','Processos administrativos','qtd','LOWER_IS_BETTER'),
('DAGP_64_EFICIENCIA_OPERACIONAL','Eficiência operacional (%)','qtd','HIGHER_IS_BETTER'),
('DAGP_65_SEGUIMENTO_NORMATIVO','Seguimento normativo (%)','qtd','HIGHER_IS_BETTER'),
('DAGP_66_INDICADORES_INTERNOS','Indicadores internos','qtd','HIGHER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='DAGP' ON CONFLICT (key) DO NOTHING;

-- GAB: 67..70
INSERT INTO kpis (directorate_id, key, label, unit, polarity, suggested)
SELECT d.id, k.key, k.label, k.unit, k.polarity, true FROM directorates d, (VALUES
('GAB_67_PROGRAMAS_GOVERNAMENTAIS','Programas governamentais','qtd','HIGHER_IS_BETTER'),
('GAB_68_REPASSE_FUNDOS','Repasse de fundos (R$)','R$','HIGHER_IS_BETTER'),
('GAB_69_COMPROMISSO_AGENDA','Compromissos da agenda','qtd','HIGHER_IS_BETTER'),
('GAB_70_TRANSPARENCIA','Transparência pública (%)','qtd','HIGHER_IS_BETTER')
) AS k(key,label,unit,polarity) WHERE d.code='GAB' ON CONFLICT (key) DO NOTHING;

-- End seed
