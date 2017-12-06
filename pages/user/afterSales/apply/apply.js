// afterSales-apply.js
// 获取应用实例
var app = getApp();
import { formatTime } from '../../../../utils/util';

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
    isSuccess: false,
    exchangeGoos: false,
    priceBack: false,
    successInfo: '',
    afterSalesDetail: null
  },
  // 数据缓存区
  store: {
    url: {
      // 售后原因列表
      afterSalesListUrl: app.globalData.isDebug ? 'index' : '/wechatapp/aftersaleservice/adddata',
      // 提交申请
      afterSalesAddUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/aftersaleservice/add',
      // 申请详情
      afterSalesDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/aftersaleservice/detail',
    },
    feedbackReason: '',
    feedbackTypeId: 50,
    orderId: '',
    goodsAry: [],
    content: '',
    applyMoney: 0,
    maxMoney: 0
  },
  onLoad: function (opt) {
    let _this = this
      , idAryMap = {};

    _this.store['orderId'] = opt.order_id || '';
    wx.showLoading({
      mask: true,
    });
    // 获取初始化数据
    app.ApiConfig.ajax(_this.store['url'].afterSalesListUrl + '?order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        let data = res.data
          , goods = data.order_detail.goods;

        for (let i = 0; i < goods.length; i++){
          idAryMap[goods[i].goods_id] = false;
        }
        _this.setData({
          goodsList: goods,
          idAryMap: idAryMap,
          reasonList: data.reason_list
        }); 
        _this.store['feedbackReason'] = data.reason_list[0].value;
        wx.hideLoading();
      }
    });
  },
  // 数量加减, 修改
  // 减
  minusNum(e) {
    let index = e.target.dataset.index
      , max = e.target.dataset.max
      , _this = this
      , num = --_this.data.goodsList[index].goods_num;

    _this._checkNum(num, max);
    _this._updateNum(index, num);
  },
  // 加
  plusNum(e) {
    let index = e.target.dataset.index
      , max = e.target.dataset.max
      , _this = this
      , num = ++_this.data.goodsList[index].goods_num;

    _this._checkNum(num, max);
    _this._updateNum(index, num);
  },
  // 输入框金额
  inputNum(e) {
    let index = e.target.dataset.index
      , max = e.target.dataset.max
      , _this = this
      , num = e.detail.value;

    _this._checkNum(num, max);
    _this._updateNum(index, num);
  },
  // 验证数量
  _checkNum(num, max){
    if (num > max) {
      wx.showModal({
        content: '超过最大数量！',
        confirmColor: '#000',
        showCancel: false
      })
      return;
    }
    if (num < 1) {
      wx.showModal({
        content: '数量不能为0！',
        confirmColor: '#000',
        showCancel: false
      })
      return;
    }
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
    
    // 退货/退款 
    if (types == 50) {
      _this.setData({
        exchangeGoos: false,
        priceBack: false
      });
    }
    // 换货
    if (types == 70){
      _this.setData({
        exchangeGoos: true,
        priceBack: false
      });
      _this.store['applyMoney'] = 0;
    }
    // 退运费
    if (types == 90){
      _this.setData({
        exchangeGoos: false,
        priceBack: true
      });
    }
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
  // 选中
  changeSelected(e){
    let _this = this
      , goodsId = e.currentTarget.dataset['goods_id']
      , shopPrice = e.currentTarget.dataset['shop_price']
      , idAryMap = _this.data.idAryMap;

    idAryMap[goodsId] = !idAryMap[goodsId];
    if (idAryMap[goodsId]){
      _this.store['maxMoney'] += shopPrice
    }else{
      _this.store['maxMoney'] -= shopPrice
    }
    _this.setData({
      idAryMap: idAryMap
    })
  },
  checkboxChange(){},
  // 最多输入金额
  checkInput(e){
    let _this = this;
    
    // 超过最多金额
    if (e.detail.value > _this.store['maxMoney'] && !_this.data.priceBack){
      wx.showModal({
        content: '不能超过最多金额！',
        confirmColor: '#000',
        showCancel: false
      });
      _this.store['applyMoney'] = 0;
      return;
    }
    _this.store['applyMoney'] = e.detail.value;
  },
  // 留言框
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
          if (goodsList[i].package){
            goodsIds.push({ "package": goodsList[i].package, "goods_num": goodsList[i].goods_num});
          }else{
            goodsIds.push([goodsList[i].goods_id, goodsList[i].goods_num]);
          }
        }
      }
    })
    app.ApiConfig.ajax(_this.store['url'].afterSalesAddUrl, {
      order_id: _this.store['orderId'],
      feedback_type: _this.store['feedbackTypeId'],
      feedback_reason: _this.store['feedbackReason'],
      apply_money: _this.store['applyMoney'],
      content: _this.store['content'],
      goods: (_this.store['feedbackTypeId'] == 90 ? '' : goodsIds)
    }, function (res) {
      if (res.success) {
        _this.setData({
          successInfo: res.msg,
          isSuccess: true
        })
        app.ApiConfig.ajax(_this.store['url'].afterSalesDetailUrl + '?feedback_id=' + res.data, function(res){
          let dataInfo = res.data;

          dataInfo.add_time = formatTime(dataInfo.add_time, 'yyyy-MM-dd hh:mm:ss');
          _this.setData({
            afterSalesDetail: dataInfo
          })
          wx.hideLoading();
        })
      }
    }, 'POST');
  }
}

Page(pageConfig)
