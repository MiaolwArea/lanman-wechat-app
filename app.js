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
                if(res.success){
                  that.globalData.sso = '48f1X8kLmj0KTSvoT5f1y2EEFA3MSr0hHEJAVn8GbBwdVZtaTA'||res.data.sso;
                }else{
                  wx.showToast({
                    title: '快捷登入失败',
                    icon: 'loading',
                    duration: 1000
                  });
                }
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
