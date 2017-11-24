// shoppingCart.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl } from '../../../utils/util'

let pageConfig = {
  data: {
    username: '',     // 收货人
    phone: '',        // 联想电话
    adressInfo: '',   // 收货地址
    goodsList: [],    // 商品列表
    goodsPrice: 0,    // 商品金额
    discountPrice: 0, // 抵用金额
    finalPrice: 0,    // 实付金额
    textAreaInfo: '', // 文本域内容
    inclist: '',      // 换购商品列表
    isExchange: false,// 是否开启换购
  }, 
  // 数据缓存区
  store: {
    url: {
      // 购物车详情
      shoppingCartUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/cart/index',
      // 添加默认地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 下单接口
      addOrderUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
      // 换购商品列表
      inclistUrl: app.globalData.isDebug ? 'inclist' : '/wechatapp/goods/inclist',
    },
    // 默认地址ID
    addressId: null
  },
  onLoad(){
    let _this = this;

    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
  },
  onShow: function () {
    let _this = this;
return;
    wx.showLoading(); 
    // 获取购物车详情
    app.ApiConfig.ajax(_this.store['url'].shoppingCartUrl, function (res) {
      if (res.success) {
        let dataInfo = res.data;
        
        if (!res.data.address) {
          // 获取地址信息做为默认收货地址
          // 先请求后台判断是否有默认地址，没有则Next
          wx.chooseAddress({
            success: function (res) {
              if (res.errMsg = "chooseAddress:ok") {
                _this.setData({
                  'username': res.userName,
                  'phone': res.telNumber,
                  'addressInfo': res.provinceName + res.cityName + res.countyName + res.detailInfo
                });
                // 同时存为默认地址到后台
                app.ApiConfig.ajax(_this.store['url'].addAddressUrl, {
                  city: res.cityName,
                  province: res.provinceName,
                  district: res.countyName,
                  consignee: res.userName,
                  address: res.detailInfo,
                  mobile: res.telNumber
                }, function (res) {
                  if (res.success){
                    _this.setData({
                      addressId: res.data.address_id
                    })
                  }
                }, 'POST')
              }
            }
          })
        } else {
          _this.setData({
            'username': dataInfo.address.consignee,
            'phone': dataInfo.address.mobile,
            'addressInfo': dataInfo.address.province + dataInfo.address.city + dataInfo.address.district + dataInfo.address.address,
            'addressId': dataInfo.address.address_id
          });
        }
        _this.setData({
          'goodsList': dataInfo.goods_list
        });
        _this._countPrice();
        wx.hideLoading();
      }
    })
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
    // 获取换购商品
    app.ApiConfig.ajax(_this.store['url'].inclistUrl, function (res) {
      if(res.success){
        _this.setData({
          "inclist": res.data
        });
      }
    })
  },
  bindTextAreaBlur(e) {
    this.setData({
      textAreaInfo: e.detail.value
    })
  },
  payWechat(e) {
    let _this = this;

    wx.showLoading();
    // 调用微信支付接口
    wx.login({
      success: function (res) {
        if (res.code) {
          app.ApiConfig.ajax(_this.store['url'].addOrderUrl, {
            goods_info: _this.data.goodsList,
            address_id: _this.data.addressId,
            memo: _this.data.textAreaInfo,
            incprice_id: '',
            code: ''
          }, function(res){
            wx.hideLoading();
            wx.requestPayment({
              'timeStamp': res.data.timeStamp.toString(),
              'nonceStr': res.data.nonceStr,
              'package': res.data.package,
              'signType': res.data.signType,
              'paySign': res.data.paySign,
              'success': function (resInfo) {
                wx.navigateTo({
                  url: '../user/order/detail/detail?order_id=' + res.data.order_id
                })
              },
              'fail': function (resInfo) {
                wx.showToast({
                  title: '失败',
                  icon: 'loading',
                  duration: 1000,
                  complete: function(){
                    wx.navigateTo({
                      url: '../user/order/detail/detail?order_id=' + res.data.order_id
                    })
                  }
                })
              }
            })
          }, 'POST')
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
}

Page(pageConfig)
