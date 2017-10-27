// order_detail.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl } from '../../../../utils/util'

let pageConfig = {
  data: {
    orderDetail: null
  },
  // 数据缓存区
  store: {
    url: {
      // 订单详情
      orderDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/order/detail',
    },
    // 订单ID
    orderId: null
  },
  onLoad: function (opt) {
    let _this = this;
    _this.store['orderId'] = opt.order_id;

    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].orderDetailUrl + '&order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        _this.setData({
          orderDetail: res.data
        })
      }
    });
  }
}

Page(pageConfig)
