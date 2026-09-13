import { existsSync, readFileSync, writeFileSync, appendFileSync } from 'fs';
import { join, resolve } from 'path';
import { checkExistingInstallation } from '../installer/validator.js';
import { renderLegacyEditPolicyParagraph } from '../installer/policy.js';
import { loadManifest, saveManifest, buildManifest, fileStatus } from '../installer/manifest.js';
import { Writer } from '../installer/writer.js';
import { ENGINES } from '../installer/detector.js';
import { listAllAgents } from '../installer/prompts.js';
import { applyOrangeTheme, ORANGE_PREFIX } from '../installer/orange-prompts.js';
import { readJsonSafe } from '../utils/json-safe.js';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const SOURCE_VERSION = pkg.version;
const DISTRIBUTION = 'MarceloClaro/reversaFeynman';
const INSTALL_COMMAND = 'npm exec --yes --package=github:MarceloClaro/reversaFeynman -- reversa install';

export default async function update(args) {
  const { default: chalk } = await import('chalk');
  const { default: ora } = await import('ora');
  const { default: semver } = await import('semver');

  const projectRoot = resolve(process.cwd());

  console.log(chalk.bold('\n  ReversaFeynman: Update — MarceloClaro independent edition\n'));

  const existing = checkExistingInstallation(projectRoot);
  if (!existing.installed) {
    console.log(chalk.yellow('  ReversaFeynman is not installed in this directory.'));
    console.log('  Run ' + chalk.bold(INSTALL_COMMAND) + ' to install.\n');
    return;
  }

  const installedVersion = existing.version;

  if (!semver.valid(installedVersion)) {
    console.log(chalk.yellow(`  Invalid installed version: "${installedVersion}". Run ${INSTALL_COMMAND} to fix it.\n`));
    return;
  }

  if (!semver.valid(SOURCE_VERSION)) {
    throw new Error(`Invalid source package version: "${SOURCE_VERSION}"`);
  }

  // A edição ReversaFeynman é deliberadamente independente: não consulta npm,
  // GitHub upstream nem qualquer registro remoto para decidir a versão.
  // A fonte de verdade é a distribuição que está executando este comando.
  console.log(chalk.gray(`  Installed version: v${installedVersion}`));
  console.log(chalk.gray(`  Source package:    v${SOURCE_VERSION} (${DISTRIBUTION})`));

  if (semver.lt(installedVersion, SOURCE_VERSION)) {
    console.log(chalk.hex('#ffa203')('  A newer ReversaFeynman distribution is being applied.\n'));
  } else if (semver.gt(installedVersion, SOURCE_VERSION)) {
    console.log(chalk.yellow('  Installed metadata is newer than this source package; managed files will still be refreshed from the current ReversaFeynman distribution.\n'));
  } else {
    console.log(chalk.gray('  Same package version; managed files and newly added agents will still be reconciled from this distribution.\n'));
  }

  const manifest = loadManifest(projectRoot);
  const state = existing.state;
  const allAgents = listAllAgents();
  const installedEngineIds = state.engines ?? [];
  const installedEngines = ENGINES.filter(e => installedEngineIds.includes(e.id));

  const modified = [];
  const intact = [];
  const missing = [];

  for (const [relPath, hash] of Object.entries(manifest)) {
    const status = fileStatus(projectRoot, relPath, hash);
    if (status === 'modified') modified.push(relPath);
    else if (status === 'missing') missing.push(relPath);
    else intact.push(relPath);
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`  ${modified.length} file(s) modified by you, will be kept:`));
    modified.forEach(f => console.log(chalk.gray(`    ✎  ${f}`)));
    console.log('');
  }
  if (missing.length > 0) {
    console.log(chalk.cyan(`  ${missing.length} missing file(s), will be restored:`));
    missing.forEach(f => console.log(chalk.gray(`    +  ${f}`)));
    console.log('');
  }

  const toUpdate = intact.length + missing.length;
  console.log(`  ${toUpdate} tracked file(s) are eligible for refresh.`);
  console.log(chalk.gray('  New agents present in this distribution are also considered, even when they are not yet in the old manifest.\n'));

  const { default: inquirer } = await import('inquirer');
  applyOrangeTheme();
  const { confirm } = await inquirer.prompt([{
    prefix: ORANGE_PREFIX,
    type: 'confirm',
    name: 'confirm',
    message: `\nConfirm update from ${DISTRIBUTION}?`,
    default: true,
  }]);
  if (!confirm) {
    console.log(chalk.gray('\n  Update cancelled.\n'));
    return;
  }

  const writer = new Writer(projectRoot);
  let configCreated = false;
  const appendedTo = [];
  const updateSpinner = ora({ text: 'Updating agents from local ReversaFeynman distribution...', color: 'cyan' }).start();

  try {
    for (const agent of allAgents) {
      for (const engine of installedEngines) {
        const relDir = join(engine.skillsDir, agent).replace(/\\/g, '/');
        const isModified = modified.some(f => f.replace(/\\/g, '/').startsWith(relDir));
        if (!isModified) {
          const { rmSync } = await import('fs');
          const dest = join(projectRoot, engine.skillsDir, agent);
          if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
          await writer.installSkill(agent, engine.skillsDir);
        }

        if (engine.universalSkillsDir && engine.universalSkillsDir !== engine.skillsDir) {
          const uRelDir = join(engine.universalSkillsDir, agent).replace(/\\/g, '/');
          const uIsModified = modified.some(f => f.replace(/\\/g, '/').startsWith(uRelDir));
          if (!uIsModified) {
            const { rmSync } = await import('fs');
            const uDest = join(projectRoot, engine.universalSkillsDir, agent);
            if (existsSync(uDest)) rmSync(uDest, { recursive: true, force: true });
            await writer.installSkill(agent, engine.universalSkillsDir);
          }
        }
      }
    }

    updateSpinner.text = 'Refreshing forward assets...';

    const modifiedSet = new Set(modified.map(f => f.replace(/\\/g, '/')));
    writer.refreshForwardAssets(modifiedSet);

    updateSpinner.text = 'Updating entry files...';

    for (const engine of installedEngines) {
      const relEntry = engine.entryFile;
      const hash = manifest[relEntry];
      if (!hash) continue;
      const status = fileStatus(projectRoot, relEntry, hash);
      if (status === 'intact' || status === 'missing') {
        await writer.installEntryFile(engine, {
          force: true,
          outputFolder: existing.state.output_folder,
          forwardFolder: existing.state.forward_folder,
        });
      }
    }

    updateSpinner.text = 'Configuring legacy-edit policy...';

    configCreated = writer.ensureReversaConfig();
    writer.installPolicyHooks();

    for (const engine of installedEngines) {
      if (!engine.entryFile) continue;
      const entryPath = join(projectRoot, engine.entryFile);
      if (!existsSync(entryPath)) continue;
      const content = readFileSync(entryPath, 'utf8');
      if (content.includes('reversa-config.json')) continue;
      appendFileSync(
        entryPath,
        '\n\n## Política de edição do legado (ReversaFeynman)\n\n' + renderLegacyEditPolicyParagraph() + '\n',
        'utf8'
      );
      appendedTo.push(engine.entryFile);
    }

    updateSpinner.text = 'Updating version metadata...';

    {
      const statePath = join(projectRoot, '.reversa', 'state.json');
      const s = readJsonSafe(statePath);
      s.agents = allAgents;
      writeFileSync(join(projectRoot, '.reversa', 'version'), SOURCE_VERSION, 'utf8');
      s.version = SOURCE_VERSION;
      s.distribution = DISTRIBUTION;
      writeFileSync(statePath, JSON.stringify(s, null, 2), 'utf8');
    }

    updateSpinner.text = 'Updating manifest...';

    writer.saveCreatedFiles();
    const newManifest = buildManifest(projectRoot, writer.manifestPaths);
    const intactEntries = Object.fromEntries(
      intact.map(r => [r, manifest[r]])
    );
    saveManifest(projectRoot, { ...intactEntries, ...newManifest });

    updateSpinner.succeed(chalk.hex('#ffa203')(`Update complete from ${DISTRIBUTION}.`));
  } catch (err) {
    updateSpinner.fail(chalk.red('Error during update.'));
    throw err;
  }

  if (modified.length > 0) {
    console.log(chalk.yellow(`\n  ${modified.length} file(s) kept (modified by you).`));
  }

  console.log(chalk.bold('\n  Distribution policy:'));
  console.log(`  Source of truth: ${DISTRIBUTION}.`);
  console.log('  No npm/upstream lookup is performed by this update command.');

  console.log(chalk.bold('\n  Legacy-edit policy:'));
  if (configCreated) {
    console.log(`  ${chalk.hex('#ffa203')('+')} .reversa/reversa-config.json created with the safe default (allowLegacyEdits: false).`);
  } else {
    console.log(chalk.gray('  .reversa/reversa-config.json already exists and was kept as is.'));
  }
  if (appendedTo.length > 0) {
    console.log(`  ${chalk.hex('#ffa203')('+')} Policy paragraph appended to: ${appendedTo.join(', ')} (your content was preserved).`);
  }
  console.log('  To let ReversaFeynman write in the legacy code, edit the file: allowLegacyEdits: true + allowedPaths with the desired globs.');
  console.log('  If your entry files carry manual exceptions, consider migrating them to allowedPaths.');
  console.log('  Optional hard enforcement for Claude Code: see .reversa/hooks/README.md');
  console.log('');
}
