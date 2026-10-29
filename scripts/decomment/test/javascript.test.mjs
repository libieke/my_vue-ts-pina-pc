import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CONFIG } from '../config.mjs';
import { stripText } from '../index.mjs';

const config = { ...DEFAULT_CONFIG };

function strip(code, filePath = 'sample.ts') {
  return stripText(code, { filePath, config });
}

test('行注释：整行注释被删除，行内注释只删注释本身', () => {
  const input = [
    '// 文件说明',
    'const a = 1; // 行内注释',
    '',
    'const b = 2;',
    '',
  ].join('\n');

  assert.equal(strip(input).code, 'const a = 1;\n\nconst b = 2;\n');
});

test('块注释：保留代码、补空格、删除跨行注释独占的行', () => {
  const input = [
    'const a = 1; /* 行内 */',
    '/*',
    ' * 多行说明',
    ' */',
    'const b = a/*连接*/+ 2;',
    '',
  ].join('\n');

  assert.equal(strip(input).code, 'const a = 1;\nconst b = a + 2;\n');
});

test('字符串、模板字符串、正则里的 // 不会被误删', () => {
  const input = [
    "const url = 'http://example.com/a';",
    'const tpl = `// not comment ${1 /* 删掉 */}`;',
    String.raw`const re = /a\/\/b/;`,
    String.raw`const handle = url.replace(/\/\//g, '');`,
    '',
  ].join('\n');

  const output = strip(input).code;

  assert.match(output, /http:\/\/example\.com\/a/);
  assert.match(output, /\/\/ not comment/);
  assert.ok(output.includes('/a\\/\\/b/'), output);
  assert.ok(output.includes("/\\/\\//g"), output);
  assert.doesNotMatch(output, /删掉/);
});

test('JSX 文本里的 // 不会被当成注释', () => {
  const input = [
    'const el = (',
    '  <a href="https://example.com">说明 https://example.com 保留</a> // 这里要删掉',
    ');',
    '',
  ].join('\n');

  const output = strip(input, 'sample.jsx').code;

  assert.match(output, /说明 https:\/\/example\.com 保留/);
  assert.doesNotMatch(output, /这里要删掉/);
});

test('eslint / ts / license / shebang 等指令注释默认保留', () => {
  const input = [
    '#!/usr/bin/env node',
    '/*! @license MIT */',
    '// eslint-disable-next-line no-console',
    '// @ts-expect-error 忽略',
    '// prettier-ignore',
    'console.log("x"); // 普通注释',
    '',
  ].join('\n');

  const result = strip(input, 'sample.js');
  const output = result.code;

  assert.match(output, /@license MIT/);
  assert.match(output, /eslint-disable-next-line/);
  assert.match(output, /@ts-expect-error/);
  assert.match(output, /prettier-ignore/);
  assert.doesNotMatch(output, /普通注释/);
  assert.equal(result.stats.kept, 4);
});

test('抽取后代码仍可被 Babel 解析', async () => {
  const { parse } = await import('@babel/parser');
  const input = [
    'interface User { name: string }',
    '// 注释',
    'export const user: User = {',
    '  name: "张三", // 姓名',
    '};',
    '',
  ].join('\n');

  const output = strip(input, 'sample.ts').code;
  assert.doesNotThrow(() => parse(output, { sourceType: 'module', plugins: ['typescript'] }));
});

test('幂等：对结果再抽离一次内容不变', () => {
  const input = [
    '/* a */',
    'const a = 1; // b',
    'const c = 2;',
    '',
  ].join('\n');

  const once = strip(input).code;
  const twice = strip(once).code;
  assert.equal(twice, once);
});

test('无注释的文件原样返回，且不产生额外改动', () => {
  const input = 'const a = 1;\nconst b = 2;\n';
  const result = strip(input);
  assert.equal(result.changed, false);
  assert.equal(result.code, input);
});

test('decomment-ignore-file 标记可整份跳过', () => {
  const input = '// decomment-ignore-file\nconst a = 1; // 保留\n';
  const result = strip(input);
  assert.equal(result.code, input);
  assert.equal(result.skipped, 'ignore-file-marker');
});

test('注释里的 CRLF 换行不会破坏结构', () => {
  const input = 'const a = 1; // x\r\n/* y */ const b = 2;\r\n';
  const output = strip(input).code;
  assert.equal(output, 'const a = 1;\r\nconst b = 2;\r\n');
});

test('无法解析的文件原样返回并给出错误信息', () => {
  const input = 'const a = {; // 坏代码\n';
  const result = strip(input, 'broken.ts');
  assert.equal(result.changed, false);
});
