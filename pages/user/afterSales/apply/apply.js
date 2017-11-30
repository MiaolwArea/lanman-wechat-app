// afterSales-apply.js
// 获取应用实例
var app = getApp();
import { appendParamForUrl, formatTime } from '../../../../utils/util';

let pageConfig = {
  data: {
    reasonList: [
      {
        "value": 10,
        "cn": "退款不发货"
      },
      {
        "value": 20,
        "cn": "产品破损"
      }
    ],
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
    idAryMap: []
  },
  // 数据缓存区
  store: {
    url: {
      // 售后原因列表
      reasonListUrl: app.globalData.isDebug ? 'index' : '/wechatapp/aftersaleservice/reasonlist',
    },
    feedbackReason: '',
    feedbackTypeId: 50,
  },
  onLoad: function () {
    let _this = this;

    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // wx.showLoading({
    //   mask: true,
    // })
    // 获取初始化数据 
    // app.ApiConfig.ajax(_this.store['url'].reasonListUrl, function (res) {
    //   if (res.success) {
    //     let data = res.data;

    //     _this.setData({
    //       reasonList: data
    //     });
    //     wx.hideLoading();
    //   }
    // });
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
  checkboxChange(e){
    let _this = this;
    console.log(e)
    _this.setData({
      idAryMap: e.detail.value
    });
  }
}

Page(pageConfig)
