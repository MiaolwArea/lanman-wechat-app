// afterSales-apply.js
// 获取应用实例
var app = getApp();
import { appendParamForUrl, formatTime } from '../../../../utils/util';

let pageConfig = {
  data: {
    reasonList: [],
    goodsList: null,
    index: 0,
    feedbackType: {
      50: {
        name: '我要退款/退货',
        isSelected: true
      },
      70: {
        name: '我要换货',
        isSelected: false
      },
      90: {
        name: '我要退运费',
        isSelected: false
      },
    },
    idAryMap: {},
    isSuccess: false
  },
  // 数据缓存区
  store: {
    url: {
      // 售后原因列表
      reasonListUrl: app.globalData.isDebug ? 'index' : '/wechatapp/aftersaleservice/reasonlist',
      // 订单详情
      orderDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/order/detail',
      // 提交申请
      afterSalesAddUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/aftersaleservice/add',
    },
    feedbackReason: '',
    feedbackTypeId: 50,
    orderId: '',
    goodsAry: [],
    content: '',
    applyMoney: 0
  },
  onLoad: function (opt) {
    let _this = this
      , idAryMap = {};

    _this.store['orderId'] = opt.order_id || '';
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    wx.showLoading({
      mask: true,
    });
    app.ApiConfig.ajax(_this.store['url'].orderDetailUrl + '&order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        let data = res.data;

        for(let i = 0; i < data.goods.length; i++){
          idAryMap[data.goods[i].goods_id] = false;
        }
        _this.setData({
          goodsList: data.goods,
          idAryMap: idAryMap
        }); 
        wx.hideLoading();
      }
    });
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].reasonListUrl, function (res) {
      if (res.success) {
        let data = res.data;

        _this.setData({
          reasonList: data
        });
        _this.store['feedbackReason'] = data[0].value;
        wx.hideLoading();
      }
    });
  },
  // 数量加减, 修改
  minusNum(e) {
    let index = e.target.dataset.index
      , _this = this
      , num = --_this.data.goodsList[index].goods_num;

    if (num < 1) {
      num = 1;
    }
    _this._updateNum(index, num);
  },
  plusNum(e) {
    let index = e.target.dataset.index
      , _this = this
      , num = ++_this.data.goodsList[index].goods_num;

    _this._updateNum(index, num);
  },
  inputNum(e) {
    let index = e.target.dataset.index
      , _this = this
      , num = e.detail.value;

    _this._updateNum(index, num);
  },
  _updateNum(index, num) {
    let _this = this
      , goodsList = _this.data.goodsList;

    goodsList[index].goods_num = num;
    _this.setData({
      goodsList: goodsList
    });
  },
  // 申请类型
  chooseType(e) {
    let _this = this
      , types = e.target.dataset.type
      , feedbackTypeAry = _this.data.feedbackType;

    Object.keys(feedbackTypeAry).forEach((attr, index) => {
      feedbackTypeAry[attr].isSelected = (types == attr);
    })
    _this.setData({
      feedbackType: feedbackTypeAry
    })
    _this.store['feedbackTypeId'] = types;
  },
  // 退款原因
  bindPickerChange(e){
    let _this = this
      , index = e.detail.value;

    _this.setData({
      index: e.detail.value
    });
    _this.store['feedbackReason'] = _this.data.reasonList[e.detail.value].value;
  },
  changeSelected(e){
    let _this = this
      , goodsId = e.currentTarget.dataset['goods_id']
      , idAryMap = _this.data.idAryMap;

    idAryMap[goodsId] = !idAryMap[goodsId];
    _this.setData({
      idAryMap: idAryMap
    })
  },
  checkboxChange(){},
  checkInput(e){
    // TODO 超过最多金额
    _this.store['apply_money'] = e.detail.value;
  },
  confirmRemark(e){
    _this.store['content'] = e.detail.value;
  },
  // 提交申请
  sure(){
    let _this = this
      , idAryMap = _this.data.idAryMap
      , goodsList = _this.data.goodsList
      , goodsIds = [];

    wx.showLoading({
      mask: true
    });
    Object.keys(idAryMap).forEach((attr, index) => {
      for (let i = 0; i < goodsList.length; i++) {
        if (idAryMap[attr] && (attr == goodsList[i].goods_id)){
          goodsIds.push([goodsList[i].goods_id, goodsList[i].goods_num]);
        }
      }
    })
    app.ApiConfig.ajax(_this.store['url'].afterSalesAddUrl, {
      order_id: _this.store['orderId'],
      feedback_type: _this.store['feedbackTypeId'],
      feedback_reason: _this.store['feedbackReason'],
      apply_money: _this.store['applyMoney'],
      content: _this.store['content'],
      goods: goodsIds.toString()
    }, function (res) {
      if (res.success) {
        _this.setData({
          isSuccess: true
        })
        wx.hideLoading();
      }
    }, 'POST');
  }
}

Page(pageConfig)
