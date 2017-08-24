//shoppingCart.js
//获取应用实例
var app = getApp()
Page({
  data: {
    username: '',
    phone: '',
    adressInfo: ''
  },
  //事件处理函数
  bindViewTap: function() {
    
  },
  onLoad: function () {
    let _this = this;
    // 地址授权询问
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success(res) {
              wx.chooseAddress();
            }
          })
        }
      }
    })
    // 获取地址信息做为默认收货地址
    // TODO 先请求后台判断是否有默认地址，没有则Next
    wx.chooseAddress({
      success: function (res) {
        if (res.errMsg = "chooseAddress:ok"){
          _this.setData({
            'username': res.userName,
            'phone': res.telNumber,
            'adressInfo': res.provinceName + res.cityName + res.countyName + res.detailInfo
          });
          // TODO 同时存为默认地址到后台
        }
      }
    })
  }
})
