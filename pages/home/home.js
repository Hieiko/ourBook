// 自定义导航：背景图要顶到状态栏，得自己按状态栏高度让出标题栏
const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
const statusBarHeight = win.statusBarHeight || 20

Page({
  data: {
    statusBarHeight,
    navHeight: statusBarHeight + 44,
  },

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
