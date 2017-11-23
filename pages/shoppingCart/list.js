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
    hasChoose: false      // 下单按钮点击控制
  }, 
  // 数据缓存区
  store: {
    url: {
      // 购物车详情
      shoppingCartUrl: app.globalData.isDebug ? 'shoppingCart' : '/wechatapp/cart/index',
      // 删除商品
      delGoodsUrl: app.globalData.isDebug ? 'delGoods' : '/wechatapp/cart/del',
      // 修改数量
      updateNumUrl: app.globalData.isDebug ? 'updateNum' : '/wechatapp/cart/updatenum'
    },
    startX: 0,        // 手势X轴
    startY: 0,        // 手势Y轴
  },
  onLoad(){
    let _this = this
      , isTouchMoveAry = [];
    
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 购物车信息
    app.ApiConfig.ajax(_this.store['url'].shoppingCartUrl, function (res) {
      let goods_list = res.data.goods_list
        , idAry = wx.getStorageSync('idAryMap');
      
      if (goods_list.length == 0){
        _this.setData({
          hasGoods: false
        });
        return;
      }
      for (let i = 0; i < goods_list.length; i++){
        if (idAry[goods_list[i].bn_goods_id] === undefined){
          idAry[goods_list[i].bn_goods_id] = true;
        }
        isTouchMoveAry[i] = false;
      } 
      _this._checkedStatus(idAry);
      _this.setData({
        shoppingCart: res.data,
        isTouchMove: isTouchMoveAry
      });
      _this._countPrice();
    })
  },
  // 选中状态
  _checkedStatus(aryObj){
    let _this = this
      , isAddOrder = false
      , isAllChecked = true;

    Object.keys(aryObj).forEach((attr, index) => {
      if (aryObj[attr]){
        isAddOrder = true
      }else{
        isAllChecked = false
      }
    });
    aryObj['all'] = isAllChecked;
    _this.setData({
      hasChoose: isAddOrder,
      idAryMap: aryObj
    });
    wx.setStorageSync('idAryMap', aryObj);
  },
  // 单选
  changeSelected(e){
    let _this = this
      , idAryMap = _this.data.idAryMap
      , bnGoodsId = e.currentTarget.dataset['bn_goods_id'];
    
    idAryMap[bnGoodsId] = !_this.data.idAryMap[bnGoodsId];
    _this.setData({
      idAryMap: idAryMap
    });
    wx.setStorageSync('idAryMap', idAryMap);
    _this._countPrice();
  },
  // 反选
  changeAllSelected(e){
    let _this = this
      , idAryMap = _this.data.idAryMap;

    Object.keys(idAryMap).forEach((attr, index) => {
      idAryMap[attr] = !_this.data.idAryMap['all'];
    });
    _this.setData({
      idAryMap: idAryMap
    });
    wx.setStorageSync('idAryMap', idAryMap);
    if (_this.data.idAryMap['all'] === false){
      _this.setData({
        hasChoose: false
      });
    }
    _this._countPrice();
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

    wx.showLoading();
    _this._updateNum(index, id, num);
  },
  inputNum(e) {
    let index = e.target.dataset.index
      , id = e.target.dataset.id
      , _this = this
      , num = e.detail.value;

    wx.showLoading();
    _this._updateNum(index, id, num);
  },
  // 更新到后台
  _updateNum(index, id, num) {
    let _this = this
      , shoppingCart = _this.data.shoppingCart;

    app.ApiConfig.ajax(_this.store['url'].updateNumUrl, {
      bn_goods_id: id,
      goods_num: num
    }, function (res) {
      if (res.success) {
        shoppingCart.goods_list[index].goods_num = num;
        _this.setData({
          "shoppingCart": shoppingCart
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
      , shoppingCart = _this.data.shoppingCart
      , isTouchMoveAry = []
      , idAryMap = _this.data.idAryMap;

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
              shoppingCart.goods_list = app.delElm({ bn_goods_id: id }, shoppingCart.goods_list);
              isTouchMoveAry = new Array(shoppingCart.goods_list.length).fill(false);
              delete idAryMap[id];
              _this.setData({
                'shoppingCart': shoppingCart,
                'isTouchMove': isTouchMoveAry,
                'idAryMap': idAryMap
              });
              wx.setStorageSync('idAryMap', idAryMap);
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
      , shoppingCart = this.data.shoppingCart
      , goodsPrice = 0
      , idAry = wx.getStorageSync('idAryMap');

    for (let i = 0; i < shoppingCart.goods_list.length; i++) {
      if (idAry[shoppingCart.goods_list[i].bn_goods_id]){
        goodsPrice += parseInt(shoppingCart.goods_list[i].goods_num) * parseFloat(shoppingCart.goods_list[i].shop_price)
      }
    }
    goodsPrice = goodsPrice - _this.data.discountPrice;
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
      url: './pay/pay?bn_goods_id=12'
    })
  },
  // 下单按钮变化
  checkboxchange(e){
    if(e.detail.value.length != 0){
      this.setData({
        hasChoose: true
      })
    }else{
      this.setData({
        hasChoose: false
      })
    }
  }
}

Page(pageConfig);
