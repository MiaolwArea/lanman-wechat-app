// order.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl, formatTime } from '../../../utils/util'

let pageConfig = {
  data: {
    orderList: null,
    currentTab: 0,    // tab切换 
    hasOrder: true
  },
  // 数据缓存区
  store: {
    url: {
      // 订单列表
      orderListUrl: app.globalData.isDebug ? 'orderList' : '/wechatapp/order/list',
      // 取消订单
      cancelOrderUrl: app.globalData.isDebug ? 'orderList' : '/wechatapp/order/cancel',
      // 下单接口
      addOrderUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
    },
    // 订单状态
    orderStatus: 0
  },
  onLoad: function (opt) {
    let _this = this;

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
  },
  onShow(){
    let _this = this;

    // order_status: 全部->0, 待付款->1, 待发货->5, 待收货->2, 已完成->3, 待评价->4
    _this.data.currentTab == 0 ? null : _this.store['orderStatus'] = _this.data.currentTab;
    _this.setData({
      currentTab: _this.store['orderStatus']
    })
    // 获取初始化数据 
    _this._getOrderList(_this.store['orderStatus']);
  },
  // 获取相应订单
  _getOrderList(orderStatus){
    let _this = this;

    wx.showLoading({
      mask: true
    })
    // 全部订单
    app.ApiConfig.ajax(_this.store['url'].orderListUrl + '&order_status=' + orderStatus, function (res) {
      if (res.success) {
        let data = res.data;

        wx.hideLoading();
        if (data.length == 0) {
          _this.setData({
            hasOrder: false
          });
          return;
        }else{
          _this.setData({
            hasOrder: true
          });
        }
        _this.setData({
          orderList: data
        })
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
  },
  // 取消订单
  cancelOrder(e) {
    let _this = this
      , orderId = e.currentTarget.dataset.order_id;

    wx.showModal({
      title: '订单删除/取消',
      content: '确认删除/取消订单吗？',
      showCancel: true,
      cancelColor: '#808080',
      confirmColor: '#000',
      success: function (res) {
        if (res.confirm) {
          app.ApiConfig.ajax(_this.store['url'].cancelOrderUrl, {
            order_id: orderId
          }, function (res) {
            if (res.success) {
              let data = res.data;

              wx.showToast({
                title: res.msg,
                icon: 'success',
                duration: 1000
              })
              _this._getOrderList(_this.store['orderStatus']);
            }
          }, 'POST');
        }
      },
    })
  },
  // 付款
  payWechat(e) {
    let _this = this
      , orderId = e.currentTarget.dataset.order_id;

    wx.showLoading({
      mask: true
    });
    // 调用微信支付接口
    wx.login({
      success: function (res) {
        if (res.code) {
          app.ApiConfig.ajax(_this.store['url'].addOrderUrl, {
            order_id: orderId
          }, function (res) {
            wx.hideLoading();
            if (res.success) {
              wx.requestPayment({
                'timeStamp': res.data.timeStamp.toString(),
                'nonceStr': res.data.nonceStr,
                'package': res.data.package,
                'signType': res.data.signType,
                'paySign': res.data.paySign,
                'success': function (resInfo) {
                  wx.navigateTo({
                    url: './detail/detail?order_id=' + res.data.order_id
                  })
                },
                'fail': function (resInfo) {
                  wx.showToast({
                    title: '失败',
                    icon: 'loading',
                    duration: 1000,
                    complete: function () {
                      wx.navigateTo({
                        url: './detail/detail?order_id=' + res.data.order_id
                      })
                    }
                  })
                }
              })
            } else {
              wx.showToast({
                title: res.msg,
                duration: 1000,
                icon: 'loading',
                mask: true
              })
            }
          }, 'POST')
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
}

Page(pageConfig)
