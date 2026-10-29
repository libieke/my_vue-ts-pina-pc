#!/usr/bin/env node
import { readFileSync } from 'node:fs';

import { stripBuffer } from './index.mjs';

const filePath = (process.argv[2] || '').replace(/^['"]|['"]$/g, '');

let input;
try {
  input = readFileSync(0);
} catch {
  process.exit(0);
}

let output = input;

try {
  if (input.length > 0) {
    output = stripBuffer(input, filePath);
  }
} catch (error) {
  if (process.env.DECOMMENT_DEBUG) {
    console.error('[decomment] 过滤器异常，已按原样输出：', error);
  }
  output = input;
}

process.stdout.write(output);
