const store = require('../../utils/store')

Page({
  data: {
    ledgerCount: 0,
  },

  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar) tabBar.setData({ selected: 1 })
    this.setData({ ledgerCount: store.ledger.list().length })
  },

  goLedger() {
    wx.navigateTo({ url: '/pages/ledger/ledger' })
  },

  goMeal() {
    wx.navigateTo({ url: '/pages/meal/meal' })
  },

  goLottery() {
    wx.navigateTo({ url: '/pages/lottery/lottery' })
  },

  exportData() {
    const payload = JSON.stringify({ v: 1, ledger: store.ledger.list() })
    wx.setClipboardData({
      data: payload,
      success: () => wx.showToast({ title: '备份已复制到剪贴板', icon: 'none' }),
    })
  },

  importData() {
    wx.getClipboardData({
      success: res => {
        let payload = null
        try {
          payload = JSON.parse(res.data)
        } catch (err) {
          payload = null
        }
        if (!payload || !Array.isArray(payload.ledger)) {
          wx.showToast({ title: '剪贴板里没有备份数据', icon: 'none' })
          return
        }
        wx.showModal({
          title: '导入备份',
          content: `将用 ${payload.ledger.length} 条记录覆盖当前数据，无法撤销`,
          success: modal => {
            if (!modal.confirm) return
            store.ledger.replaceAll(payload.ledger)
            this.setData({ ledgerCount: store.ledger.list().length })
            wx.showToast({ title: '导入完成', icon: 'success' })
          },
        })
      },
    })
  },
})
