// afterSalesList.js
// 获取应用实例
var app = getApp();
import { appendParamForUrl, formatTime } from '../../../utils/util';

let pageConfig = {
  data: {
    afterSalesList: null,
  },
  // 数据缓存区
  store: {
    url: {
      // 售后列表
      afterSalesListUrl: app.globalData.isDebug ? 'index' : '/wechatapp/aftersaleservice/list',
    }
  },
  onLoad: function () {
    let _this = this;

    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    wx.showLoading({
      mask: true,
    })
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].afterSalesListUrl, function (res) {
      if (res.success) {
        let data = res.data;

        for (let i = 0; i < data.length; i++) {
          data[i].add_time = formatTime(data[i].add_time, 'yyyy-MM-dd hh:mm:ss');
        };
        _this.setData({
          afterSalesList: data
        });
        wx.hideLoading();
      }
    });
  }
}

Page(pageConfig)
