// user.js
// 获取应用实例
var app = getApp();

let pageConfig = {
  data: {
    userInfo: {},
    recommend: null,
    isDebug: false
  },
  // 数据缓存区
  store: {
    url: {
      // 推荐列表
      indexUrl: app.globalData.isDebug ? 'index' : '/wechatapp/my/index',
    }
  },
  onLoad: function () {
    let _this = this;

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
   
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].indexUrl, function (res) {
      if (res.success) {
        _this.setData({
          recommend: res.data.recommend
        });
      }
    });
  },
  // 清除缓存
  clearCache(){
    wx.showModal({
      title: '清楚缓存',
      content: '注意！此操作会清空所有缓存操作记录！',
      cancelColor: '#808080',
      confirmColor: '#000',
      success: function (res) {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({
            title: '成功'
          })
        }
      }
    })
  }
}

Page(pageConfig)
