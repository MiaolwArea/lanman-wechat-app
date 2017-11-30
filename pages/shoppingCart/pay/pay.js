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
    inclistNum: '',   // 换购商品数量
    discountPrice: 0, // 抵用金额
    freight: 0,       // 运费
    finalPrice: 0,    // 实付金额
    textAreaInfo: '', // 文本域内容
  }, 
  // 数据缓存区
  store: {
    url: {
      // 下单详情
      shoppingCartUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/order/confirm',
      // 添加默认地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 下单接口
      addOrderUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
      // 获取更改金额
      changeMoneyUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
    },
    // 下单地址ID
    addressId: '',
    // 优惠码
    code: '',
    // 换购ID
    incpriceId: '',
    // 下单购物车ID
    cartId: null,
  },
  onLoad(opt){
    let _this = this;
    
    _this.store['cartId'] = opt.cart_id || '';
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
  },
  onShow: function () {
    let _this = this
      , incpriceIdsAry = []
      , incpriceIds = wx.getStorageSync('incpriceIds') || {};

    wx.showLoading();
    if (_this.store['cartId'] == ''){
      Object.keys(incpriceIds).forEach((attr, index) => {
        incpriceIdsAry.push(attr);
      });
      _this.store['incpriceId'] = incpriceIdsAry.join(',');
    }
    
    _this._getShoppingCartUrl({
      cart_id: _this.store['cartId'],
      incprice_id: (_this.store['cartId'] ? '' : _this.store['incpriceId']),
      address_id: _this.store['addressId']
    });
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
  },
  _getShoppingCartUrl(data){
    let _this = this
      , dataInfo = data || {};

    // 获取购物车详情
    app.ApiConfig.ajax(_this.store['url'].shoppingCartUrl, dataInfo, function (res) {
      if (res.success) {
        let dataInfo = res.data;

        if (!dataInfo.address) {
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
                  if (res.success) {
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
          'goodsList': dataInfo.goods_list,
          'freight': parseFloat(dataInfo.freight) || 0,
          'discountPrice': parseFloat(dataInfo.discount) || 0
        });
        _this._countPrice();
        wx.hideLoading();
      }
    }, 'POST');
  },
  // 计算金额
  _countPrice() {
    let _this = this
      , goodsList = _this.data.goodsList
      , goodsPrice = 0
      , idAry = wx.getStorageSync('incpriceInfo');
    
    for (let i = 0; i < goodsList.length; i++) {
      goodsPrice += parseInt(goodsList[i].goods_num) * parseFloat(goodsList[i].shop_price)
    }
    goodsPrice = goodsPrice + (idAry['price'] || 0);
    _this.setData({
      goodsPrice: goodsPrice,
      inclistNum: (idAry['num'] || ''),
      finalPrice: goodsPrice - _this.data.freight - _this.data.discountPrice
    })
  },
  bindTextAreaBlur(e) {
    this.setData({
      textAreaInfo: e.detail.value
    })
  },
  // 输入优惠码，改变抵用金额
  getCode(e){
    let _this = this
      , code = e.detail.value;

    _this.store['code'] = code;
    _this._getShoppingCartUrl({
      code: code
    });
  },
  payWechat(e) {
    let _this = this;

    wx.showLoading();
    // 调用微信支付接口
    wx.login({
      success: function (res) {
        if (res.code) {
          app.ApiConfig.ajax(_this.store['url'].addOrderUrl, {
            address_id: _this.data.addressId,
            memo: _this.data.textAreaInfo,
            incprice_id: _this.store['incpriceId'],
            code: _this.store['code']
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
                  url: '../../user/order/detail/detail?order_id=' + res.data.order_id
                })
              },
              'fail': function (resInfo) {
                wx.showToast({
                  title: '失败',
                  icon: 'loading',
                  duration: 1000,
                  complete: function(){
                    wx.navigateTo({
                      url: '../../user/order/detail/detail?order_id=' + res.data.order_id
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
