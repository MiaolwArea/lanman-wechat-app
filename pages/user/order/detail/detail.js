// order_detail.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl, formatTime } from '../../../../utils/util'

let pageConfig = {
  data: {
    orderDetail: null
  },
  // 数据缓存区
  store: {
    url: {
      // 订单详情
      orderDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/order/detail',
      // 取消订单
      cancelOrderUrl: app.globalData.isDebug ? 'cancelOrder' : '/wechatapp/order/cancel',
      // 加入购物车
      addCartUrl: app.globalData.isDebug ? 'addCart' : '/wechatapp/cart/add',
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
    wx.showLoading({
      mask: true
    })
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].orderDetailUrl + '&order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        let data = res.data;

        data.add_time = formatTime(data.add_time, 'yyyy-MM-dd hh:mm:ss');
        _this.setData({
          orderDetail: data
        });
        wx.hideLoading();
      }
    });
  },
  // 取消订单
  cancelOrder(e){
    let _this = this
      , orderId = e.currentTarget.dataset.order_id;
    
    wx.showModal({
      title: '订单删除/取消',
      content: '确认删除/取消订单吗？',
      showCancel: true,
      cancelColor: '#808080',
      confirmColor: '#a3a3a3',
      success: function(res) {
        if (res.confirm) {
          app.ApiConfig.ajax(_this.store['url'].cancelOrderUrl, {
            order_id: orderId
          }, function (res) {
            if (res.success) {
              let data = res.data;

              wx.showToast({
                mask: true,
                title: res.msg,
                icon: 'success',
                duration: 1000
              })
              setTimeout(function () {
                wx.navigateBack()
              }, 1000)
            }
          }, 'POST');
        }
      },
    })
  },
  // 加入购物车 
  addCart(e) {
    let _this = this
      , cartNum = _this.data.cartNum
      , bnGoodsId = e.target.dataset.bn_goods_id || ''
      , goodsId = e.target.dataset.goods_id || ''
      , goodsType = e.target.dataset.goods_type || '';

    app.ApiConfig.ajax(_this.store['url'].addCartUrl, {
      bn_goods_id: bnGoodsId,
      goods_id: goodsId,
      goods_type: goodsType
    }, function (res) {
      if (res.success) {
        wx.switchTab({
          url: '../../../shoppingCart/list'
        })
      }
    }, 'POST');
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
                    url: '../list'
                  })
                },
                'fail': function (resInfo) {
                  wx.showToast({
                    title: '失败',
                    icon: 'loading',
                    duration: 1000,
                    complete: function () {
                      wx.navigateTo({
                        url: '../list'
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
