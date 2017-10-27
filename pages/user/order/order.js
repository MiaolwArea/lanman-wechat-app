// order.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl, formatTime } from '../../../utils/util'

let pageConfig = {
  data: {
    orderList: null
  },
  // 数据缓存区
  store: {
    url: {
      // 订单列表
      orderListUrl: app.globalData.isDebug ? 'orderList' : '/wechatapp/order/list',
    }
  },
  onLoad: function () {
    let _this = this;

    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].orderListUrl, function (res) {
      if (res.success) {
        let data = res.data;

        for (let i = 0; i < data.length; i++) {
          data[i].add_time = formatTime(data[i].add_time, 'yyyy.MM.dd');
        };
        _this.setData({
          orderList: data
        })
      }
    });
  }
}

Page(pageConfig)
