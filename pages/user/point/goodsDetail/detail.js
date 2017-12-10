// point-goods-detail.js
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    pointGoodsDetail: null
  },
  // 数据缓存区
  store: {
    url: {
      // 积分详情
      pointGoodsDetailUrl: app.globalData.isDebug ? 'pointGoodsDetail' : '/wechatapp/point/goodsdetail',
      // 立即兑换
      exchangeUrl: app.globalData.isDebug ? 'exchangeUrl' : '/wechatapp/point/exchange',
    },
    pointId: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    _this.store['pointId'] = options.point_id;
    wx.showLoading({
      mask: true,
    })
    app.ApiConfig.ajax(_this.store['url'].pointGoodsDetailUrl + '?point_id=' + _this.store['pointId'], function (res) {
      if (res.success) {
        _this.setData({
          pointGoodsDetail: res.data,
        })
        wx.hideLoading();
      }
    })
  },
  exchange(){
    let _this = this;
    
    wx.showLoading();
    app.ApiConfig.ajax(_this.store['url'].exchangeUrl, {
      point_id: _this.store['pointId']
    }, function (res) {
      wx.hideLoading();
      if (res.success) {
        wx.showToast({
          title: res.msg,
        })
      }else{
        wx.showModal({
          content: res.msg,
          showCancel: false
        })
      }
    }, 'POST')
  }
})