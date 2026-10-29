#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { LANGUAGE_BY_EXTENSION, loadConfig } from './config.mjs';
import { analyzeBuffer, stripText } from './index.mjs';

const require = createRequire(import.meta.url);
const fg = require('fast-glob');

const FILTER_PATH = fileURLToPath(new URL('./filter.mjs', import.meta.url));

const ATTR_BEGIN = '# >>> decomment（自动生成，请勿手改）>>>';
const ATTR_END = '# <<< decomment <<<';

const MANIFEST_DIR = '.decomment';
const MANIFEST_FILE = 'backup.json';

const EXCLUDED_ATTRIBUTES = [
  'package-lock.json',
  'npm-shrinkwrap.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  '**/*.min.js',
  '**/*.min.css',
];

const USAGE = `
decomment — 提交到 GitHub 时自动抽离注释

用法：
  node scripts/decomment/cli.mjs <命令> [选项]

命令：
  install             写入 .gitattributes 并配置 git clean 过滤器（推荐，一次性）
  uninstall           撤销 install 的全部改动
  status              查看当前是否已生效
  check [--staged]    检查仓库内容（索引）里是否还有注释；有则退出码 1（适合 CI / pre-commit）
  strip [路径...]     就地删除注释（默认处理所有已跟踪的源码文件）
  restore             用 .decomment.bak 还原 strip 的文件
  preview <文件>      把抽离结果打印到终端，不修改文件

选项：
  --dry-run           只展示将要修改的文件
  --backup            strip 时生成 <文件>.decomment.bak
  --staged            check 时检查暂存区内容（提交前钩子用）
  --quiet             减少输出
  -h, --help          显示帮助

原理：
  git clean 过滤器会在 \`git add\` 时把工作区内容转换成“无注释版本”写入仓库，
  工作区文件保持不变。因此 GitHub 上看到的是无注释代码，你本地开发时注释还在。
`.trim();

function git(args, options = {}) {
  return execFileSync('git', args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
    ...options,
  });
}

function tryGit(args, options = {}) {
  try {
    return git(args, options);
  } catch {
    return null;
  }
}

