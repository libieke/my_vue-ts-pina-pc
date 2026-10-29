import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const CLI = fileURLToPath(new URL('../cli.mjs', import.meta.url));

function run(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function createRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'decomment-e2e-'));
  run(dir, ['init', '-q']);
  run(dir, ['config', 'user.email', 'test@example.com']);
  run(dir, ['config', 'user.name', 'tester']);
  run(dir, ['config', 'core.autocrlf', 'false']);
  execFileSync(process.execPath, [CLI, 'install', '--quiet'], { cwd: dir });
  return dir;
}

const SOURCE = [
  '// 顶部注释',
  'export const a = 1; // 行内注释',
  '/* 块注释 */',
  'export const b = 2;',
  '',
].join('\n');

test('安装后：仓库无注释、工作区保留注释、git status 干净', () => {
  const dir = createRepo();
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/app.ts'), SOURCE, 'utf8');
  writeFileSync(join(dir, 'README.md'), '# 标题\n\n不会处理\n', 'utf8');

  run(dir, ['add', '-A']);
  run(dir, ['commit', '-q', '-m', 'init']);

  const committed = run(dir, ['show', 'HEAD:src/app.ts']);
  assert.doesNotMatch(committed, /顶部注释/);
  assert.doesNotMatch(committed, /行内注释/);
  assert.doesNotMatch(committed, /块注释/);
  assert.match(committed, /export const a = 1;/);

  const worktree = readFileSync(join(dir, 'src/app.ts'), 'utf8');
  assert.match(worktree, /顶部注释/);
  assert.match(worktree, /行内注释/);

  assert.equal(run(dir, ['status', '--porcelain']).trim(), '');

  assert.equal(run(dir, ['show', 'HEAD:README.md']), '# 标题\n\n不会处理\n');
});

test('修改后再次提交：新注释同样被抽离，工作区不变', () => {
  const dir = createRepo();
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/index.vue'), '<template>\n  <!-- 注释 -->\n  <div>hi</div>\n</template>\n', { encoding: 'utf8', flag: 'w' });

  run(dir, ['add', '-A']);
  run(dir, ['commit', '-q', '-m', 'init']);

  const first = run(dir, ['show', 'HEAD:src/index.vue']);
  assert.doesNotMatch(first, /注释/);

  writeFileSync(
    join(dir, 'src/index.vue'),
    '<template>\n  <!-- 新注释 -->\n  <div>hi</div>\n  <p>more</p>\n</template>\n',
    'utf8',
  );

  run(dir, ['add', '-A']);
  run(dir, ['commit', '-q', '-m', 'update']);

  const second = run(dir, ['show', 'HEAD:src/index.vue']);
  assert.doesNotMatch(second, /新注释/);
  assert.match(second, /<p>more<\/p>/);
  assert.match(readFileSync(join(dir, 'src/index.vue'), 'utf8'), /新注释/);
});

test('check --staged：安装过滤器后通过，未安装时失败', () => {
  const dir = createRepo();
  mkdirSync(join(dir, 'src'), { recursive: true });
  writeFileSync(join(dir, 'src/app.ts'), SOURCE, { encoding: 'utf8', flag: 'w' });
  run(dir, ['add', '-A']);

  execFileSync(process.execPath, [CLI, 'check', '--staged'], { cwd: dir, stdio: 'pipe' });

  run(dir, ['config', '--remove-section', 'filter.decomment']);
  writeFileSync(join(dir, 'src/app2.ts'), SOURCE, 'utf8');
  run(dir, ['add', '-A']);

  assert.throws(() =>
    execFileSync(process.execPath, [CLI, 'check', '--staged'], { cwd: dir, stdio: 'pipe' }),
  );
});
