import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

import { ADAPTIVE_REPORT_SCHEMA } from './constants.js';

function fmt(value, digits = 4) {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return 'n/a';
  return Number(value).toFixed(digits);
}

function yesNo(value) {
  return value ? 'sim' : 'não';
}

function tableRows(rows = []) {
  if (!rows.length) return '_Sem dados suficientes._';
  return rows.map((row) => (
    `| ${row.stage} | ${row.action} | ${row.n} | ${fmt(row.mean_reward)} | ${fmt(row.success_rate)} | ${row.shadow_match_n} | ${fmt(row.mean_shadow_confidence)} |`
  )).join('\n');
}

export function buildAdaptiveGovernanceReport({
  evaluation,
  readiness,
  drift,
  ledger,
  metadata = {},
} = {}) {
  if (!evaluation || typeof evaluation !== 'object') throw new TypeError('evaluation é obrigatória');
  if (!readiness || typeof readiness !== 'object') throw new TypeError('readiness é obrigatória');

  const generatedAt = metadata.generatedAt ?? new Date().toISOString();
  const deltaCI = evaluation.estimate?.estimated_reward_delta_ci95 ?? {};
  const reasons = readiness.reasons?.length
    ? readiness.reasons.map((reason) => `- ${reason}`).join('\n')
    : '- nenhum bloqueio de readiness';

  const markdown = `# Adaptive Governance Report\n\n`
    + `**Schema:** \`${ADAPTIVE_REPORT_SCHEMA}\`  \n`
    + `**Gerado em:** ${generatedAt}  \n`
    + `**Projeto:** ${metadata.project ?? 'ReversaFeynman'}  \n`
    + `**Política avaliada:** ${metadata.policy ?? 'contextual-shadow-v1'}\n\n`
    + `> Este relatório é uma avaliação offline observacional. Ele não demonstra efeito causal e não autoriza execução automática.\n\n`
    + `## Resumo de governança\n\n`
    + `| Indicador | Valor |\n|---|---:|\n`
    + `| Registros totais | ${evaluation.total_records ?? 0} |\n`
    + `| Registros de treino | ${evaluation.train_records ?? 0} |\n`
    + `| Registros holdout | ${evaluation.holdout_records ?? 0} |\n`
    + `| Shadow matches | ${evaluation.shadow?.matched_n ?? 0} |\n`
    + `| Shadow coverage | ${fmt(evaluation.shadow?.coverage)} |\n`
    + `| Agreement baseline × shadow | ${fmt(evaluation.shadow?.agreement_with_baseline)} |\n`
    + `| Brier | ${fmt(evaluation.calibration?.brier)} |\n`
    + `| ECE | ${fmt(evaluation.calibration?.ece)} |\n`
    + `| Estimated baseline reward | ${fmt(evaluation.estimate?.estimated_baseline_reward)} |\n`
    + `| Estimated shadow reward | ${fmt(evaluation.estimate?.estimated_shadow_reward)} |\n`
    + `| Estimated reward delta | ${fmt(evaluation.estimate?.estimated_reward_delta)} |\n`
    + `| Delta IC95% | [${fmt(deltaCI.low)}, ${fmt(deltaCI.high)}] |\n`
    + `| Estimated baseline regret | ${fmt(evaluation.estimate?.estimated_baseline_regret)} |\n`
    + `| Estimated shadow regret | ${fmt(evaluation.estimate?.estimated_shadow_regret)} |\n`
    + `| Drift detectado | ${yesNo(drift?.detected)} |\n`
    + `| Ledger válido | ${yesNo(ledger?.valid)} |\n`
    + `| Elegível para solicitar ativação | ${yesNo(readiness.eligible_for_activation_request)} |\n`
    + `| Auto-ativação | não |\n\n`
    + `## Bloqueios / critérios\n\n${reasons}\n\n`
    + `## Matriz de desempenho — treino\n\n`
    + `| Estágio | Ação | N | Reward médio | Success rate | Shadow matches | Confiança shadow |\n`
    + `|---|---|---:|---:|---:|---:|---:|\n`
    + `${tableRows(evaluation.training_matrix)}\n\n`
    + `## Matriz de desempenho — holdout\n\n`
    + `| Estágio | Ação | N | Reward médio | Success rate | Shadow matches | Confiança shadow |\n`
    + `|---|---|---:|---:|---:|---:|---:|\n`
    + `${tableRows(evaluation.holdout_matrix)}\n\n`
    + `## Interpretação\n\n`
    + `- Brier e ECE são calculados somente onde a ação proposta pela shadow policy coincide com a ação realmente executada e o outcome binário está disponível.\n`
    + `- Reward/regret estimados usam médias de ação obtidas no bloco de treino e são avaliados no holdout temporal.\n`
    + `- O IC95% bootstrap é determinístico para reprodutibilidade, mas não transforma a estimativa observacional em evidência causal.\n`
    + `- Mesmo quando readiness é positiva, a próxima etapa é apenas \`requestPolicyActivation()\`; os gates v2 continuam obrigatórios.\n`
    + `- \`OBSERVED\` continua sob autoridade exclusiva do Evidence Guard.\n\n`
    + `## Caveats registrados pela avaliação\n\n`
    + `${(evaluation.caveats ?? []).map((item) => `- ${item}`).join('\n') || '- nenhum caveat adicional'}\n`;

  return Object.freeze({
    schema: ADAPTIVE_REPORT_SCHEMA,
    generated_at: generatedAt,
    markdown,
    suggested_path: '_reversa_sdd/adaptive/governance-report.md',
  });
}

export async function writeAdaptiveGovernanceReport(report, {
  rootDir = process.cwd(),
  relativePath = '_reversa_sdd/adaptive/governance-report.md',
} = {}) {
  if (!report || typeof report.markdown !== 'string') throw new TypeError('report.markdown é obrigatório');
  if (typeof relativePath !== 'string' || !relativePath.trim()) throw new TypeError('relativePath inválido');

  const root = resolve(rootDir);
  const target = resolve(root, relativePath);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new TypeError('relativePath não pode escapar de rootDir');
  }

  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, report.markdown, 'utf8');
  return Object.freeze({ written: true, path: target, schema: report.schema });
}
