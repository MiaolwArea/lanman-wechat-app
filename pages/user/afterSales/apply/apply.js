// afterSales-apply.js
// 获取应用实例
var app = getApp()

let pageConfig = {
  data: {
    isSuccess: false
  },
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  }
}

Page(pageConfig)
