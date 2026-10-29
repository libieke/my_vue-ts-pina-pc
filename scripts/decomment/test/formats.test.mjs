import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CONFIG } from '../config.mjs';
import { analyzeBuffer, stripText } from '../index.mjs';

const config = { ...DEFAULT_CONFIG };

function strip(code, filePath) {
  return stripText(code, { filePath, config }).code;
}

test('CSS：块注释删除，url() 里的 // 保留', () => {
  const input = [
    '/* 文件说明 */',
    '.box {',
    '  /* 行内块注释 */',
    '  color: red;',
    '  background: url(//cdn.example.com/a.png);',
    '}',
    '',
  ].join('\n');

  const output = strip(input, 'a.css');

  assert.doesNotMatch(output, /文件说明/);
  assert.doesNotMatch(output, /行内块注释/);
  assert.match(output, /url\(\/\/cdn\.example\.com\/a\.png\)/);
  assert.match(output, /color: red;/);
});

test('SCSS：// 行注释删除，字符串里的 // 保留', () => {
  const input = [
    '// 变量说明',
    '$name: "http://a.com";',
    '.box {',
    '  // 颜色',
    '  color: red;',
    '}',
    '',
  ].join('\n');

  const output = strip(input, 'a.scss');

  assert.doesNotMatch(output, /变量说明/);
  assert.doesNotMatch(output, /颜色/);
  assert.match(output, /http:\/\/a\.com/);
});

test('HTML：注释删除，条件注释与内嵌脚本注释分别处理', () => {
  const input = [
    '<!DOCTYPE html>',
    '<html>',
    '  <!-- 普通注释 -->',
    '  <!--[if lt IE 9]><script src="x.js"></script><![endif]-->',
    '  <body>',
    '    <script>',
    '      // 脚本注释',
    '      var a = 1; // 行内',
    '    </script>',
    '    <style>',
    '      /* 样式注释 */',
    '      .a { color: red; }',
    '    </style>',
    '  </body>',
    '</html>',
    '',
  ].join('\n');

  const output = strip(input, 'index.html');

  assert.doesNotMatch(output, /普通注释/);
  assert.doesNotMatch(output, /脚本注释/);
  assert.doesNotMatch(output, /样式注释/);
  assert.doesNotMatch(output, /行内/);
  assert.match(output, /\[if lt IE 9\]/);
  assert.match(output, /var a = 1;/);
  assert.match(output, /color: red;/);
  assert.match(output, /<\/script>/);
});

test('JSON/JSONC：字符串里的 // 保留，注释删除', () => {
  const input = [
    '{',
    '  // 接口地址',
    '  "baseURL": "https://api.example.com",',
    '  /* 超时时间 */',
    '  "timeout": 5000',
    '}',
    '',
  ].join('\n');

  const output = strip(input, 'config.jsonc');

  assert.doesNotMatch(output, /接口地址/);
  assert.doesNotMatch(output, /超时时间/);
  assert.match(output, /https:\/\/api\.example\.com/);
  assert.match(output, /"timeout": 5000/);
});

test('YAML：普通注释删除，# 在引号与块标量中保留', () => {
  const input = [
    'name: demo # 名称',
    'url: "https://a.com/#hash"',
    'script: |',
    '  echo "hello # not comment"',
    '  echo ok',
    'list:',
    '  - a # 注释',
    '  - b',
    '',
  ].join('\n');

  const output = strip(input, 'app.yaml');

  assert.doesNotMatch(output, /# 名称/);
  assert.doesNotMatch(output, /# 注释/);
  assert.match(output, /https:\/\/a\.com\/#hash/);
  assert.match(output, /hello # not comment/);
});

test('Python：docstring 里的 # 保留，注释删除', () => {
  const input = [
    '"""模块说明 # 不是注释"""',
    'value = "# 字符串里的"  # 真正的注释',
    'total = 1  # 另一个注释',
    '',
  ].join('\n');

  const output = strip(input, 'a.py');

  assert.match(output, /模块说明 # 不是注释/);
  assert.match(output, /"# 字符串里的"/);
  assert.doesNotMatch(output, /真正的注释/);
  assert.doesNotMatch(output, /另一个注释/);
});

test('Shell：字符串里的 # 保留，注释删除，shebang 保留', () => {
  const input = [
    '#!/usr/bin/env bash',
    'echo "a # b"  # 注释',
    'echo done',
    '',
  ].join('\n');

  const output = strip(input, 'run.sh');

  assert.match(output, /^#!\/usr\/bin\/env bash/m);
  assert.match(output, /"a # b"/);
  assert.doesNotMatch(output, /# 注释/);
});

test('SQL：-- 注释删除，字符串里的 -- 保留', () => {
  const input = [
    '-- 查询用户',
    "SELECT * FROM user WHERE name = 'a--b'; -- 行内",
    '/* 块注释 */',
    'SELECT 1;',
    '',
  ].join('\n');

  const output = strip(input, 'q.sql');

  assert.doesNotMatch(output, /查询用户/);
  assert.doesNotMatch(output, /块注释/);
  assert.match(output, /'a--b'/);
});

test('TOML / INI：# 与 ; 注释删除', () => {
  const toml = ['# 说明', '[server]', 'port = 8080 # 端口', ''].join('\n');
  assert.equal(strip(toml, 'a.toml').includes('说明'), false);
  assert.equal(strip(toml, 'a.toml').includes('端口'), false);
  assert.equal(strip(toml, 'a.toml').includes('port = 8080'), true);

  const ini = ['; 说明', '[main]', 'a = 1', ''].join('\n');
  assert.equal(strip(ini, 'a.ini').includes('说明'), false);
  assert.equal(strip(ini, 'a.ini').includes('a = 1'), true);
});

test('不支持的文件类型原样返回', () => {
  const text = '# 标题\n\n内容 <!-- x -->\n';
  const result = stripText(text, { filePath: 'a.md', config });
  assert.equal(result.code, text);
  assert.equal(result.skipped, 'unsupported-language');
});

test('二进制内容不会被处理', () => {
  const buffer = Buffer.from([0x00, 0x2f, 0x2f, 0x01, 0x00]);
  const result = analyzeBuffer(buffer, 'a.ts', { config });
  assert.equal(result.changed, false);
  assert.equal(result.skipped, 'binary');
  assert.deepEqual(result.output, buffer);
});
