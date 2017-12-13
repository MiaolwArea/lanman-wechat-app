// shoppingCart.js
// 获取应用实例
var app = getApp()
import { formatNum } from '../../../utils/util'

let pageConfig = {
  data: {
    username: '',     // 收货人
    phone: '',        // 联想电话
    adressInfo: '',   // 收货地址
    goodsList: [],    // 商品列表
    keziGoods: [],    // 刻字商品
    goodsPrice: 0,    // 商品金额
    inclistNum: '',   // 换购商品数量
    discountPrice: 0, // 抵用金额
    freight: 0,       // 运费
    finalPrice: 0,    // 实付金额
    textAreaInfo: '', // 文本域内容
    showMark: false,  // 是否显示刻字框
    disTextarea: false,
    keziTxt: '不刻字',
    keziTxtInfo: []
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
    keziInfo: [],
    isKezi: false
  },
  onLoad(opt){
    let _this = this
      , incpriceIdsAry = []
      , incpriceIds = wx.getStorageSync('incpriceIds') || {};

    _this.store['cartId'] = opt.cart_id || '';
    if (_this.store['cartId'] == '') {
      Object.keys(incpriceIds).forEach((attr, index) => {
        incpriceIdsAry.push(attr);
      });
      _this.store['incpriceId'] = incpriceIdsAry.join(',');
    }
    
    // 地址授权询问
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.address']) {
          wx.authorize({
            scope: 'scope.address',
            success(res) {}
          })
        }
      }
    })
  },
  onShow: function () {
    let _this = this;
    
    _this._getShoppingCartUrl({
      cart_id: _this.store['cartId'],
      incprice_id: (_this.store['cartId'] ? '' : _this.store['incpriceId']),
      address_id: _this.store['addressId']
    });
  },
  _getShoppingCartUrl(data){
    let _this = this
      , dataInfo = data || {};

    wx.showLoading();
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
        // 刻字信息初始化
        let keziTxtInfoAry = [];

        if (_this.store['keziInfo'].length == 0){
          for (let i = 0; i < dataInfo.kezi_goods.length; i++) {
            _this.store['keziInfo'].push({
              color_name: dataInfo.kezi_goods[i].color_name,
              info: ""
            })
            keziTxtInfoAry.push("");
          }
        }
        
        // 数据初始化
        _this.setData({
          'goodsList': dataInfo.goods_list,
          'keziGoods': dataInfo.kezi_goods,
          'keziTxtInfo': keziTxtInfoAry,
          'freight': parseFloat(dataInfo.freight) || 0,
          'discountPrice': formatNum(parseFloat(dataInfo.discount) || 0)
        });
        _this._countPrice();
      }else{
        wx.showToast({
          title: res.msg,
          duration: 1000,
          icon: 'loading',
          mask: true
        })
        setTimeout(function () {
          wx.navigateBack({
            delta: 1
          })
        }, 1000)
      }
      wx.hideLoading();
    }, 'POST');
  }, 
  // 计算金额
  _countPrice() {
    let _this = this
      , goodsList = _this.data.goodsList
      , goodsPrice = 0
      , idAry = wx.getStorageSync('incpriceInfo');
    
    for (let i = 0; i < goodsList.length; i++) {
      goodsPrice += parseInt(goodsList[i].goods_num) * parseFloat(goodsList[i].shop_price);
    }
    goodsPrice = goodsPrice + (idAry['price'] || 0);
    _this.setData({
      goodsPrice: formatNum(goodsPrice),
      inclistNum: (idAry['num'] || ''),
      finalPrice: formatNum(goodsPrice - _this.data.freight - _this.data.discountPrice)
    })
  },
  // 长按留言
  TextAreaLong(){
    this.setData({
      disTextarea: false
    })
  },
  bindTextAreaBlur(e) {
    this.setData({
      textAreaInfo: e.detail.value,
      disTextarea: true
    })
  },
  // 输入优惠码，改变抵用金额
  getCode(e){
    let _this = this
      , code = e.detail.value;

    app.ApiConfig.ajax(_this.store['url'].shoppingCartUrl, {
      code: code
    }, function (res) {
      if (res.success) {
        let dataInfo = res.data;

        _this.setData({
          'discountPrice': formatNum(parseFloat(dataInfo.discount) || 0)
        });
        _this.store['code'] = code;
      }else{
        wx.showToast({
          title: res.msg,
          duration: 1000,
          icon: 'loading',
          mask: true
        });
        _this.store['code'] = '';
      }
    }, 'POST');
  },
  // 刻字弹窗事件
  mark(){
    this.setData({
      showMark: !this.data.showMark,
      disTextarea: true
    });
  },
  cancel(){
    this.setData({
      showMark: false,
      keziTxt: '不刻字',
      disTextarea: false
    });
    this.store['isKezi'] = false;
  },
  textBlur(e){
    let _this = this
      , index = e.currentTarget.dataset.index;
    
    _this.store['keziInfo'][index].info = e.detail.value;
  },
  radioChange(e){
    let _this = this
      , index = e.currentTarget.dataset.index
      , keziInfo = _this.store['keziInfo']
      , keziTxtInfo = _this.data.keziTxtInfo;

    if (e.detail.value == 'true') {
      keziInfo[index].info = keziTxtInfo[index] = '♡' + keziInfo[index].info + '♡';
    } else if (e.detail.value == 'false'){console.log(23)
      keziInfo[index].info = keziTxtInfo[index] = keziInfo[index].info.replace(/♡/g, '');
    }
    _this.setData({
      keziTxtInfo: keziTxtInfo
    })
  },
  keziSure(){
    this.setData({
      showMark: false,
      keziTxt: '已刻字',
      disTextarea: false
    });
    this.store['isKezi'] = true;
  },
  // 付款
  payWechat(e) {
    let _this = this;

    wx.showLoading({
      mask: true
    });
    // 调用微信支付接口
    wx.login({
      success: function (res) {
        if (res.code) {
          app.ApiConfig.ajax(_this.store['url'].addOrderUrl, {
            address_id: _this.data.addressId,
            memo: _this.data.textAreaInfo + (_this.store['isKezi'] ? '|' + JSON.stringify(_this.store['keziInfo']) : ''),
            incprice_id: _this.store['incpriceId'],
            code: _this.store['code']
          }, function(res){
            wx.hideLoading();
            if (res.success) {
              wx.requestPayment({
                'timeStamp': res.data.timeStamp.toString(),
                'nonceStr': res.data.nonceStr,
                'package': res.data.package,
                'signType': res.data.signType,
                'paySign': res.data.paySign,
                'success': function (resInfo) {
                  wx.redirectTo({
                    url: '../../user/order/detail/detail?order_id=' + res.data.order_id
                  })
                },
                'fail': function (resInfo) {
                  wx.showToast({
                    title: '失败',
                    icon: 'loading',
                    duration: 1000,
                    complete: function () {
                      wx.redirectTo({
                        url: '../../user/order/detail/detail?order_id=' + res.data.order_id
                      })
                    }
                  })
                }
              })
            }else{
              wx.showToast({
                title: res.msg,
                duration: 1000,
                icon: 'loading',
                mask: true
              });
              setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1000)
            }
          }, 'POST')
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
}

Page(pageConfig)
