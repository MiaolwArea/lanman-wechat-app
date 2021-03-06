// afterSales-detail.js
// 获取应用实例
var app = getApp()
import { formatTime } from '../../../../utils/util'

let pageConfig = {
  data: {
    afterSalesDetail: null
  },
  // 数据缓存区
  store: {
    url: {
      // 售后详情
      afterSalesDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/aftersaleservice/detail',
    },
    // 售后ID
    feedbackId: null,
    shippingName: '',
    invoiceNo: ''
  },
  onLoad: function (opt) {
    let _this = this;
    _this.store['feedbackId'] = opt.feedback_id;

    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].afterSalesDetailUrl + '?feedback_id=' + _this.store['feedbackId'], function (res) {
      if (res.success) {
        let dataInfo = res.data;

        dataInfo.add_time = formatTime(dataInfo.add_time, 'yyyy-MM-dd hh:mm:ss');
        _this.setData({
          afterSalesDetail: dataInfo
        })
      }
    });
  },
  getCompany(e){
    this.store['shippingName'] = e.detail.value;
  },
  getCode(e) {
    this.store['invoiceNo'] = e.detail.value;
  },
  linkLogistics(){
    if (this.store['invoiceNo']){
      wx.redirectTo({
        url: '../../../logistics/logistics?shipping_name=' + this.store['shippingName'] + '&invoice_no=' + this.store['invoiceNo'],
      })
    }else{
      wx.showToast({
        title: '请输入信息',
        icon: 'loading'
      })
    }
  }
}

Page(pageConfig)
