import fs from 'node:fs';
import path from 'node:path';

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  throw new Error('usage: node scripts/render-reversabench-report.mjs <report.json> <output.tex>');
}

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const report = payload.report ?? payload;
if (report.schema !== 'reversa.bench.report/v1') throw new Error('invalid ReversaBench report');

const smoke = payload.smoke === true || report.confirmatory === false;
const title = smoke ? 'Engineering smoke validation' : 'Confirmatory ReversaBench results';
const disclaimer = smoke
  ? 'These rows originate from smoke or non-confirmatory data and validate the experimental pipeline only. They are not evidence of comparative superiority.'
  : 'These rows summarize non-smoke runs. Causal interpretation still requires the experimental assumptions described in the evaluation protocol.';

const esc = (value) => String(value)
  .replaceAll('\\', '\\textbackslash{}')
  .replaceAll('_', '\\_')
  .replaceAll('%', '\\%')
  .replaceAll('&', '\\&')
  .replaceAll('#', '\\#');

const rows = report.results.map((result) => {
  const ci = result.success_rate_ci95 ?? [0, 0];
  return `${esc(result.variant)} & ${result.total_runs} & ${(100 * result.success_rate).toFixed(1)}\\% & [${(100 * ci[0]).toFixed(1)}, ${(100 * ci[1]).toFixed(1)}] & ${(100 * result.regression_rate).toFixed(1)}\\% & ${(100 * result.false_observed_rate).toFixed(1)}\\% \\\\`;
}).join('\n');

const tex = `\\subsection{${title}}\n\n\\noindent\\textbf{Status.} ${disclaimer}\n\n\\begin{table}[h]\n\\centering\n\\small\n\\begin{tabular}{lrrrrr}\n\\toprule\nVariant & Runs & Success & 95\\% CI & Regression & False-Observed \\\\n\\midrule\n${rows}\n\\bottomrule\n\\end{tabular}\n\\caption{${title}. The report declares \\texttt{causal\\_claim=${report.causal_claim}} and \\texttt{evidence\\_authority=${report.evidence_authority}.}\n\\end{table}\n`;

fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
fs.writeFileSync(outputPath, tex, 'utf8');
console.log(`wrote ${outputPath}`);
