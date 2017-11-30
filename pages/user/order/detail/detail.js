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
    });
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
}

Page(pageConfig)
