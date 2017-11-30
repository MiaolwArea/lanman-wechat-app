// user.js
// 获取应用实例
var app = getApp();
import { appendParamForUrl } from '../../utils/util'

let pageConfig = {
  data: {
    userInfo: {},
    recommend: null,
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
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].indexUrl, function (res) {
      if (res.success) {
        _this.setData({
          recommend: res.data.recommend
        });
      }
    });
  }
}

Page(pageConfig)
