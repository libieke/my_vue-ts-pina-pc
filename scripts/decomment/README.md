# 提交时自动抽离注释（decomment）

一套通用、非破坏性的注释抽离方案：**推送到 GitHub 的代码没有注释，本地开发时注释原样保留。**

不依赖任何第三方 CLI，也不需要手动执行 `strip` / `restore`。核心是 git 的
[clean filter](https://git-scm.com/docs/gitattributes#_filter)：`git add` 时 git 把工作区内容
交给本仓库的脚本，脚本抽离注释后返回，git 用这份内容生成提交对象。工作区文件从头到尾没有被改写。

```
工作区文件（有注释）
      │  git add
      ▼
filter.mjs  ── 解析语言 ── 删除注释 ──▶ 无注释内容
      │
      ▼
git 对象库 / GitHub（无注释）
```

---

## 快速开始

```bash
# 1. 安装过滤器（npm install 时已由 prepare 自动执行，可跳过）
npm run decomment:install

# 2. 让「已经存在的文件」也按新规则写入仓库（只需执行一次）
git add --renormalize .

# 3. 提交并推送
git commit -m "chore: 仓库内容移除注释"
git push
```

之后无需任何额外操作：新增或修改的文件在 `git add` 时都会自动抽离注释。

> 验证结果：`git show HEAD:src/main.ts` 看到的是无注释版本，而你本地的 `src/main.ts` 注释还在。

---

## 命令

| 命令 | 作用 |
| --- | --- |
| `npm run decomment:install` | 写入 `.gitattributes` 规则并配置 git 过滤器（幂等，可重复执行） |
| `npm run decomment:status` | 查看当前是否已生效 |
| `npm run decomment:check` | 检查**仓库内容**（索引中的 blob）是否还有注释，有则退出码为 1 |
| `npm run decomment:check:staged` | 只检查暂存区（pre-commit 使用） |
| `npm run decomment:strip` | 就地删除全部已跟踪源码文件的注释，并生成 `.decomment.bak` |
| `npm run decomment:restore` | 按 `.decomment/backup.json` 还原 `strip` 生成的备份 |
| `npm run decomment:preview -- src/main.ts` | 预览单个文件抽离后的内容 |
| `npm run decomment:test` | 运行本工具的单元测试 |

`install` / `strip` 这类命令也可以直接调用脚本：

```bash
node scripts/decomment/cli.mjs install
node scripts/decomment/cli.mjs strip --dry-run "src/**/*.vue"
node scripts/decomment/cli.mjs check src/main.ts
```

### check 检查的是“仓库内容”，不是工作区

工作区保留注释是设计目标，所以 `check` 读取的是索引里的 blob（`git show :path`）。
这样它既能用于 CI，也能在 pre-commit 里拦住「过滤器没装好就提交」的情况。

---

## 配置

根目录的 `decomment.config.json`（可选，缺省时使用内置默认值）：

```json
{
  "enabled": true,
  "maxFileSize": 1048576,
  "keep": ["@license", "eslint-", "@ts-", "prettier-ignore"],
  "extensions": { ".mdx": "jsx" }
}
```

| 字段 | 说明 |
| --- | --- |
| `enabled` | 总开关，`false` 时过滤器原样放行 |
| `maxFileSize` | 超过该字节数的文件直接跳过，避免解析大体积数据文件 |
| `keep` | 需要保留的注释前缀（不区分大小写，按前缀匹配） |
| `extensions` | 追加/覆盖扩展名到语言的映射，见下表 |

### 默认保留的注释

以下注释会被保留，因为删除会改变工具链行为：

- 版权类：`@license`、`@preserve`、`@copyright`、`/*! ... */`、`//! ...`
- ESLint / TS / Vue：`eslint-disable*`、`@ts-ignore`、`@ts-expect-error`、`@ts-nocheck`、`@vue-*`
- 构建：`webpackChunkName`、`webpackIgnore`、`vite-ignore`、`sourceMappingURL`
- 格式化/覆盖率：`prettier-ignore`、`istanbul ignore`、`c8 ignore`
- Python：`# type: ignore`、`# noqa`、`# fmt:`、`# -*- coding -*-`
- HTML 条件注释：`<!--[if ...]>`

### 跳过某个文件

两种方式，任选其一：

1. 在 `.gitattributes` 里追加一行（推荐，不污染源码）：

   ```gitattributes
   src/vendor/**  -filter
   ```

2. 在文件里任意位置写 `decomment-ignore-file`，例如：

   ```js
   // decomment-ignore-file
   ```

### 文件类型

`.gitattributes` 中生成的是扩展名规则，默认覆盖：

| 类别 | 扩展名 |
| --- | --- |
| 脚本 | `.js .mjs .cjs .jsx .ts .mts .cts .tsx` |
| 组件 | `.vue` |
| 样式 | `.css .scss .sass .less .styl .wxss` |
| 标记 | `.html .htm .xhtml .xml .svg .wxml` |
| 数据 | `.json .jsonc .json5 .webmanifest .yml .yaml .toml .ini .cfg .conf .properties` |
| 其他 | `.sh .bash .zsh .py .sql .go .java .kt .swift .c .h .cpp .cs .rs .dart .scala .php .gradle` |

默认**不处理**：`package-lock.json`、`pnpm-lock.yaml`、`yarn.lock`、`*.min.js`、`*.min.css`，
以及插件自动生成的声明文件（`src/auto-import.d.ts`、`components.d.ts`，它们每次启动/构建都会被重写），
还有所有未列出的类型（`.md`、`.env`、图片等）。`.env` 里的 `#` 是配置说明，刻意不处理。

---

## 工作原理与安全策略

- **AST 优先**：JS/TS/JSX/TSX 通过 `@babel/parser` 解析，`.vue` 通过 `@vue/compiler-sfc` 拆分
  template/script/style；CSS、YAML 等使用带字符串/块标量识别的词法扫描。因此
  `"http://a.com"`、`/\/\//`、模板字符串、JSX 文本、`url(//cdn)`、YAML `|` 块标量里的
  `#` 都不会被误删。
- **只删注释字符**：不重新生成代码，缩进、引号、分号、空行结构全部保持原样。
  注释独占的行整行删除，行内注释只删注释本身，必要时补一个空格避免标识符粘连。
- **失败即放行**：解析失败、二进制、非 UTF-8、超大文件、未识别的语言，一律原样返回。
  宁可少删注释，也绝不写坏文件。
- **幂等**：同一份内容重复过滤结果不变，否则 `git status` 会一直显示已修改。

### 性能

每个文件会启动一次 Node 进程解析（约 50–100ms）。一次提交几十个文件通常在数秒内完成；
日常只改几个文件时几乎无感。

---

## 在 CI 中校验

```yaml
- name: 检查仓库是否残留注释
  run: npm run decomment:check
```

`check` 失败时打印文件名与注释数量。注意 CI 里需要 `actions/checkout` 拉取完整仓库
（默认即可，不需要 `fetch-depth: 0`）。

---

## 常见问题

**Q：本地文件里的注释还在？**
正常。过滤器只影响写入仓库的内容，工作区文件不被修改。

**Q：改完代码后 `git status` 出现大量注释删除的改动？**
第一次启用时需要 `git add --renormalize .` 把历史内容也过一遍过滤器，提交一次即可。
之后只会影响真正改动过的文件。

**Q：同事拉取代码后注释消失了？**
是的，仓库里本来就没有注释，新克隆的代码自然没有。这正是该方案的目标。
如果希望保留注释作为文档，请把说明写进 `README.md` 或独立的 `.md` 文件（`.md` 不被处理）。

**Q：换过 Node 版本后过滤失效？**
过滤器命令里记录了安装时的 node 绝对路径，重新执行 `npm run decomment:install` 即可。
可用 `npm run decomment:status` 确认。

**Q：某个文件解析失败被跳过了？**
默认静默放行，设置环境变量 `DECOMMENT_DEBUG=1` 后再次执行可看到错误详情。

**Q：如何临时关闭？**
在 `.gitattributes` 里把 `filter=decomment` 改成 `-filter`，或把 `decomment.config.json`
的 `enabled` 设为 `false`，然后 `npm run decomment:uninstall` 彻底撤销。

**Q：`restore` 会还原仓库里所有 `.decomment.bak` 吗？**
不会。`restore` 只还原本工具 `strip --backup` 记录在 `.decomment/backup.json` 里的文件；
其他工具留下的 `.bak` 需要显式传路径，例如 `npm run decomment:restore -- vite.config.ts`。

---

## 目录结构

```
scripts/decomment/
├── cli.mjs            命令行入口（install / check / strip / preview / restore）
├── filter.mjs         git clean 过滤器入口（stdin -> stdout）
├── index.mjs          对外 API：stripText / analyzeBuffer / stripBuffer
├── apply.mjs          注释区间删除引擎（所有语言共用）
├── keep.mjs           保留规则判定
├── config.mjs         配置、语言映射
├── parsers/
│   ├── js.mjs         JS / TS / JSX / TSX（@babel/parser）
│   ├── vue.mjs        Vue SFC（@vue/compiler-sfc）
│   ├── markup.mjs     CSS / SCSS / HTML / XML / JSON
│   └── text.mjs       YAML / Shell / Python / TOML / INI / SQL / C 系
└── test/              node:test 单元测试 + git 过滤器端到端测试
```

### 新增一种语言

1. 在 `parsers/` 里实现一个函数，返回 `{ start, end, kind }[]` 注释区间；
2. 在 `index.mjs` 的 `collectComments` 中登记语言标识；
3. 在 `config.mjs` 的 `LANGUAGE_BY_EXTENSION` 中登记扩展名；
4. 重新执行 `npm run decomment:install` 刷新 `.gitattributes`。
