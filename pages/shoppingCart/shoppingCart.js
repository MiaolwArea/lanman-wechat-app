// shoppingCart.js
// 获取应用实例
var app = getApp()
import { appendParamForUrl } from '../../utils/util'

let pageConfig = {
  data: {
    startX: 0,        // 手势X轴
    startY: 0,        // 手势Y轴
    isTouchMove: [],  // 手势是否滑动
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
      // 删除商品
      delGoodsUrl: app.globalData.isDebug ? 'delGoods' : '/wechatapp/cart/del',
      // 添加默认地址
      addAddressUrl: app.globalData.isDebug ? 'addAddress' : '/wechatapp/address/add',
      // 下单接口
      addOrderUrl: app.globalData.isDebug ? 'addOrder' : '/wechatapp/order/add',
      // 修改数量
      updateNumUrl: app.globalData.isDebug ? 'updateNum' : '/wechatapp/cart/updatenum',
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
    let _this = this
      , isTouchMoveAry = [];

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
                  mobile: '17623418273' || res.telNumber
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
        isTouchMoveAry = new Array(dataInfo.goods_list.length).fill(false);
        _this.setData({
          'goodsList': dataInfo.goods_list,
          'isTouchMove': isTouchMoveAry
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
  // 数量加减, 修改
  minusNum(e) {
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = --_this.data.goodsList[index].goods_num;

    if (num < 1) {
      num = 1;
    }
    wx.showLoading();
    _this._updateNum(index, id, num);
  },
  plusNum(e) {
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = ++_this.data.goodsList[index].goods_num;

    wx.showLoading();
    _this._updateNum(index, id, num);
  },
  inputNum(e){
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = e.detail.value;

    wx.showLoading();
    _this._updateNum(index, id, num);
  },
  // 更新到后台
  _updateNum(index, id, num){
    let _this = this
      , goodsList = _this.data.goodsList;

    app.ApiConfig.ajax(_this.store['url'].updateNumUrl, {
      bn_goods_id: id,
      goods_num: num
    }, function (res) {
      if (res.success) {
        goodsList[index].goods_num = num;
        _this.setData({
          "goodsList": goodsList
        });
        _this._countPrice();
        wx.hideLoading();
      }
    }, 'POST')
  },
  // 删除商品
  delGoods(e) {
    let id = e.target.dataset.id
      , _this = this
      , goodsList = _this.data.goodsList
      , isTouchMoveAry = [];

    wx.showModal({
      title: '',
      content: '确定删除该商品吗？',
      confirmColor: "#a3a3a3",
      success: function (res) {
        if (res.confirm) {
          // 更新到后台
          app.ApiConfig.ajax(_this.store['url'].delGoodsUrl, {
            bn_goods_id: id
          }, function (res) {
            if (res.success) {
              goodsList = app.delElm({ bn_goods_id: id }, goodsList);
              isTouchMoveAry = new Array(goodsList.length).fill(false);
              _this.setData({
                'goodsList': goodsList,
                'isTouchMove': isTouchMoveAry
              });
              _this._countPrice();
            }
          }, 'POST')
        } else if (res.cancel) {
          return;
        }
      }
    })
  },
  // 滑动删除
  // 手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY
    })
  },
  // 滑动事件处理
  touchmove: function (e) {
    var _this = this
      , index = e.currentTarget.dataset.index // 当前索引
      , startX = _this.data.startX  // 开始X坐标
      , startY = _this.data.startY  // 开始Y坐标
      , touchMoveX = e.changedTouches[0].clientX  // 滑动变化坐标
      , touchMoveY = e.changedTouches[0].clientY  // 滑动变化坐标
      , angle = _this._angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY }) // 获取滑动角度
      , isTouchMoveAry = _this.data.isTouchMove;

    for (let i = 0; i < isTouchMoveAry.length; i++) {
      isTouchMoveAry[i] = false;
      // 滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index) {
        if (touchMoveX > startX) // 右滑
          isTouchMoveAry[i] = false
        else // 左滑
          isTouchMoveAry[i] = true
      }
    }
    // 更新数据
    _this.setData({
      isTouchMove: isTouchMoveAry
    })
  },
  // 计算滑动角度
  _angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    // 返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  // 计算金额
  _countPrice() {
    let _this = this
      , goodsList = this.data.goodsList
      , goodsPrice = 0
      , finalPrice = 0;

    for (let i = 0; i < goodsList.length; i++) {
      goodsPrice += parseInt(goodsList[i].goods_num) * parseFloat(goodsList[i].shop_price)
    }
    finalPrice = goodsPrice - _this.data.discountPrice;
    _this.setData({
      goodsPrice: goodsPrice,
      finalPrice: finalPrice
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
