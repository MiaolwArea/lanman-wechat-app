//app.js
let API = require('./utils/api');
import { delElm } from './utils/util';

App({
  onLaunch: function() {
    this.getUserInfo();
    this.ApiConfig = API;
    this.delElm = delElm;
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
              }, function (res) {
                that.globalData.sso = res.data.sso;
              }, 'post')

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
    isDebug: false,
    userInfo: null,
    sso: ''
  }
})
