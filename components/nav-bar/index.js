const win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()

Component({
  properties: {
    title: { type: String, value: '' },
    back: { type: Boolean, value: false },
  },

  data: {
    statusBarHeight: win.statusBarHeight || 20,
  },

  methods: {
    goBack() {
      // 从分享卡片直接进来时没有上一页，退回首页，别让返回键点不动
      if (getCurrentPages().length > 1) wx.navigateBack()
      else wx.switchTab({ url: '/pages/home/home' })
    },
  },
})
