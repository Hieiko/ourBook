// 所有 wx 读写都收在这里，页面只跟它打交道
const KEY_LEDGER = 'ledger'

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const ledger = {
  list() {
    return wx.getStorageSync(KEY_LEDGER) || []
  },
  add(record) {
    const rows = this.list()
    rows.push(record)
    wx.setStorageSync(KEY_LEDGER, rows)
    return record
  },
  update(id, patch) {
    const rows = this.list()
    const index = rows.findIndex(row => row.id === id)
    if (index === -1) return null
    rows[index] = Object.assign({}, rows[index], patch, { id })
    wx.setStorageSync(KEY_LEDGER, rows)
    return rows[index]
  },
  remove(id) {
    wx.setStorageSync(KEY_LEDGER, this.list().filter(row => row.id !== id))
  },
  replaceAll(rows) {
    wx.setStorageSync(KEY_LEDGER, Array.isArray(rows) ? rows : [])
  },
}

module.exports = { genId, ledger }
