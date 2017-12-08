//app.js
let API = require('./utils/api');
import { delElm } from './utils/util';

App({
  onLaunch: function () {
    this.getUserInfo();
    this.ApiConfig = API;
    this.delElm = delElm;
  },

  getUserInfo: function(cb) {
    var _this = this
    
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
                  API.setHeader({
                    sso: res.data.sso,
                    token: res.data.token 
                  });
                  _this.globalData.sso = res.data.sso;
                  _this.globalData.token = res.data.token;
                }else{
                  wx.showToast({
                    title: '快捷登入失败',
                    icon: 'loading',
                    duration: 1000
                  });
                }
              }, 'post')

              _this.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(_this.globalData.userInfo)
            }
          })
        }
      })
      
      wx.getUserInfo({
        withCredentials: false,
        success: function (res) {
          _this.globalData.userInfo = res.userInfo
          typeof cb == "function" && cb(_this.globalData.userInfo)
        }
      })
    }
  },

  globalData: {
    isDebug: false,
    userInfo: null,
    sso: '',
    token: ''
  }
})
