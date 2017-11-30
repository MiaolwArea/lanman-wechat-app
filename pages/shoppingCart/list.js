// shoppingCart-list.js
// 获取应用实例
var app = getApp();
import { appendParamForUrl } from '../../utils/util';

let pageConfig = {
  data: {
    isTouchMove: [],      // 手势是否滑动
    hasGoods: true,       // 购物车商品是否为空
    shoppingCart: null,   // 购物车数据
    goodsPrice: 0,        // 商品金额
    discountPrice: 0,     // 抵用金额
    idAryMap: {},         // 选中
    hasChoose: false,     // 下单按钮点击控制
    inclistText: ''
  }, 
  // 数据缓存区
  store: {
    url: {
      // 购物车详情
      shoppingCartUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/cart/index',
      // 删除商品
      delGoodsUrl: app.globalData.isDebug ? 'delGoods' : '/wechatapp/cart/del',
      // 修改数量
      updateNumUrl: app.globalData.isDebug ? 'updateNum' : '/wechatapp/cart/updatenum',
      // 选择商品
      chooseChangeUrl: app.globalData.isDebug ? 'chooseChange' : '/wechatapp/cart/selected'
    },
    startX: 0,        // 手势X轴
    startY: 0,        // 手势Y轴
    goodsListNum: 0,
    chooseLength: [],
  },
  onLoad(){
    let _this = this;

    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
  },
  onShow(){
    let _this = this
      , isTouchMoveAry = [];
    
    // 购物车信息
    wx.showLoading({
      mask: true
    });
    app.ApiConfig.ajax(_this.store['url'].shoppingCartUrl, function (res) {
      if (res.success) {
        let goods_list = res.data.goods_list
          , idAry = {};

        wx.hideLoading();
        _this.store['goodsListNum'] = goods_list.length;
        if (goods_list.length == 0) {
          _this.setData({
            hasGoods: false
          });
          return;
        }else{
          _this.setData({
            hasGoods: true
          });
        }
        for (let i = 0; i < goods_list.length; i++) {
          isTouchMoveAry[i] = false;
          if (goods_list[i].is_selected){
            _this.store['chooseLength'].push(goods_list[i].cart_id)
          }
        }
        _this.setData({
          shoppingCart: res.data,
          isTouchMove: isTouchMoveAry
        });
        _this._checkedStatus(res.data.select_ids);
        _this._countPrice();
      }
    })
  },
  // 选中状态
  _checkedStatus(aryObj){
    let _this = this
      , isAddOrder = false
      , isAllChecked = true
      , idAryMap = {};
    
    Object.keys(aryObj).forEach((attr, index) => {
      if (aryObj[attr]) {
        isAddOrder = true
      } else {
        isAllChecked = false
      }
    });
    
    idAryMap['isSelected'] = aryObj;
    idAryMap['all'] = isAllChecked;
    idAryMap['incpriceInfo'] = wx.getStorageSync('incpriceInfo');
    _this.setData({
      hasChoose: isAddOrder,
      idAryMap: idAryMap,
      inclistText: (idAryMap['incpriceInfo']['num'] ? '已换购' + idAryMap['incpriceInfo']['num'] + '件' : _this.data.shoppingCart.inc_title)
    }); 
  },
  // 单选
  changeSelected(e){
    let _this = this
      , idAryMap = _this.data.idAryMap
      , cartId = e.currentTarget.dataset['cart_id']
      , isSelected = e.currentTarget.dataset['selected'];
    
    idAryMap['all'] = (_this.store['chooseLength'].length == _this.store['goodsListNum'])
    _this.setData({
      idAryMap: idAryMap
    });
    _this._postChangeSelected(cartId, !isSelected);
  },
  // 勾选提交后台
  _postChangeSelected(cardId, isSelected){
    let _this = this
      , idAryMap = _this.data.idAryMap;
    
    wx.showLoading();
    app.ApiConfig.ajax(_this.store['url'].chooseChangeUrl, {
      cart_id: cardId,
      is_selected: isSelected
    }, function (res) {
      if (res.success) {
        let dataObj = res.data;
        
        Object.keys(dataObj).forEach((attr, index) => {
          idAryMap['isSelected'][attr] = dataObj[attr]
        })
        _this.setData({
          idAryMap: idAryMap
        });
        _this._countPrice();
      }else{
        wx.showToast({
          mask: true,
          title: res.msg,
          icon: 'loading',
          duration: 1000
        })
      }
      wx.hideLoading();
    }, 'POST')
  },
  // 反选
  changeAllSelected(e){
    let _this = this
      , idAryMap = _this.data.idAryMap;
    
    idAryMap['all'] = !idAryMap['all'];
    _this.setData({
      hasChoose: idAryMap['all'],
      idAryMap: idAryMap
    });
    _this._postChangeSelected(0, _this.data.idAryMap['all']);
  },
  // 数量加减, 修改
  minusNum(e) {
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = --_this.data.shoppingCart.goods_list[index].goods_num;

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
      , num = ++_this.data.shoppingCart.goods_list[index].goods_num;

    _this._updateNum(index, id, num);
  },
  inputNum(e) {
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = e.detail.value;

    _this._updateNum(index, id, num);
  },
  // 更新到后台
  _updateNum(index, id, num) {
    let _this = this
      , shoppingCart = _this.data.shoppingCart;

    wx.showLoading({
      mask: true,
    })
    app.ApiConfig.ajax(_this.store['url'].updateNumUrl, {
      cart_id: id,
      goods_num: num
    }, function (res) {
      wx.hideLoading();
      if (res.success) {
        shoppingCart.goods_list[index].goods_num = num;
        _this.setData({
          "shoppingCart": shoppingCart
        });
        _this._countPrice();
      }else{
        wx.showToast({
          title: res.msg,
          icon: 'loading',
          duration: 1000
        })
      }
    }, 'POST')
  },
  // 删除商品
  delGoods(e) {
    let id = e.target.dataset.id
      , _this = this
      , shoppingCart = _this.data.shoppingCart
      , isTouchMoveAry = [];

    wx.showModal({
      title: '',
      content: '确定删除该商品吗？',
      confirmColor: "#a3a3a3",
      success: function (res) {
        if (res.confirm) {
          // 更新到后台
          app.ApiConfig.ajax(_this.store['url'].delGoodsUrl, {
            cart_id: id
          }, function (res) {
            if (res.success) {
              shoppingCart.goods_list = app.delElm({ cart_id: id }, shoppingCart.goods_list);
              isTouchMoveAry = new Array(shoppingCart.goods_list.length).fill(false);
              _this.setData({
                'shoppingCart': shoppingCart,
                'isTouchMove': isTouchMoveAry
              });
              if (_this.store['chooseLength'].length == 1 && _this.store['chooseLength'].indexOf(id) > -1){
                _this.setData({
                  'hasChoose': false
                });
              }
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
    this.store['startX'] = e.changedTouches[0].clientX;
    this.store['startY'] = e.changedTouches[0].clientY;
  },
  // 滑动事件处理
  touchmove: function (e) {
    var _this = this
      , index = e.currentTarget.dataset.index // 当前索引
      , startX = _this.store['startX']  // 开始X坐标
      , startY = _this.store['startY']  // 开始Y坐标
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
      'isTouchMove': isTouchMoveAry
    });
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
      , goodsList = _this.data.shoppingCart.goods_list
      , goodsPrice = 0
      , idAry = _this.data.idAryMap;
    
    for (let i = 0; i < goodsList.length; i++) {
      if (idAry['isSelected'][goodsList[i].cart_id]){
        goodsPrice += parseInt(goodsList[i].goods_num) * parseFloat(goodsList[i].shop_price)
      }
    }
    goodsPrice = goodsPrice - _this.data.discountPrice + (idAry['incpriceInfo']['price'] || 0);
    _this.setData({
      goodsPrice: goodsPrice
    })
  },
  // 下单
  addOrder(){
    let _this = this;

    if (!_this.data.hasChoose){
      return;
    }
    wx.navigateTo({
      url: './pay/pay'
    })
  },
  // 下单按钮变化
  checkboxchange(e){
    let _this = this;
    
    _this.store['chooseLength'] = e.detail.value;
    _this.setData({
      hasChoose: (e.detail.value.length > 0)
    })
  }
}

Page(pageConfig);