function repoRoot() {
  const output = tryGit(['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (!output) return null;
  return output.trim().replace(/\\/g, '/');
}

function listNullSeparated(output) {
  if (!output) return [];
  return Buffer.isBuffer(output)
    ? output.toString('utf8').split('\0').filter(Boolean)
    : output.split('\0').filter(Boolean);
}

function trackedFiles(root) {
  const output = tryGit(['ls-files', '-z'], { cwd: root });
  return listNullSeparated(output);
}

function stagedFiles(root) {
  const output = tryGit(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'], { cwd: root });
  return listNullSeparated(output);
}

function parseFlags(argv) {
  const options = {
    paths: [],
    staged: false,
    dryRun: false,
    backup: false,
    quiet: false,
    verbose: false,
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--staged') options.staged = true;
    else if (arg === '--dry-run') options.dryRun = true;
    else if (arg === '--backup') options.backup = true;
    else if (arg === '--quiet') options.quiet = true;
    else if (arg === '--verbose') options.verbose = true;
    else if (arg === '--help' || arg === '-h') options.help = true;
    else if (!arg.startsWith('-')) options.paths.push(arg);
  }

  return options;
}

function buildAttributeBlock() {
  const lines = [ATTR_BEGIN, '# 命中这些扩展名的文件，提交时自动抽离注释'];

  for (const ext of Object.keys(LANGUAGE_BY_EXTENSION).sort()) {
    lines.push(`*${ext} filter=decomment`);
  }

  lines.push('', '# 以下文件不处理');
  for (const name of EXCLUDED_ATTRIBUTES) {
    lines.push(`${name} -filter`);
  }
  lines.push(ATTR_END);

  return lines.join('\n');
}

function upsertBlock(content, block) {
  const begin = content.indexOf(ATTR_BEGIN);
  const end = content.indexOf(ATTR_END);

  if (begin !== -1 && end > begin) {
    return `${content.slice(0, begin)}${block}${content.slice(end + ATTR_END.length)}`;
  }

  const trimmed = content.replace(/\s*$/, '');
  return `${trimmed ? `${trimmed}\n\n` : ''}${block}\n`;
}

function commandInstall(argv) {
  const options = parseFlags(argv);
  const root = repoRoot();

  if (!root) {
    if (!options.quiet) {
      console.warn('⚠️ 当前目录不在 git 仓库内，已跳过 decomment 安装');
    }
    return 0;
  }

  const attrPath = join(root, '.gitattributes');
  const existing = existsSync(attrPath) ? readFileSync(attrPath, 'utf8') : '';
  const next = upsertBlock(existing, buildAttributeBlock());

  if (next !== existing) {
    writeFileSync(attrPath, next, 'utf8');
  }

  const nodePath = process.execPath.replace(/\\/g, '/');
  const scriptPath = FILTER_PATH.replace(/\\/g, '/');
  const filterCommand = `"${nodePath}" "${scriptPath}" %f`;

  git(['config', 'filter.decomment.clean', filterCommand], { cwd: root });
  git(['config', 'filter.decomment.required', 'false'], { cwd: root });
  tryGit(['config', '--unset', 'filter.decomment.smudge'], { cwd: root });

  if (!options.quiet) {
    console.log('✅ decomment 已安装');
    console.log(`   规则文件：.gitattributes（${Object.keys(LANGUAGE_BY_EXTENSION).length} 条扩展名规则）`);
    console.log(`   过滤器：  ${filterCommand}`);
    console.log('');
    console.log('   让已跟踪文件立即生效（只需执行一次）：');
    console.log('     git add --renormalize .');
    console.log('     git commit -m "chore: 仓库内容移除注释"');
    console.log('');
    console.log('   之后每次 git add / git commit，仓库里都不会再有注释，工作区文件不受影响。');
  }

  return 0;
}

function commandUninstall(argv) {
  const options = parseFlags(argv);
  const root = repoRoot();

  if (!root) {
    console.error('✗ 当前目录不在 git 仓库内');
    return 1;
  }

  const attrPath = join(root, '.gitattributes');
  if (existsSync(attrPath)) {
    const content = readFileSync(attrPath, 'utf8');
    const begin = content.indexOf(ATTR_BEGIN);
    const end = content.indexOf(ATTR_END);

    if (begin !== -1 && end > begin) {
      const next = `${content.slice(0, begin)}${content.slice(end + ATTR_END.length)}`.replace(/\s*$/, '');
      if (next) {
        writeFileSync(attrPath, `${next}\n`, 'utf8');
      } else {
        unlinkSync(attrPath);
      }
    }
  }

  tryGit(['config', '--remove-section', 'filter.decomment'], { cwd: root });

  if (!options.quiet) {
    console.log('✅ 已移除 .gitattributes 规则与 git 过滤器配置');
    console.log('   注意：已经提交到仓库里的无注释内容不会自动恢复。');
  }

  return 0;
}

function commandStatus() {
  const root = repoRoot();
  if (!root) {
    console.error('✗ 当前目录不在 git 仓库内');
    return 1;
  }

  const attrPath = join(root, '.gitattributes');
  const hasBlock = existsSync(attrPath) && readFileSync(attrPath, 'utf8').includes(ATTR_BEGIN);
  const filterCommand = tryGit(['config', '--get', 'filter.decomment.clean'], { cwd: root, encoding: 'utf8' });

  console.log(`仓库根目录：${root}`);
  console.log(`.gitattributes 规则：${hasBlock ? '已配置' : '未配置'}`);
  console.log(`git 过滤器：${filterCommand ? filterCommand.trim() : '未配置'}`);
  console.log(`配置文件：${loadConfig(root).source || '使用内置默认值'}`);

  if (!hasBlock || !filterCommand) {
    console.log('\n运行 npm run decomment:install 即可开启。');
    return 0;
  }

  console.log('\n提示：新增的注释会在下一次 git add 时被抽离；工作区文件不会变化。');
  return 0;
}

function readStagedContent(root, file) {
  const output = tryGit(['show', `:${file}`], { cwd: root, maxBuffer: 64 * 1024 * 1024 });
  return output;
}

function commandCheck(argv) {
  const options = parseFlags(argv);
  const root = repoRoot();

  if (!root) {
    console.error('✗ 当前目录不在 git 仓库内');
    return 1;
  }

  const config = loadConfig(root);
  const files = options.paths.length
    ? options.paths
    : options.staged
      ? stagedFiles(root)
      : trackedFiles(root);

  const offenders = [];

  for (const file of files) {
    let buffer = readStagedContent(root, file);

    if (!buffer) {
      const absolute = join(root, file);
      if (!existsSync(absolute)) continue;
      buffer = readFileSync(absolute);
    }

    if (buffer.length === 0) continue;

    const result = analyzeBuffer(buffer, file, { config });
    if (result.changed) {
      offenders.push({ file, removed: result.stats.removed });
    }
  }

  if (offenders.length === 0) {
    if (!options.quiet) console.log('✅ 仓库内容未发现注释，检查通过');
    return 0;
  }

  console.error(`✗ ${offenders.length} 个文件进入仓库的内容仍包含注释：`);
  for (const item of offenders.slice(0, 50)) {
    console.error(`   - ${item.file}（${item.removed} 处）`);
  }
  if (offenders.length > 50) console.error(`   ... 其余 ${offenders.length - 50} 个`);

  console.error('');
  console.error('如果这是首次使用，请执行：');
  console.error('  npm run decomment:install');
  console.error('  git add --renormalize .');
  console.error('若只是个别文件需要跳过，可在 .gitattributes 里为它加上 `-filter`。');

  return 1;
}

function commandStrip(argv) {
  const options = parseFlags(argv);
  const root = repoRoot() || process.cwd();
  const config = loadConfig(root);

  const files = options.paths.length
    ? fg.sync(options.paths, { cwd: root, absolute: true, dot: true, onlyFiles: true })
    : trackedFiles(root).map((file) => join(root, file));

  let changedFiles = 0;
  let removedComments = 0;
  const backups = [];

  for (const file of files) {
    if (!existsSync(file)) continue;

    const buffer = readFileSync(file);
    const result = analyzeBuffer(buffer, file, { config });

    if (!result.changed) {
      if (options.verbose && result.error) console.warn(`⚠️ 跳过 ${relative(root, file)}：${result.error}`);
      continue;
    }

    changedFiles += 1;
    removedComments += result.stats.removed;
    console.log(`✂ ${relative(root, file).replace(/\\/g, '/')}（${result.stats.removed} 处）`);

    if (options.dryRun) continue;

    const backup = `${file}.decomment.bak`;
    if (options.backup) {
      writeFileSync(backup, buffer);
      backups.push({ file: relative(root, file).replace(/\\/g, '/'), backup: relative(root, backup).replace(/\\/g, '/') });
    }
    writeFileSync(file, result.output);
  }

  if (options.backup && !options.dryRun && backups.length > 0) {
    writeBackupManifest(root, backups);
  }

  if (!options.quiet) {
    console.log('');
    console.log(`共处理 ${files.length} 个文件，修改 ${changedFiles} 个，抽离 ${removedComments} 处注释${options.dryRun ? '（dry-run，未写入）' : ''}`);
    if (options.backup && !options.dryRun) console.log('已生成 .decomment.bak 备份，可用 npm run decomment:restore 还原');
  }

  return 0;
}

function writeBackupManifest(root, records) {
  const dir = join(root, MANIFEST_DIR);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, MANIFEST_FILE),
    `${JSON.stringify({ createdAt: new Date().toISOString(), files: records }, null, 2)}\n`,
    'utf8',
  );
}

function readBackupManifest(root) {
  const file = join(root, MANIFEST_DIR, MANIFEST_FILE);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function commandRestore(argv) {
  const options = parseFlags(argv);
  const root = repoRoot() || process.cwd();

  let targets;

  if (options.paths.length > 0) {
    targets = fg
      .sync(options.paths, { cwd: root, absolute: true, dot: true, onlyFiles: true, ignore: ['**/node_modules/**'] })
      .map((file) => file.replace(/\.decomment\.bak$/, ''));
  } else {
    const manifest = readBackupManifest(root);
    if (!manifest || !Array.isArray(manifest.files)) {
      console.log('没有找到本工具生成的备份清单（.decomment/backup.json）。');
      console.log('如需还原其他 .decomment.bak，请显式传入路径，例如：');
      console.log('  npm run decomment:restore -- vite.config.ts');
      return 0;
    }
    targets = manifest.files.map((item) => join(root, item.file));
  }

  let restored = 0;

  for (const target of targets) {
    const backup = `${target}.decomment.bak`;
    if (!existsSync(backup)) continue;
    renameSync(backup, target);
    restored += 1;
    console.log(`↩ 已还原 ${relative(root, target).replace(/\\/g, '/')}`);
  }

  const manifestFile = join(root, MANIFEST_DIR, MANIFEST_FILE);
  if (!options.paths.length && existsSync(manifestFile)) unlinkSync(manifestFile);

  console.log(`共还原 ${restored} 个文件`);
  return 0;
}

function commandPreview(argv) {
  const options = parseFlags(argv);
  const file = options.paths[0];

  if (!file) {
    console.error('用法：decomment preview <文件>');
    return 1;
  }

  const root = repoRoot() || process.cwd();
  const absolute = join(root, file);

  if (!existsSync(absolute)) {
    console.error(`✗ 文件不存在：${file}`);
    return 1;
  }

  const config = loadConfig(root);
  const result = stripText(readFileSync(absolute, 'utf8'), { filePath: file, config });

  process.stdout.write(result.code);
  return result.error ? 1 : 0;
}

function main() {
  const [command, ...rest] = process.argv.slice(2);

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(USAGE);
    return 0;
  }

  switch (command) {
    case 'install':
      return commandInstall(rest);
    case 'uninstall':
      return commandUninstall(rest);
    case 'status':
      return commandStatus(rest);
    case 'check':
      return commandCheck(rest);
    case 'strip':
      return commandStrip(rest);
    case 'restore':
      return commandRestore(rest);
    case 'preview':
      return commandPreview(rest);
    default:
      console.error(`未知命令：${command}\n`);
      console.log(USAGE);
      return 1;
  }
}

process.exitCode = main();
