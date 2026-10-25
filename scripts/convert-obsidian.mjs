#!/usr/bin/env node
/**
 * Obsidian 笔记 → Hexo 博文转换脚本
 *
 * 用法: node scripts/convert-obsidian.mjs [笔记库路径] [输出目录]
 *   默认: node scripts/convert-obsidian.mjs "D:/study/my" "source/_posts"
 *
 * 功能:
 *   1. 递归扫描笔记库中的 .md 文件（跳过空文件）
 *   2. 为每篇笔记生成 Hexo front matter（title / date / tags / categories）
 *   3. 转换 Obsidian 特有语法:
 *      - ==高亮==  →  <mark>高亮</mark>（跳过代码块）
 *      - [[]] 空 wiki 链接 → 删除
 *   4. 输出到 Hexo 的 source/_posts 目录（文件名保持不变）
 */
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const VAULT = process.argv[2] || 'D:/study/my';
const POSTS_DIR = process.argv[3] || join(process.cwd(), 'source', '_posts');

// 文件夹 → Hexo 分类（不在此表中的文件夹直接用原名）
const CATEGORY_MAP = {
  'my deeplearning': '深度学习',
  '算法学习': '算法学习',
  '课上笔记': '课程笔记',
};

// 文件名 → 标签（不在此表中的笔记默认使用分类名作为标签）
const TAG_OVERRIDES = {
  'softmax中的交叉熵损失.md': ['深度学习', 'PyTorch'],
  '数学基础知识.md': ['数学', '线性代数'],
  'DFS递归 BFS.md': ['DFS', 'BFS'],
  '一些算法题.md': ['算法'],
  '二分.md': ['二分'],
  '倍增与ST.md': ['倍增', 'ST表'],
  '前缀和与差分数组.md': ['前缀和', '差分'],
  '动态规划.md': ['动态规划'],
  '堆.md': ['堆'],
  '排序.md': ['排序'],
  '数论的一些结论.md': ['数论'],
  '树.md': ['线段树', '树'],
  '一些小知识点.md': ['计算机基础'],
};

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) files.push(...walk(full));
    else if (name.endsWith('.md')) files.push(full);
  }
  return files;
}

function fmtDate(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function frontMatter(title, date, tags, categories) {
  const lines = ['---', `title: ${title}`, `date: ${date}`];
  if (tags.length) {
    lines.push('tags:');
    for (const t of tags) lines.push(`  - ${t}`);
  }
  if (categories.length) {
    lines.push('categories:');
    for (const c of categories) lines.push(`  - ${c}`);
  }
  lines.push('---');
  return lines.join('\n');
}

function convertObsidianSyntax(text) {
  // 以 ``` 分割：偶数段为正文，奇数段为代码块
  const parts = text.split(/```/);
  const converted = parts.map((seg, i) => {
    if (i % 2 === 1) return seg; // 代码块原样保留
    let s = seg.replace(/\[\[\]\]/g, ''); // 删除空 wiki 链接 [[]]
    s = s.replace(/==([^=\r\n]+?)==/g, '<mark>$1</mark>'); // 高亮 → <mark>
    return s;
  });
  return converted.join('```');
}

mkdirSync(POSTS_DIR, { recursive: true });

const files = walk(VAULT);
const written = [];
const skipped = [];
const overwritten = [];

for (const file of files) {
  const st = statSync(file);
  if (st.size === 0) {
    skipped.push(file);
    continue;
  }
  const name = basename(file);
  const folder = basename(join(file, '..'));
  const title = name.replace(/\.md$/, '');
  const date = fmtDate(st.mtime);
  const category = CATEGORY_MAP[folder] ?? folder;
  const tags = TAG_OVERRIDES[name] ?? [category];

  const raw = readFileSync(file, 'utf8');
  const body = convertObsidianSyntax(raw).replace(/\n+$/, '\n');
  const output = frontMatter(title, date, tags, [category]) + '\n' + body;

  const dest = join(POSTS_DIR, name);
  if (readdirSync(POSTS_DIR).includes(name)) overwritten.push(name);
  writeFileSync(dest, output, 'utf8');
  written.push(name);
}

console.log(`笔记库: ${VAULT}`);
console.log(`输出目录: ${POSTS_DIR}`);
console.log(`\n已转换 ${written.length} 篇:`);
for (const w of written) console.log(`  ✔ ${w}`);
if (overwritten.length) {
  console.log(`\n覆盖了 _posts 中已存在的 ${overwritten.length} 篇: ${overwritten.join(', ')}`);
}
if (skipped.length) {
  console.log(`\n跳过空文件 ${skipped.length} 个:`);
  for (const s of skipped) console.log(`  - ${s}`);
}
