// point.js
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    goodsList: [],
  },
  // 数据缓存区
  store: {
    url: {
      // 积分详情
      pointUrl: app.globalData.isDebug ? 'orderList' : '/wechatapp/point/goodslist',
    },
    count: 10,
    page: 1,
    noMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    let _this = this;

    wx.showLoading({
      mask: true,
    })
    _this._getInfo();
  },
  _getInfo(){
    let _this = this;

    app.ApiConfig.ajax(_this.store['url'].pointUrl + '?page=' + _this.store['page'] + '&count=' + _this.store['count'], function (res) {
      if (res.success) {
        _this.setData({
          userInfo: res.data.user_info,
        })
        if (res.data.goods_list){
          _this.setData({
            goodsList: _this.data.goodsList.concat(res.data.goods_list)
          });
          _this.store['page']++;
        }else{
          _this.store['noMore'] = true;
        }
        wx.hideLoading();
      }
    })
  },
  // 到底自动加载
  onReachBottom: function () {
    if (!this.store['noMore']){
      wx.showLoading({
        title: "加载中"
      });
      this._getInfo();
    }
  },
})