// order.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl, formatTime } from '../../../utils/util'

let pageConfig = {
  data: {
    orderList: null,
    currentTab: 0,    // tab切换 
  },
  // 数据缓存区
  store: {
    url: {
      // 订单列表
      orderListUrl: app.globalData.isDebug ? 'orderList' : '/wechatapp/order/list',
    },
    // 订单状态
    orderStatus: 0
  },
  onLoad: function (opt) {
    let _this = this;

    // order_status: 全部->0, 待付款->1, 待发货->5, 待收货->2, 已完成->3, 待评价->4
    _this.store['orderStatus'] = opt.order_status || 0;
    // 获取系统信息 
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    }); 
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 获取初始化数据 
    _this._getOrderList(_this.store['orderStatus']);
  },
  // 获取相应订单
  _getOrderList(orderStatus){
    let _this = this;

    // 全部订单
    app.ApiConfig.ajax(_this.store['url'].orderListUrl + '&order_status=' + orderStatus, function (res) {
      if (res.success) {
        let data = res.data;

        for (let i = 0; i < data.length; i++) {
          data[i].add_time = formatTime(data[i].add_time, 'yyyy.MM.dd');
        };
        _this.setData({
          orderList: data
        })
        wx.hideLoading();
      }
    });
  },
  // 点击tab切换 
  swichNav: function (e) {
    let _this = this
      , Ecurrent = e.target.dataset.current;
    
    if (_this.data.currentTab === Ecurrent) {
      return false;
    } else {
      wx.showLoading();
      _this._getOrderList(Ecurrent);
      _this.setData({
        currentTab: Ecurrent
      })
    }
  } 
}

Page(pageConfig)
