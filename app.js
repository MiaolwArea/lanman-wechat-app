//app.js
let API = require('./utils/api');

App({
  onLaunch: function() {
    this.getUserInfo();
    this.ApiConfig = API;
  },

  getUserInfo: function(cb) {
    var that = this
    
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function (res) {
          let code = res.code
          wx.getUserInfo({
            withCredentials: false,
            success: function (res) {
              API.ajax('/wechatapp/user/quicklogin', {
                code: code,
                userInfo: res.userInfo
              }, function (res) {}, 'post')

              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          that.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(that.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    userInfo: null
  }
})
