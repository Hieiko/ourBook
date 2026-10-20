// 零依赖自检：校验 app.wxss 里的 SVG 蒙版图标与分类图标映射一致
// node tests/icons.test.js
const assert = require('assert')
const fs = require('fs')
const path = require('path')
const calc = require('../utils/calc')

const root = path.join(__dirname, '..')
const css = fs.readFileSync(path.join(root, 'app.wxss'), 'utf8')
// 组件样式默认隔离，图标是单独一份，一起校验
const svgCss = [css, fs.readFileSync(path.join(root, 'components/nav-bar/index.wxss'), 'utf8')].join('\n')
let checks = 0

// 每个 data-uri 都要能解码、标签配对、转义完整
for (const [, payload] of svgCss.matchAll(/url\("data:image\/svg\+xml,([^"]+)"\)/g)) {
  assert.ok(!payload.includes('#') && !payload.includes('"'), `转义不完整: ${payload.slice(0, 60)}`)
  const svg = decodeURIComponent(payload)
  assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `SVG 外壳损坏: ${svg.slice(0, 60)}`)
  const stack = []
  for (const tag of svg.match(/<\/?[a-z]+[^>]*>/g) || []) {
    if (tag.startsWith('</')) assert.strictEqual(stack.pop(), tag.slice(2, -1), `标签错配: ${svg.slice(0, 60)}`)
    else if (!tag.endsWith('/>')) stack.push(tag.slice(1).split(/[\s>]/)[0])
  }
  assert.strictEqual(stack.length, 0, `标签未闭合: ${svg.slice(0, 60)}`)
  checks += 3
}

// 每个分类都必须有已声明的图标 class，否则网格里会出现空白格
const declared = new Set([...css.matchAll(/^\.(i-[a-z-]+)\s*\{/gm)].map(m => m[1]))
for (const type of ['expense', 'income']) {
  for (const name of calc.categoriesOf(type)) {
    const icon = calc.CATEGORY_ICON[name]
    assert.ok(icon, `${name} 缺少图标映射`)
    assert.ok(declared.has(icon), `${name} 的图标 class .${icon} 未在 app.wxss 声明`)
    checks += 2
  }
}

assert.strictEqual(calc.categoriesOf('income'), calc.INCOME_CATEGORIES, 'categoriesOf 收入')
assert.strictEqual(calc.categoriesOf('expense'), calc.EXPENSE_CATEGORIES, 'categoriesOf 支出')
checks += 2

console.log(`icons.test.js 通过：${checks} 项断言`)
