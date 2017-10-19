//shoppingCart.js
//获取应用实例
var app = getApp()

// let goodsDetialUrl = '/wechatapp/goods/list' 
let shoppingCartUrl = 'shoppingCart' 

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
  },
  onLoad: function () {
    let _this = this
      , isTouchMoveAry = [];

    app.ApiConfig.ajax(shoppingCartUrl, function (res) {
      if (res.success) {
        let dataInfo = res.data;

        if (!res.data.adress) {
          // 获取地址信息做为默认收货地址
          // TODO 先请求后台判断是否有默认地址，没有则Next
          wx.chooseAddress({
            success: function (res) {
              if (res.errMsg = "chooseAddress:ok") {
                _this.setData({
                  'username': res.userName,
                  'phone': res.telNumber,
                  'adressInfo': res.provinceName + res.cityName + res.countyName + res.detailInfo
                });
                // TODO 同时存为默认地址到后台
              }
            }
          })
        } else {
          _this.setData({
            'username': dataInfo.adress.user_name,
            'phone': dataInfo.adress.phone,
            'adressInfo': dataInfo.adress.adress_info
          });
        }
        for (let i = 0; i < dataInfo.goods_list.length; i++) {
          isTouchMoveAry[i] = false;
        }
        _this.setData({
          'goodsList': dataInfo.goods_list,
          'isTouchMove': isTouchMoveAry
        });
        _this._countPrice();
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
  },
  // 数量加减
  minusNum(e) {
    let index = e.target.dataset.index
      , _this = this
      , goodsList = _this.data.goodsList
      , num = --_this.data.goodsList[index].num;

    if (num < 1) {
      num = 1;
    }
    // TODO更新到后台
    goodsList[index].num = num;
    _this.setData({
      "goodsList": goodsList
    })
    _this._countPrice();
  },
  plusNum(e) {
    let index = e.target.dataset.index
      , _this = this
      , goodsList = _this.data.goodsList;

    goodsList[index].num = ++_this.data.goodsList[index].num;
    // TODO更新到后台
    _this.setData({
      "goodsList": goodsList
    })
    _this._countPrice();
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
          // TODO更新到后台
          app.ApiConfig.ajax('delGoods', function (res) {
            if (res) {
              for (let i = 0; i < res.length; i++) {
                isTouchMoveAry[i] = false;
              }
              _this.setData({
                'goodsList': res,
                'isTouchMove': isTouchMoveAry
              });
              _this._countPrice();
            }
          })
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
      , angle = _this.angle({ X: startX, Y: startY }, { X: touchMoveX, Y: touchMoveY }) // 获取滑动角度
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
  angle: function (start, end) {
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
      goodsPrice += parseInt(goodsList[i].num) * parseFloat(goodsList[i].pirce)
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
  payWechat() {
    app.ApiConfig.ajax('payOrder', {
      textAreaInfo: this.data.textAreaInfo
    }, function (res) {

    })
    // TODO调用微信支付接口
    wx.login({
      success: function (res) {
        if (res.code) {
          //发起网络请求, 开发者服务器使用登录凭证 code 获取 openid
          // wx.request({
          //   url: 'https://yourwebsit/onLogin',
          //   method: 'POST',
          //   data: {
          //     code: res.code
          //   },
          //   success: function (res) {
          //     var openid = res.data.openid;
          //   },
          //   fail: function (err) {
          //     console.log(err)
          //   }
          // })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    });
  }
}

Page(pageConfig)
