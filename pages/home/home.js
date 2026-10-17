Page({
  onShow() {
    const tabBar = typeof this.getTabBar === 'function' ? this.getTabBar() : null
    if (tabBar) tabBar.setData({ selected: 0 })
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
})
