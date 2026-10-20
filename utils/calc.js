// 纯计算逻辑：刻意不引用任何 wx API，这样才能直接跑 tests/calc.test.js
const EXPENSE_CATEGORIES = [
  '餐饮', '买菜', '零食', '交通', '购物',
  '居家', '房租', '医疗', '教育', '娱乐',
  '人情', '缴费', '美容', '充值', '通讯',
  '宠物', '旅行', '运动', '数码', '其他',
]
const INCOME_CATEGORIES = ['工资', '奖金', '红包', '其他']

// 分类 -> 图标 class（图标本体在 app.wxss，蒙版上色）
const CATEGORY_ICON = {
  餐饮: 'i-food',
  买菜: 'i-veggie',
  零食: 'i-snack',
  交通: 'i-transit',
  购物: 'i-bag',
  居家: 'i-home',
  房租: 'i-key',
  医疗: 'i-med',
  教育: 'i-book',
  娱乐: 'i-fun',
  人情: 'i-gift',
  缴费: 'i-bill',
  美容: 'i-beauty',
  充值: 'i-topup',
  通讯: 'i-phone',
  宠物: 'i-pet',
  旅行: 'i-travel',
  运动: 'i-sport',
  数码: 'i-digital',
  工资: 'i-salary',
  奖金: 'i-bonus',
  红包: 'i-redpacket',
  其他: 'i-other',
}

const categoriesOf = type => (type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)

const pad2 = n => String(n).padStart(2, '0')

// 金额一律以整数「分」存储，避免浮点误差
function toCents(input) {
  const s = String(input == null ? '' : input).trim()
  if (!/^\d+(\.\d{0,2})?$/.test(s)) return null
  const [yuan, decimals = ''] = s.split('.')
  return Number(yuan) * 100 + Number(decimals.padEnd(2, '0'))
}

function formatCents(cents) {
  const n = Math.round(cents || 0)
  const abs = Math.abs(n)
  return `${n < 0 ? '-' : ''}${Math.floor(abs / 100)}.${pad2(abs % 100)}`
}

function monthOf(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

function monthLabel(key) {
  const [year, month] = key.split('-')
  return `${year}年${Number(month)}月`
}

function shiftMonth(key, delta) {
  const [year, month] = key.split('-').map(Number)
  return monthOf(new Date(year, month - 1 + delta, 1).getTime())
}

function dateStr(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

// 统一落在当天 12:00，避免时区/夏令时把日期挤到前一天
function dateTs(str) {
  const [year, month, day] = String(str).split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0).getTime()
}

const inMonth = (record, key) => monthOf(record.ts) === key

function summarize(records, key) {
  let expense = 0
  let income = 0
  records.forEach(record => {
    if (!inMonth(record, key)) return
    if (record.type === 'income') income += record.cents
    else expense += record.cents
  })
  return { expense, income, balance: income - expense }
}

function byCategory(records, key, type) {
  const rows = records.filter(record => inMonth(record, key) && record.type === type)
  const total = rows.reduce((sum, record) => sum + record.cents, 0)
  const map = {}
  rows.forEach(record => {
    map[record.category] = (map[record.category] || 0) + record.cents
  })
  return Object.keys(map)
    .map(category => ({
      category,
      amount: map[category],
      ratio: total ? map[category] / total : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
}

// 上月为 0 时返回 null，绝不产生 Infinity
function momChange(current, previous) {
  if (!previous) return null
  return (current - previous) / previous
}

function sortByTsDesc(records) {
  return records
    .slice()
    .sort((a, b) => b.ts - a.ts || (b.createdAt || 0) - (a.createdAt || 0))
}

module.exports = {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  CATEGORY_ICON,
  categoriesOf,
  toCents,
  formatCents,
  monthOf,
  monthLabel,
  shiftMonth,
  dateStr,
  dateTs,
  summarize,
  byCategory,
  momChange,
  sortByTsDesc,
}
