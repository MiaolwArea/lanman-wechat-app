//index.js
//获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

// 私有属性
let page = 1,
    count = 5,
    search = '';

let pageConfig = {
  data: {
    hotGoods: [],
    noMore: "false",
    moveSearch: "false",
    aaa: ''
  },
  // 数据缓存区
  store: {
    url: {
      goodsListUrl: app.globalData.isDebug ? 'hotGoods' : '/wechatapp/goods/list' 
    }
  },
  onReachBottom: function () {
    wx.showLoading({
      title: "加载中"
    });
    this.getHotGoods();
  },
  onPageScroll: function (e) {
    var _this = this;

    _this.setData({
      moveSearch: e.scrollTop >= 94 ? "true" : "false"
    })
  },
  onLoad: function () {
    let _this = this;
    
    _this.getHotGoods();
  },
  // 自定义事件
  getHotGoods: function () {
    let _this = this;

    app.ApiConfig.ajax(_this.store['url'].goodsListUrl + '?page=' + page + '&count=' + count + '&search=' + search, function (res) {
      if (res.success) {
        _this.setData({
          hotGoods: _this.data.hotGoods.concat(res.data)
        })
        page++;
      } else {
        _this.setData({
          noMore: "true"
        })
      }
      wx.hideLoading();
    });
  },
  searchInfo: function(event){
    search = event.detail;
    _this.setData({
      aaa: search
    })
  }
}

// 合并公共配置
pageConfig = {...pageConfig, ...pageAction({
  url: '/pages/index/index'
})};

Page(pageConfig)
