// 零依赖自检：node tests/calc.test.js
const assert = require('assert')
const calc = require('../utils/calc')

let checks = 0
const eq = (actual, expected, label) => {
  assert.strictEqual(actual, expected, label)
  checks++
}
const deep = (actual, expected, label) => {
  assert.deepStrictEqual(actual, expected, label)
  checks++
}

// 分类：常用支出要齐全，且不能重名
eq(calc.EXPENSE_CATEGORIES.length, 20, '支出分类数量')
deep(
  calc.EXPENSE_CATEGORIES.slice(11, 19),
  ['缴费', '美容', '充值', '通讯', '宠物', '旅行', '运动', '数码'],
  '新增支出分类'
)
eq(new Set(calc.EXPENSE_CATEGORIES).size, calc.EXPENSE_CATEGORIES.length, '支出分类不重复')

// 金额：字符串 -> 分，拒绝非法输入
eq(calc.toCents('12.34'), 1234, '两位小数')
eq(calc.toCents('12'), 1200, '整数')
eq(calc.toCents('0.1'), 10, '一位小数')
eq(calc.toCents('  8.5 '), 850, '前后空格')
eq(calc.toCents(''), null, '空串')
eq(calc.toCents('abc'), null, '非数字')
eq(calc.toCents('1.234'), null, '超过两位小数')
eq(calc.toCents('-5'), null, '负数')
eq(calc.toCents(null), null, 'null')

// 分 -> 展示
eq(calc.formatCents(1234), '12.34', '整数元角分')
eq(calc.formatCents(5), '0.05', '不足一元')
eq(calc.formatCents(0), '0.00', '零')
eq(calc.formatCents(-1234), '-12.34', '负结余')

// 0.1 + 0.2 不能出现浮点尾数
eq(calc.formatCents(calc.toCents('0.1') + calc.toCents('0.2')), '0.30', '浮点误差')

// 月份
eq(calc.monthOf(calc.dateTs('2026-10-17')), '2026-10', '取月份')
eq(calc.monthLabel('2026-10'), '2026年10月', '月份文案')
eq(calc.shiftMonth('2026-01', -1), '2025-12', '跨年往前')
eq(calc.shiftMonth('2026-12', 1), '2027-01', '跨年往后')
eq(calc.dateStr(calc.dateTs('2026-10-05')), '2026-10-05', '日期往返')

const oct03 = calc.dateTs('2026-10-03')
const oct05 = calc.dateTs('2026-10-05')
const oct20 = calc.dateTs('2026-10-20')
const nov01 = calc.dateTs('2026-11-01')

const records = [
  { id: 'a', type: 'expense', cents: 1234, ts: oct05, category: '餐饮' },
  { id: 'b', type: 'expense', cents: 766, ts: oct03, category: '交通' },
  { id: 'c', type: 'income', cents: 500000, ts: oct20, category: '工资' },
  { id: 'd', type: 'expense', cents: 9999, ts: nov01, category: '购物' },
]

// 月度汇总：跨月记录不能串进来
const sum = calc.summarize(records, '2026-10')
eq(sum.expense, 2000, '本月支出')
eq(sum.income, 500000, '本月收入')
eq(sum.balance, 498000, '本月结余')

// 分类聚合：排序 + 占比
const rank = calc.byCategory(records, '2026-10', 'expense')
deep(rank.map(row => row.category), ['餐饮', '交通'], '按金额降序')
eq(rank[0].amount, 1234, '首位金额')
eq(Math.round(rank[0].ratio * 100), 62, '首位占比')
eq(Math.round(rank[1].ratio * 100), 38, '次位占比')

// 空月份不能炸
deep(calc.summarize(records, '2030-01'), { expense: 0, income: 0, balance: 0 }, '空月份汇总')
deep(calc.byCategory(records, '2030-01', 'expense'), [], '空月份排行')

// 环比：上月为 0 返回 null，不产生 Infinity
eq(calc.momChange(2000, 0), null, '上月为 0')
eq(calc.momChange(1500, 1000), 0.5, '上涨')
eq(calc.momChange(500, 1000), -0.5, '下降')

// 排序：新的在前
deep(calc.sortByTsDesc(records).map(row => row.id), ['d', 'c', 'a', 'b'], '按时间倒序')

console.log(`calc.test.js 通过：${checks} 项断言`)
