// logistics.js
// 获取应用实例
let app = getApp()

let pageConfig = {
  data: {
    logisticsInfos: [],
  },
  // 数据缓存区
  store: {
    url: {
      // 物流信息
      logisticsUrl: app.globalData.isDebug ? 'homeUrl' : '/wechatapp/order/express'
    },
  },
  onLoad: function (opt) {
    let _this = this;
    
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].logisticsUrl + '?shipping_name=' + opt.shipping_name + '&invoice_no=' + opt.invoice_no, function (res) {
      if (res.success) {
        let dataInfo = res.data;

        _this.setData({
          logisticsInfos: dataInfo
        })
      }else{
        wx.showModal({
          title: '查询物流',
          content: res.msg,
          confirmColor: '#000',
          showCancel: false
        })
      }
    });
  }
}

Page(pageConfig)
