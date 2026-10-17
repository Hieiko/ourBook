const calc = require('../../utils/calc')
const store = require('../../utils/store')

Page({
  data: {
    month: '',
    monthLabel: '',
    expenseText: '0.00',
    prevExpenseText: '0.00',
    momText: '',
    momClass: '',
    rank: [],
  },

  onLoad(options) {
    this.setData({ month: (options && options.month) || calc.monthOf(Date.now()) })
    this.compute()
  },

  compute() {
    const { month } = this.data
    const records = store.ledger.list()
    const current = calc.summarize(records, month)
    const previous = calc.summarize(records, calc.shiftMonth(month, -1))
    const mom = calc.momChange(current.expense, previous.expense)
    const rank = calc.byCategory(records, month, 'expense').map(row => ({
      category: row.category,
      amountText: calc.formatCents(row.amount),
      percent: Math.round(row.ratio * 100),
      width: Math.max(2, Math.round(row.ratio * 100)),
    }))

    this.setData({
      monthLabel: calc.monthLabel(month),
      expenseText: calc.formatCents(current.expense),
      prevExpenseText: calc.formatCents(previous.expense),
      momText: mom === null ? '上月无支出' : `${mom >= 0 ? '↑' : '↓'} ${Math.abs(Math.round(mom * 100))}%`,
      momClass: mom === null ? '' : (mom >= 0 ? 'up' : 'down'),
      rank,
    })
  },

})
