import assert from 'node:assert/strict';
import test from 'node:test';

import { DEFAULT_CONFIG } from '../config.mjs';
import { stripText } from '../index.mjs';

const config = { ...DEFAULT_CONFIG };

function strip(code, filePath) {
  return stripText(code, { filePath, config }).code;
}

const SFC = `<template>
  <div class="box">
    <!-- 模板注释，删掉 -->
    <!-- prettier-ignore -->
    <span>{{ title }}</span>
    <!--[if IE]><p>ie</p><![endif]-->
  </div>
</template>

<script setup lang="ts">
// 脚本注释
const title: string = 'https://example.com'; // 行内注释
</script>

<style scoped lang="scss">
/* 块注释 */
.box {
  // 行注释
  color: red;
  background: url(https://cdn.example.com/a.png);
}
</style>
`;

test('Vue：同时处理 template / script / style 三种注释', () => {
  const output = strip(SFC, 'Demo.vue');

  assert.doesNotMatch(output, /模板注释，删掉/);
  assert.doesNotMatch(output, /脚本注释/);
  assert.doesNotMatch(output, /行内注释/);
  assert.doesNotMatch(output, /块注释/);
  assert.doesNotMatch(output, /行注释/);

  assert.match(output, /https:\/\/example\.com/);
  assert.match(output, /url\(https:\/\/cdn\.example\.com\/a\.png\)/);
  assert.match(output, /prettier-ignore/);
  assert.match(output, /\[if IE\]/);
  assert.match(output, /\{\{ title \}\}/);
  assert.match(output, /const title: string/);
});

test('Vue：<script> 与 <style> 标签结构保持完整', () => {
  const output = strip(SFC, 'Demo.vue');
  assert.equal((output.match(/<template>/g) || []).length, 1);
  assert.equal((output.match(/<\/script>/g) || []).length, 1);
  assert.equal((output.match(/<\/style>/g) || []).length, 1);
});

test('Vue：模板中 {{ }} 插值里的字符串不会被误判', () => {
  const input = `<template>
  <div :title="a + '<!--x-->'">{{ '<!-- y -->' }}</div>
</template>
`;
  const output = strip(input, 'Demo.vue');
  assert.match(output, /<!--x-->/);
  assert.match(output, /<!-- y -->/);
});

test('Vue：script lang=ts 的 TS 语法可以正常解析', () => {
  const input = `<script setup lang="ts">
interface Item { id: number }
// 注释
const list = ref<Item[]>([]);
</script>
`;
  const output = strip(input, 'Demo.vue');
  assert.doesNotMatch(output, /注释/);
  assert.match(output, /interface Item/);
});

test('Vue：block 之外的顶层注释也会被抽离', () => {
  const input = [
    '<!-- 组件说明，写在 SFC 顶层 -->',
    '<template>',
    '  <div />',
    '</template>',
    '',
    '<style scoped>',
    '  .a { color: red; }',
    '</style>',
    '',
  ].join('\n');

  const output = strip(input, 'Demo.vue');

  assert.doesNotMatch(output, /组件说明/);
  assert.match(output, /^<template>/m);
  assert.match(output, /\.a \{ color: red; \}/);
});
