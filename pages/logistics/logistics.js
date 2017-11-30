// logistics.js
// 获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

let pageConfig = {
  data: {
    logisticsInfos: [],
  },
  // 数据缓存区
  store: {
    url: {
      // 商品列表
      logisticsUrl: app.globalData.isDebug ? 'homeUrl' : '/wechatapp/logistics/logistics'
    },
    loadMoreOfSeries: false,
    noMoreOfSeries: false,
    noMoreOfGoods: false,
    keyword: ''
  },
  onLoad: function () {
    let _this = this;
    
  }
}

// 合并公共配置
pageConfig = {...pageConfig, ...pageAction({
  url: '/pages/logistics/logistics'
})};

Page(pageConfig)
