Component({
  data: {
    selected: 0,
    list: [
      { pagePath: '/pages/home/home', text: '首页', icon: 'home' },
      { pagePath: '/pages/mine/mine', text: '我的', icon: 'mine' },
    ],
  },

  methods: {
    onTap(e) {
      const index = e.currentTarget.dataset.index
      const item = this.data.list[index]
      if (!item || index === this.data.selected) return
      wx.switchTab({ url: item.pagePath })
    },
  },
})
