const calc = require('../../utils/calc')
const store = require('../../utils/store')

// 图标网格的数据源：分类名 -> 图标 class
const cellsOf = type =>
  calc.categoriesOf(type).map(name => ({ name, icon: calc.CATEGORY_ICON[name] }))

Page({
  data: {
    month: '',
    monthLabel: '',
    summary: { expense: '0.00', income: '0.00', balance: '0.00' },
    list: [],
    type: 'expense',
    cells: [],
    form: { id: '', type: 'expense', amount: '', category: '', dateStr: '', note: '' },
    sheetVisible: false,
    focusAmount: false,
  },

  onShow() {
    if (!this.data.month) this.setData({ month: calc.monthOf(Date.now()) })
    this.refresh()
  },

  refresh() {
    const { month, type } = this.data
    const records = store.ledger.list()
    const sum = calc.summarize(records, month)
    const list = calc
      .sortByTsDesc(records.filter(record => calc.monthOf(record.ts) === month))
      .map(record => ({
        id: record.id,
        type: record.type,
        category: record.category,
        // 导入的备份可能带旧分类名，兜底成「其他」，避免空白图标
        icon: calc.CATEGORY_ICON[record.category] || 'i-other',
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
      cells: cellsOf(type),
    })
  },

  shiftMonth(e) {
    const delta = Number(e.currentTarget.dataset.delta)
    this.setData({ month: calc.shiftMonth(this.data.month, delta) }, () => this.refresh())
  },

  onType(e) {
    const type = e.currentTarget.dataset.value
    if (type === this.data.type) return
    this.setData({ type, cells: cellsOf(type) })
  },

  openSummary() {
    wx.navigateTo({ url: `/pages/summary/summary?month=${this.data.month}` })
  },

  // 点图标 = 直接记一笔，只问金额和备注
  pick(e) {
    const category = e.currentTarget.dataset.name
    this.setData({
      sheetVisible: true,
      focusAmount: true,
      form: {
        id: '',
        type: this.data.type,
        amount: '',
        category,
        dateStr: calc.dateStr(Date.now()),
        note: '',
      },
    })
  },

  openEdit(e) {
    const id = e.currentTarget.dataset.id
    const record = store.ledger.list().find(row => row.id === id)
    if (!record) return
    this.setData({
      sheetVisible: true,
      focusAmount: false,
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
    this.setData({ sheetVisible: false, focusAmount: false })
  },

  noop() {},

  onAmount(e) {
    this.setData({ 'form.amount': e.detail.value })
  },

  onNote(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  onDate(e) {
    this.setData({ 'form.dateStr': e.detail.value })
  },

  save() {
    const form = this.data.form
    const cents = calc.toCents(form.amount)
    if (cents === null || cents <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' })
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

    // 跳到这笔所属月份：改了日期或记的是上个月时，不至于「记完了却看不见」
    this.setData(
      { sheetVisible: false, focusAmount: false, month: calc.monthOf(payload.ts) },
      () => this.refresh()
    )
  },

  removeCurrent() {
    const id = this.data.form.id
    wx.showModal({
      title: '删除这笔记录？',
      content: '删除后无法恢复',
      success: res => {
        if (!res.confirm) return
        store.ledger.remove(id)
        this.setData({ sheetVisible: false, focusAmount: false })
        this.refresh()
      },
    })
  },
})
