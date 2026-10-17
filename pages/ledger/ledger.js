const calc = require('../../utils/calc')
const store = require('../../utils/store')

const emptyForm = () => ({
  id: '',
  type: 'expense',
  amount: '',
  category: calc.EXPENSE_CATEGORIES[0],
  dateStr: calc.dateStr(Date.now()),
  note: '',
})

Page({
  data: {
    month: '',
    monthLabel: '',
    summary: { expense: '0.00', income: '0.00', balance: '0.00' },
    list: [],
    categories: calc.EXPENSE_CATEGORIES,
    form: emptyForm(),
    sheetVisible: false,
  },

  onShow() {
    if (!this.data.month) this.setData({ month: calc.monthOf(Date.now()) })
    this.refresh()
  },

  refresh() {
    const { month } = this.data
    const records = store.ledger.list()
    const sum = calc.summarize(records, month)
    const list = calc
      .sortByTsDesc(records.filter(record => calc.monthOf(record.ts) === month))
      .map(record => ({
        id: record.id,
        type: record.type,
        category: record.category,
        note: record.note,
        amountText: calc.formatCents(record.cents),
        dateText: calc.dateStr(record.ts).slice(5),
      }))

    this.setData({
      monthLabel: calc.monthLabel(month),
      summary: {
        expense: calc.formatCents(sum.expense),
        income: calc.formatCents(sum.income),
        balance: calc.formatCents(sum.balance),
      },
      list,
    })
  },

  shiftMonth(e) {
    const delta = Number(e.currentTarget.dataset.delta)
    this.setData({ month: calc.shiftMonth(this.data.month, delta) }, () => this.refresh())
  },

  openSummary() {
    wx.navigateTo({ url: `/pages/summary/summary?month=${this.data.month}` })
  },

  openNew() {
    this.setData({ sheetVisible: true, categories: calc.EXPENSE_CATEGORIES, form: emptyForm() })
  },

  openEdit(e) {
    const id = e.currentTarget.dataset.id
    const record = store.ledger.list().find(row => row.id === id)
    if (!record) return
    this.setData({
      sheetVisible: true,
      categories: record.type === 'income' ? calc.INCOME_CATEGORIES : calc.EXPENSE_CATEGORIES,
      form: {
        id: record.id,
        type: record.type,
        amount: calc.formatCents(record.cents),
        category: record.category,
        dateStr: calc.dateStr(record.ts),
        note: record.note || '',
      },
    })
  },

  closeSheet() {
    this.setData({ sheetVisible: false })
  },

  noop() {},

  onType(e) {
    const type = e.currentTarget.dataset.value
    if (type === this.data.form.type) return
    const categories = type === 'income' ? calc.INCOME_CATEGORIES : calc.EXPENSE_CATEGORIES
    this.setData({ categories, 'form.type': type, 'form.category': categories[0] })
  },

  onAmount(e) {
    this.setData({ 'form.amount': e.detail.value })
  },

  onNote(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  onDate(e) {
    this.setData({ 'form.dateStr': e.detail.value })
  },

  onCategory(e) {
    this.setData({ 'form.category': e.currentTarget.dataset.value })
  },

  save() {
    const form = this.data.form
    const cents = calc.toCents(form.amount)
    if (cents === null || cents <= 0) {
      wx.showToast({ title: '请输入正确金额', icon: 'none' })
      return
    }

    const payload = {
      type: form.type,
      cents,
      category: form.category,
      ts: calc.dateTs(form.dateStr),
      note: (form.note || '').trim(),
    }

    if (form.id) store.ledger.update(form.id, payload)
    else store.ledger.add(Object.assign({ id: store.genId(), createdAt: Date.now() }, payload))

    this.setData({ sheetVisible: false })
    this.refresh()
  },

  removeCurrent() {
    const id = this.data.form.id
    wx.showModal({
      title: '删除这笔记录？',
      content: '删除后无法恢复',
      success: res => {
        if (!res.confirm) return
        store.ledger.remove(id)
        this.setData({ sheetVisible: false })
        this.refresh()
      },
    })
  },
})
